import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createBooking,
  getAvailabilityExceptions,
  getAvailabilityRules,
  getBookedRangesForTeacher,
  getTeacherBySlug,
  hasPriorBookingWithTeacher,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { expandAvailability } from "@/lib/availability";
import { sendBookingConfirmationEmails } from "@/lib/email";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import type { AgeGroup, StudentLevel, Teacher } from "@/lib/types";

export const runtime = "nodejs";

type BookingPayload = {
  teacher_slug: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_country: string;
  age_group: AgeGroup;
  current_level: StudentLevel;
  selected_slot: string;
  message?: string;
};

const VALID_AGE: AgeGroup[] = ["child", "teen", "adult"];
const VALID_LEVEL: StudentLevel[] = ["beginner", "can-read", "intermediate"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Partial<BookingPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validate(body);
  if (errors.length) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 }
    );
  }

  const teacher = await getTeacherBySlug(body.teacher_slug!);
  if (!teacher) {
    return NextResponse.json(
      { error: `Teacher not found: ${body.teacher_slug}` },
      { status: 404 }
    );
  }

  const slotDate = parseIso(body.selected_slot!);
  if (!slotDate) {
    return NextResponse.json(
      { error: "selected_slot must be an ISO 8601 timestamp" },
      { status: 400 }
    );
  }
  if (slotDate.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "selected_slot must be in the future" },
      { status: 400 }
    );
  }

  // Race-safe availability check: re-expand availability at insert time and
  // confirm the chosen slot is still bookable.
  const duration = teacher.class_duration_minutes ?? 30;
  const windowStart = new Date(slotDate.getTime() - 60_000);
  const windowEnd = new Date(slotDate.getTime() + duration * 60_000 + 60_000);
  const [rules, exceptions, booked] = await Promise.all([
    getAvailabilityRules(teacher.id),
    getAvailabilityExceptions(
      teacher.id,
      windowStart.toISOString().slice(0, 10),
      windowEnd.toISOString().slice(0, 10)
    ),
    getBookedRangesForTeacher(
      teacher.id,
      windowStart.toISOString(),
      windowEnd.toISOString(),
      duration
    ),
  ]);
  const available = expandAvailability({
    rules,
    exceptions,
    classDurationMinutes: duration,
    from: windowStart,
    to: windowEnd,
    bookedRanges: booked,
  });
  const matched = available.find((s) => s.start === slotDate.toISOString());
  if (!matched) {
    return NextResponse.json(
      { error: "Selected slot is no longer available" },
      { status: 409 }
    );
  }

  const studentEmail = body.student_email!.trim().toLowerCase();
  const studentName = body.student_name!.trim();

  // First booking with a given teacher is always free. Subsequent bookings
  // with the same teacher get routed through Stripe Checkout.
  const requiresPayment =
    isSupabaseAdminConfigured &&
    (await hasPriorBookingWithTeacher(studentEmail, teacher.id));

  try {
    const { id } = await createBooking({
      teacher_id: teacher.id,
      teacher_name: teacher.name,
      teacher_slug: teacher.slug,
      student_name: studentName,
      student_email: studentEmail,
      student_phone: body.student_phone!.trim(),
      student_country: body.student_country!.trim(),
      age_group: body.age_group!,
      current_level: body.current_level!,
      selected_slot: slotDate.toISOString(),
      message: (body.message ?? "").trim(),
      payment_status: requiresPayment ? "pending" : "free_trial",
    });

    if (requiresPayment) {
      const checkout = await createBookingCheckoutSession({
        bookingId: id,
        teacher,
        studentEmail,
        studentName,
      });
      return NextResponse.json(
        {
          ok: true,
          id,
          requires_payment: true,
          checkout_url: checkout.url,
        },
        { status: 201 }
      );
    }

    // Free trial — send confirmation emails now. Paid bookings only get
    // emails after the Stripe webhook flips the row to "paid".
    sendBookingConfirmationEmails({
      studentName,
      studentEmail,
      studentPhone: body.student_phone!.trim(),
      studentCountry: body.student_country!.trim(),
      ageGroup: body.age_group!,
      currentLevel: body.current_level!,
      selectedSlot: slotDate.toISOString(),
      message: (body.message ?? "").trim(),
      teacher,
    }).catch((err) => {
      console.error("[bookings] email send failed", err);
    });

    return NextResponse.json(
      { ok: true, id, requires_payment: false },
      { status: 201 }
    );
  } catch (err) {
    console.error("[bookings] insert failed", err);
    return NextResponse.json(
      { error: "Could not save booking. Please try again." },
      { status: 500 }
    );
  }
}

async function createBookingCheckoutSession(args: {
  bookingId: string;
  teacher: Teacher;
  studentEmail: string;
  studentName: string;
}): Promise<{ url: string }> {
  if (!isStripeConfigured) {
    throw new Error("Stripe is not configured on the server.");
  }

  const unitAmount = Math.round(args.teacher.price_per_class * 100);
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    throw new Error("Teacher price is not configured");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: `${args.teacher.name} — class`,
            description: args.teacher.subject,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: args.studentEmail,
    success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/book/${args.teacher.slug}`,
    metadata: {
      booking_id: args.bookingId,
      teacher_slug: args.teacher.slug,
      student_email: args.studentEmail,
      student_name: args.studentName,
    },
    payment_intent_data: {
      metadata: {
        booking_id: args.bookingId,
        teacher_slug: args.teacher.slug,
      },
    },
  });

  if (!session.url) {
    throw new Stripe.errors.StripeError({
      type: "api_error",
      message: "Stripe did not return a checkout URL",
    } as Stripe.StripeRawError);
  }

  return { url: session.url };
}

function parseIso(s: string): Date | null {
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}

function validate(p: Partial<BookingPayload>): string[] {
  const e: string[] = [];
  if (!p.teacher_slug) e.push("teacher_slug is required");
  if (!p.student_name?.trim()) e.push("student_name is required");
  if (!p.student_email?.trim()) e.push("student_email is required");
  else if (!EMAIL_RE.test(p.student_email)) e.push("student_email is invalid");
  if (!p.student_phone?.trim()) e.push("student_phone is required");
  if (!p.student_country?.trim()) e.push("student_country is required");
  if (!p.age_group || !VALID_AGE.includes(p.age_group))
    e.push(`age_group must be one of ${VALID_AGE.join(", ")}`);
  if (!p.current_level || !VALID_LEVEL.includes(p.current_level))
    e.push(`current_level must be one of ${VALID_LEVEL.join(", ")}`);
  if (!p.selected_slot?.trim()) e.push("selected_slot is required");
  return e;
}
