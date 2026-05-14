import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createReview,
  createServerSupabaseClient,
  getBookingForReview,
  getReviewByBookingId,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { ParentChild } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewPayload = {
  booking_id?: string;
  rating?: number;
  comment?: string;
};

export async function POST(req: Request) {
  const parent = await getAuthedStudent();
  if (!parent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: ReviewPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bookingId = body.booking_id?.trim();
  const rating = Math.round(Number(body.rating));
  const comment = (body.comment ?? "").trim();

  if (!bookingId) {
    return NextResponse.json({ error: "booking_id is required" }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }
  if (comment.length > 2000) {
    return NextResponse.json(
      { error: "comment must be 2000 characters or fewer" },
      { status: 400 }
    );
  }

  const booking = await getBookingForReview(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: "Only completed classes can be reviewed" },
      { status: 409 }
    );
  }
  if (!booking.teacher_id) {
    return NextResponse.json(
      { error: "Booking is missing a teacher reference" },
      { status: 409 }
    );
  }

  const allowed = await isParentAllowedToReview(
    parent.email,
    booking.student_email
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "This booking is not linked to your account" },
      { status: 403 }
    );
  }

  const existing = await getReviewByBookingId(bookingId);
  if (existing) {
    return NextResponse.json(
      { error: "A review for this class already exists" },
      { status: 409 }
    );
  }

  try {
    const review = await createReview({
      booking_id: bookingId,
      teacher_id: booking.teacher_id,
      student_email: booking.student_email,
      student_name: booking.student_name,
      rating,
      comment,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[reviews] insert failed", err);
    return NextResponse.json(
      { error: "Could not save review. Please try again." },
      { status: 500 }
    );
  }
}

// A parent can review a booking made under their own email, OR a booking
// made under one of their children's linked_booking_email values.
async function isParentAllowedToReview(
  parentEmail: string,
  bookingEmail: string
): Promise<boolean> {
  const parent = parentEmail.toLowerCase();
  const booking = bookingEmail.toLowerCase();
  if (parent === booking) return true;

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("parent_children")
    .select("linked_booking_email")
    .ilike("parent_email", parent);
  if (error) {
    console.warn("[reviews] parent_children lookup failed:", error.message);
    return false;
  }
  const linked = ((data ?? []) as Pick<ParentChild, "linked_booking_email">[])
    .map((c) => (c.linked_booking_email ?? "").toLowerCase())
    .filter(Boolean);
  return linked.includes(booking);
}
