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
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
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
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice
        );
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

  await upsertSubscription(subscription, session);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!isSupabaseAdminConfigured) return;
  await upsertSubscription(subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!isSupabaseAdminConfigured) return;
  const admin = createServerSupabaseClient();
  await admin
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!isSupabaseAdminConfigured) return;
  // `subscription` was removed from the Stripe.Invoice type in newer SDK versions
  // but the field is still present at runtime for billing webhooks.
  const raw = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
  };
  const subId =
    typeof raw.subscription === "string"
      ? raw.subscription
      : raw.subscription?.id ?? null;
  if (!subId) return;

  const admin = createServerSupabaseClient();
  await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subId);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertSubscription(
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session
) {
  const admin = createServerSupabaseClient();
  const meta = subscription.metadata ?? session?.metadata ?? {};
  const studentEmail =
    meta.student_email ||
    session?.customer_details?.email ||
    session?.customer_email ||
    "";
  const studentName = meta.student_name || session?.customer_details?.name || "";
  const plan = (meta.plan as SubscriptionPlan | undefined) ?? "basic";

  const periodEnd = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
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
    status: mapStatus(subscription.status),
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
  };

  const { error } = await admin
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

function mapStatus(s: Stripe.Subscription.Status): "active" | "cancelled" | "past_due" {
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
