import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getStripe,
  getStripeWebhookSecret,
  isStripeConfigured,
  isStripeWebhookConfigured,
} from "@/lib/stripe";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { SubscriptionPlan } from "@/lib/types";
import {
  sendSubscriptionCancelledEmail,
  sendSubscriptionPaymentFailedEmail,
  sendSubscriptionWelcomeEmail,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isStripeConfigured || !isStripeWebhookConfigured) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured on the server." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${(err as Error).message}`,
      },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Acknowledge anything we don't explicitly handle.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[stripe webhook] handler for ${event.type} failed`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) return;
  if (!isSupabaseAdminConfigured) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id
  );

  const meta = subscription.metadata ?? session.metadata ?? {};
  const studentEmail = (
    meta.student_email ||
    session.customer_details?.email ||
    session.customer_email ||
    ""
  ).toLowerCase();
  const studentName =
    meta.student_name || session.customer_details?.name || "";
  const plan = (meta.plan as SubscriptionPlan | undefined) ?? "basic";

  await upsertSubscription(subscription, {
    studentEmail,
    studentName,
    plan,
  });

  if (studentEmail) {
    try {
      await sendSubscriptionWelcomeEmail({
        studentEmail,
        studentName,
        plan,
      });
    } catch (err) {
      console.error("[stripe webhook] welcome email failed", err);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!isSupabaseAdminConfigured) return;
  // For ongoing updates we don't usually have customer_details, so fall back to
  // the row that checkout.session.completed already created.
  const existing = await findSubscriptionRow(subscription.id);
  await upsertSubscription(subscription, {
    studentEmail: existing?.student_email ?? "",
    studentName: existing?.student_name ?? "",
    plan: (existing?.plan as SubscriptionPlan) ?? "basic",
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!isSupabaseAdminConfigured) return;
  const existing = await findSubscriptionRow(subscription.id);
  const admin = createServerSupabaseClient();
  await admin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscription.id);

  if (existing?.student_email) {
    try {
      await sendSubscriptionCancelledEmail({
        studentEmail: existing.student_email,
        studentName: existing.student_name ?? "",
      });
    } catch (err) {
      console.error("[stripe webhook] cancellation email failed", err);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!isSupabaseAdminConfigured) return;
  const subId = extractSubscriptionId(invoice);
  if (!subId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subId);
  const existing = await findSubscriptionRow(subId);
  await upsertSubscription(subscription, {
    studentEmail: existing?.student_email ?? "",
    studentName: existing?.student_name ?? "",
    plan: (existing?.plan as SubscriptionPlan) ?? "basic",
    forceStatus: "active",
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!isSupabaseAdminConfigured) return;
  const subId = extractSubscriptionId(invoice);
  if (!subId) return;

  const existing = await findSubscriptionRow(subId);
  const admin = createServerSupabaseClient();
  await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subId);

  if (existing?.student_email) {
    try {
      await sendSubscriptionPaymentFailedEmail({
        studentEmail: existing.student_email,
        studentName: existing.student_name ?? "",
      });
    } catch (err) {
      console.error("[stripe webhook] payment failed email failed", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SubscriptionRow = {
  student_email: string;
  student_name: string | null;
  plan: string | null;
};

async function findSubscriptionRow(
  stripeSubscriptionId: string
): Promise<SubscriptionRow | null> {
  if (!isSupabaseAdminConfigured) return null;
  const admin = createServerSupabaseClient();
  const { data } = await admin
    .from("subscriptions")
    .select("student_email, student_name, plan")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  return (data as SubscriptionRow) ?? null;
}

function extractSubscriptionId(invoice: Stripe.Invoice): string | null {
  // `subscription` was removed from the Stripe.Invoice type in newer SDK
  // versions but the field is still present at runtime for billing webhooks.
  const raw = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
  };
  if (typeof raw.subscription === "string") return raw.subscription;
  return raw.subscription?.id ?? null;
}

async function upsertSubscription(
  subscription: Stripe.Subscription,
  fallback: {
    studentEmail: string;
    studentName: string;
    plan: SubscriptionPlan;
    forceStatus?: "active";
  }
) {
  const admin = createServerSupabaseClient();
  const meta = subscription.metadata ?? {};
  const studentEmail = (
    meta.student_email ||
    fallback.studentEmail ||
    ""
  ).toLowerCase();
  const studentName = meta.student_name || fallback.studentName || "";
  const plan = (meta.plan as SubscriptionPlan | undefined) ?? fallback.plan;

  const periodEnd = (
    subscription as unknown as { current_period_end?: number }
  ).current_period_end;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const row = {
    student_email: studentEmail,
    student_name: studentName,
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: fallback.forceStatus ?? mapStatus(subscription.status),
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
  };

  const { error } = await admin
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

function mapStatus(
  s: Stripe.Subscription.Status
): "active" | "cancelled" | "past_due" {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
    case "incomplete_expired":
    case "unpaid":
      return "cancelled";
    case "past_due":
    case "incomplete":
    default:
      return "past_due";
  }
}
