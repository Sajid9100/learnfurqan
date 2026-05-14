import type { Booking } from "./types";

// Students can self-cancel or self-reschedule only when the class is at least
// this many hours away. Inside the window they must contact support (or the
// teacher cancels on their behalf — which is always refunded).
export const CANCEL_CUTOFF_HOURS = 24;

export function hoursUntilSlot(slotIso: string, now = Date.now()): number {
  const t = new Date(slotIso).getTime();
  if (!Number.isFinite(t)) return -Infinity;
  return (t - now) / (60 * 60 * 1000);
}

export function isBeyondCutoff(
  slotIso: string,
  cutoffHours = CANCEL_CUTOFF_HOURS
): boolean {
  return hoursUntilSlot(slotIso) >= cutoffHours;
}

export type CancelReason = "by_student" | "by_teacher" | "by_admin";

export type BookingActionResult =
  | { ok: true }
  | { ok: false; code: "already_cancelled" | "already_completed" | "past" | "inside_cutoff" };

export function canStudentSelfCancel(b: Booking): BookingActionResult {
  if (b.status === "cancelled") return { ok: false, code: "already_cancelled" };
  if (b.status === "completed") return { ok: false, code: "already_completed" };
  if (hoursUntilSlot(b.selected_slot) <= 0) return { ok: false, code: "past" };
  if (!isBeyondCutoff(b.selected_slot))
    return { ok: false, code: "inside_cutoff" };
  return { ok: true };
}

export function canStudentSelfReschedule(b: Booking): BookingActionResult {
  return canStudentSelfCancel(b);
}

export function canTeacherCancel(b: Booking): BookingActionResult {
  if (b.status === "cancelled") return { ok: false, code: "already_cancelled" };
  if (b.status === "completed") return { ok: false, code: "already_completed" };
  if (hoursUntilSlot(b.selected_slot) <= 0) return { ok: false, code: "past" };
  return { ok: true };
}

export function shouldRefund(b: Booking): boolean {
  return b.payment_status === "paid";
}
