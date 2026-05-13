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

  console.log(`[stripe webhook] received event=${event.type} id=${event.id}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      // Subscription events (customer.subscription.*, invoice.payment_*) are
      // ignored during the Preply pivot — bookings are charged per-class via
      // Stripe Checkout in `mode: "payment"`. Email templates and the
      // subscriptions table are retained for now.
      default:
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!isSupabaseAdminConfigured) return;

  if (session.mode !== "payment") {
    console.log("[stripe webhook] ignoring non-payment checkout", {
      session_id: session.id,
      mode: session.mode,
    });
    return;
  }

  const bookingId = session.metadata?.booking_id;
  if (!bookingId) {
    console.warn(
      "[stripe webhook] payment session missing booking_id metadata",
      { session_id: session.id }
    );
    return;
  }

  if (session.payment_status !== "paid") {
    console.log("[stripe webhook] payment session not yet paid, skipping", {
      session_id: session.id,
      payment_status: session.payment_status,
    });
    return;
  }

  const admin = createServerSupabaseClient();
  const { error } = await admin
    .from("bookings")
    .update({
      payment_status: "paid",
      status: "confirmed",
      stripe_session_id: session.id,
    })
    .eq("id", bookingId);

  if (error) {
    console.error("[stripe webhook] failed to mark booking paid", {
      booking_id: bookingId,
      error,
    });
    throw error;
  }

  console.log("[stripe webhook] booking marked paid", {
    booking_id: bookingId,
    session_id: session.id,
  });
}
