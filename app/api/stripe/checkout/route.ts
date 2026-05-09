import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import type { SubscriptionPlan } from "@/lib/types";

export const runtime = "nodejs";

type CheckoutPayload = {
  plan: SubscriptionPlan;
  student_email: string;
  student_name: string;
};

const VALID_PLANS: SubscriptionPlan[] = ["basic", "premium"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured) {
      console.error("[stripe checkout] STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Stripe is not configured on the server." },
        { status: 503 }
      );
    }

    // ---------------------------------------------------------------- payload
    let body: Partial<CheckoutPayload>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.plan || !VALID_PLANS.includes(body.plan)) {
      return NextResponse.json(
        { error: `plan must be one of ${VALID_PLANS.join(", ")}` },
        { status: 400 }
      );
    }
    if (!body.student_email || !EMAIL_RE.test(body.student_email)) {
      return NextResponse.json(
        { error: "student_email is required and must be valid" },
        { status: 400 }
      );
    }
    if (!body.student_name?.trim()) {
      return NextResponse.json(
        { error: "student_name is required" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------- price id
    const priceId =
      body.plan === "basic"
        ? process.env.STRIPE_PRICE_BASIC
        : process.env.STRIPE_PRICE_PREMIUM;

    if (!priceId || priceId.includes("price_xxxxx")) {
      const envName =
        body.plan === "basic" ? "STRIPE_PRICE_BASIC" : "STRIPE_PRICE_PREMIUM";
      console.error(`[stripe checkout] ${envName} is not set`);
      return NextResponse.json(
        { error: `${envName} is not configured on the server.` },
        { status: 503 }
      );
    }

    // ----------------------------------------------------------------- urls
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const successUrl = `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/pricing`;

    console.log("[stripe checkout] creating session", {
      plan: body.plan,
      priceId,
      successUrl,
      cancelUrl,
      email: body.student_email,
    });

    // ------------------------------------------------------------- create
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.student_email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        student_name: body.student_name.trim(),
        student_email: body.student_email,
        plan: body.plan,
      },
      subscription_data: {
        metadata: {
          student_name: body.student_name.trim(),
          student_email: body.student_email,
          plan: body.plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    console.log("[stripe checkout] session created", {
      id: session.id,
      url: session.url,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    // ----------------------------------------------------------- log everything
    if (err instanceof Stripe.errors.StripeError) {
      console.error("[stripe checkout] Stripe API error", {
        type: err.type,
        code: err.code,
        statusCode: err.statusCode,
        message: err.message,
        param: err.param,
        requestId: err.requestId,
        raw: err.raw,
      });
      return NextResponse.json(
        {
          error: "Stripe rejected the request.",
          stripe: {
            type: err.type,
            code: err.code ?? null,
            message: err.message,
            param: err.param ?? null,
          },
        },
        { status: err.statusCode ?? 500 }
      );
    }

    console.error("[stripe checkout] unexpected error", err);
    return NextResponse.json(
      {
        error: "Could not create checkout session.",
        message: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
