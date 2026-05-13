import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  createServerSupabaseClient,
  getTeacherBySlug,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";

export const runtime = "nodejs";

type Payload = { booking_id: string };

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured) {
      console.error("[booking-checkout] STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Stripe is not configured on the server." },
        { status: 503 }
      );
    }
    if (!isSupabaseAdminConfigured) {
      console.error("[booking-checkout] Supabase admin is not configured");
      return NextResponse.json(
        { error: "Server data layer is not configured." },
        { status: 503 }
      );
    }

    let body: Partial<Payload>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.booking_id?.trim()) {
      return NextResponse.json(
        { error: "booking_id is required" },
        { status: 400 }
      );
    }

    const admin = createServerSupabaseClient();
    const { data: booking, error: bookingErr } = await admin
      .from("bookings")
      .select(
        "id, teacher_slug, student_email, student_name, payment_status, status"
      )
      .eq("id", body.booking_id)
      .maybeSingle();

    if (bookingErr || !booking) {
      console.error("[booking-checkout] booking lookup failed", bookingErr);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { error: "Booking is already paid" },
        { status: 409 }
      );
    }

    const teacher = await getTeacherBySlug(booking.teacher_slug as string);
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found for booking" },
        { status: 404 }
      );
    }

    const unitAmount = Math.round(teacher.price_per_class * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return NextResponse.json(
        { error: "Teacher price is not configured" },
        { status: 503 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const successUrl = `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/book/${teacher.slug}`;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: `${teacher.name} — class`,
              description: teacher.subject,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: booking.student_email as string,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        booking_id: booking.id as string,
        teacher_slug: teacher.slug,
        student_email: booking.student_email as string,
        student_name: (booking.student_name as string) ?? "",
      },
      payment_intent_data: {
        metadata: {
          booking_id: booking.id as string,
          teacher_slug: teacher.slug,
        },
      },
    });

    await admin
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    console.log("[booking-checkout] session created", {
      booking_id: booking.id,
      session_id: session.id,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error("[booking-checkout] Stripe API error", {
        type: err.type,
        code: err.code,
        message: err.message,
        param: err.param,
      });
      return NextResponse.json(
        { error: "Stripe rejected the request.", message: err.message },
        { status: err.statusCode ?? 500 }
      );
    }
    console.error("[booking-checkout] unexpected error", err);
    return NextResponse.json(
      { error: "Could not create checkout session.", message: (err as Error).message },
      { status: 500 }
    );
  }
}
