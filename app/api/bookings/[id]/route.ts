import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  createServerSupabaseClient,
  getAvailabilityExceptions,
  getAvailabilityRules,
  getBookedRangesForTeacher,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { getAuthedStudent } from "@/lib/student-auth";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import { expandAvailability } from "@/lib/availability";
import {
  canStudentSelfCancel,
  canStudentSelfReschedule,
  canTeacherCancel,
  shouldRefund,
  type CancelReason,
} from "@/lib/booking-policy";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  deleteScheduledMeeting,
  extractMeetingIdFromJoinUrl,
  isZoomConfigured,
  updateScheduledMeeting,
} from "@/lib/zoom";
import {
  sendBookingCancelledEmail,
  sendBookingRescheduledEmail,
} from "@/lib/email";
import type { Booking, Teacher } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// DELETE /api/bookings/[id] — cancel a booking
// ---------------------------------------------------------------------------
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const actor = await resolveActor(params.id);
  if ("error" in actor) return actor.error;
  const { booking, role } = actor;

  const decision =
    role === "teacher" ? canTeacherCancel(booking) : canStudentSelfCancel(booking);
  if (!decision.ok) {
    return NextResponse.json(
      { error: cancelErrorMessage(decision.code) },
      { status: 409 }
    );
  }

  const reason: CancelReason = role === "teacher" ? "by_teacher" : "by_student";
  const refund = shouldRefund(booking);

  let refundedOk = false;
  if (refund) {
    try {
      await refundBooking(booking);
      refundedOk = true;
    } catch (err) {
      console.error("[bookings:cancel] refund failed", {
        booking_id: booking.id,
        err,
      });
      return NextResponse.json(
        {
          error:
            "Could not process the Stripe refund. Please try again or contact support.",
        },
        { status: 502 }
      );
    }
  }

  const admin = createServerSupabaseClient();
  const { error } = await admin
    .from("bookings")
    .update({
      status: "cancelled",
      ...(refundedOk ? { payment_status: "refunded" } : {}),
    })
    .eq("id", booking.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort: remove the Zoom meeting so it doesn't clutter the host
  // account. Failures are logged but don't undo the cancellation.
  await cleanupZoomForCancel(booking).catch((err) =>
    console.error("[bookings:cancel] zoom delete failed", err)
  );

  // Best-effort: notify the student. Don't fail the request on email errors.
  sendBookingCancelledEmail({
    studentName: booking.student_name,
    studentEmail: booking.student_email,
    teacherName: booking.teacher_name,
    selectedSlot: booking.selected_slot,
    cancelledBy: reason === "by_teacher" ? "teacher" : "student",
    refunded: refundedOk,
  }).catch((err) =>
    console.error("[bookings:cancel] email failed", err)
  );

  return NextResponse.json({
    ok: true,
    cancelled: true,
    refunded: refundedOk,
  });
}

// ---------------------------------------------------------------------------
// PATCH /api/bookings/[id] — reschedule (currently only the slot)
// ---------------------------------------------------------------------------
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: { selected_slot?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.selected_slot !== "string" || !body.selected_slot.trim()) {
    return NextResponse.json(
      { error: "selected_slot is required" },
      { status: 400 }
    );
  }
  const newSlot = new Date(body.selected_slot);
  if (!Number.isFinite(newSlot.getTime())) {
    return NextResponse.json(
      { error: "selected_slot must be an ISO 8601 timestamp" },
      { status: 400 }
    );
  }
  if (newSlot.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "selected_slot must be in the future" },
      { status: 400 }
    );
  }

  const actor = await resolveActor(params.id);
  if ("error" in actor) return actor.error;
  const { booking, role } = actor;

  const decision =
    role === "teacher"
      ? canTeacherCancel(booking)
      : canStudentSelfReschedule(booking);
  if (!decision.ok) {
    return NextResponse.json(
      { error: cancelErrorMessage(decision.code) },
      { status: 409 }
    );
  }

  if (!booking.teacher_id) {
    return NextResponse.json(
      { error: "This booking is no longer linked to a teacher." },
      { status: 409 }
    );
  }

  const teacher = await loadTeacher(booking.teacher_id);
  if (!teacher) {
    return NextResponse.json(
      { error: "Teacher not found for this booking." },
      { status: 404 }
    );
  }

  // Re-expand availability for the requested slot, ignoring this booking's
  // own current slot so a no-op (or near-no-op) reschedule doesn't collide
  // with itself.
  const duration = teacher.class_duration_minutes ?? 30;
  const windowStart = new Date(newSlot.getTime() - 60_000);
  const windowEnd = new Date(newSlot.getTime() + duration * 60_000 + 60_000);
  const [rules, exceptions, bookedRaw] = await Promise.all([
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
  // Filter this booking's own range out — otherwise expandAvailability would
  // mark the user's existing slot as occupied and reject identical reschedules.
  const currentStart = new Date(booking.selected_slot);
  const booked = bookedRaw.filter(
    (r) => Math.abs(r.start.getTime() - currentStart.getTime()) > 1000
  );
  const available = expandAvailability({
    rules,
    exceptions,
    classDurationMinutes: duration,
    from: windowStart,
    to: windowEnd,
    bookedRanges: booked,
  });
  const matched = available.find((s) => s.start === newSlot.toISOString());
  if (!matched) {
    return NextResponse.json(
      { error: "Selected slot is not available." },
      { status: 409 }
    );
  }

  const previousSlot = booking.selected_slot;
  const admin = createServerSupabaseClient();
  const { data: updated, error } = await admin
    .from("bookings")
    .update({ selected_slot: newSlot.toISOString() })
    .eq("id", booking.id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort: move the existing Zoom meeting.
  if (booking.zoom_link) {
    const meetingId = extractMeetingIdFromJoinUrl(booking.zoom_link);
    if (meetingId && isZoomConfigured) {
      try {
        await updateScheduledMeeting({
          meetingId,
          startTime: newSlot.toISOString(),
          durationMinutes: duration,
        });
      } catch (err) {
        console.error("[bookings:reschedule] zoom update failed", err);
      }
    }
  }

  sendBookingRescheduledEmail({
    studentName: booking.student_name,
    studentEmail: booking.student_email,
    teacherName: booking.teacher_name,
    previousSlot,
    newSlot: newSlot.toISOString(),
    zoomLink: booking.zoom_link || undefined,
  }).catch((err) =>
    console.error("[bookings:reschedule] email failed", err)
  );

  return NextResponse.json({
    ok: true,
    booking: updated as Booking,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ResolvedActor =
  | { error: NextResponse }
  | { booking: Booking; role: "student" | "teacher" };

// Loads the booking and confirms the authed user has permission to act on it.
// Either the booking belongs to the parent (by student_email or by an attached
// parent_children row's linked_booking_email) OR the booking is assigned to
// the authed teacher's id.
async function resolveActor(bookingId: string): Promise<ResolvedActor> {
  const admin = createServerSupabaseClient();
  const { data: booking, error } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (error) {
    return {
      error: NextResponse.json({ error: error.message }, { status: 500 }),
    };
  }
  if (!booking) {
    return {
      error: NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      ),
    };
  }
  const row = booking as Booking;

  const [teacher, student] = await Promise.all([
    getAuthedTeacher(),
    getAuthedStudent(),
  ]);

  if (teacher && row.teacher_id && teacher.id === row.teacher_id) {
    return { booking: row, role: "teacher" };
  }

  if (student) {
    const email = student.email.toLowerCase();
    if (row.student_email.toLowerCase() === email) {
      return { booking: row, role: "student" };
    }
    // Allow a parent acting on a child's booking when they've linked the
    // child's booking email to their account.
    const { data: links } = await admin
      .from("parent_children")
      .select("id")
      .ilike("parent_email", email)
      .ilike("linked_booking_email", row.student_email)
      .limit(1);
    if ((links?.length ?? 0) > 0) {
      return { booking: row, role: "student" };
    }
  }

  return {
    error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

async function loadTeacher(teacherId: string): Promise<Teacher | null> {
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .select("*")
    .eq("id", teacherId)
    .maybeSingle();
  if (error) {
    console.warn("[bookings] loadTeacher failed:", error.message);
    return null;
  }
  return (data as Teacher) ?? null;
}

async function refundBooking(booking: Booking): Promise<void> {
  if (!isStripeConfigured) {
    throw new Error("Stripe is not configured on the server.");
  }
  if (!booking.stripe_session_id) {
    throw new Error("Booking has no Stripe session to refund.");
  }
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(
    booking.stripe_session_id,
    { expand: ["payment_intent"] }
  );
  const pi = session.payment_intent;
  const paymentIntentId =
    typeof pi === "string" ? pi : (pi as Stripe.PaymentIntent | null)?.id;
  if (!paymentIntentId) {
    throw new Error("No payment_intent on the Stripe session.");
  }

  // If the original charge used a destination/Connect transfer, refund needs
  // to reverse the transfer and the application fee. Detect by inspecting the
  // expanded PaymentIntent (when available) or fall back to checking the
  // PaymentIntent directly.
  let usedTransfer = false;
  let usedAppFee = false;
  if (pi && typeof pi !== "string") {
    usedTransfer = Boolean(pi.transfer_data);
    usedAppFee = Boolean(pi.application_fee_amount);
  } else {
    const fresh = await stripe.paymentIntents.retrieve(paymentIntentId);
    usedTransfer = Boolean(fresh.transfer_data);
    usedAppFee = Boolean(fresh.application_fee_amount);
  }

  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };
  if (usedTransfer) params.reverse_transfer = true;
  if (usedAppFee) params.refund_application_fee = true;

  await stripe.refunds.create(params);
}

async function cleanupZoomForCancel(booking: Booking): Promise<void> {
  if (!booking.zoom_link || !isZoomConfigured) return;
  const meetingId = extractMeetingIdFromJoinUrl(booking.zoom_link);
  if (!meetingId) return;
  await deleteScheduledMeeting(meetingId);
}

function cancelErrorMessage(
  code: "already_cancelled" | "already_completed" | "past" | "inside_cutoff"
): string {
  switch (code) {
    case "already_cancelled":
      return "This booking is already cancelled.";
    case "already_completed":
      return "This class is already marked completed.";
    case "past":
      return "This class has already started or is in the past.";
    case "inside_cutoff":
      return "Classes can only be changed at least 24 hours in advance. Contact support for late changes.";
  }
}
