"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CalendarX2,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { formatBookingSlot } from "@/lib/utils";
import {
  CANCEL_CUTOFF_HOURS,
  hoursUntilSlot,
  isBeyondCutoff,
} from "@/lib/booking-policy";
import type { Booking } from "@/lib/types";

type Mode = "cancel" | "reschedule";

export function UpcomingBookings({ bookings }: { bookings: Booking[] }) {
  const [active, setActive] = useState<{
    booking: Booking;
    mode: Mode;
  } | null>(null);

  const upcoming = bookings
    .filter(
      (b) =>
        (b.status === "pending" || b.status === "confirmed") &&
        hoursUntilSlot(b.selected_slot) > 0
    )
    .sort(
      (a, b) =>
        new Date(a.selected_slot).getTime() -
        new Date(b.selected_slot).getTime()
    );

  if (upcoming.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        No upcoming classes scheduled.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {upcoming.map((b) => {
          const canSelfChange = isBeyondCutoff(b.selected_slot);
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {b.teacher_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBookingSlot(b.selected_slot)}
                  {b.payment_status === "paid" && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#e8efec] px-2 py-0.5 text-[10px] font-medium text-[#0a2e1e]">
                      Paid
                    </span>
                  )}
                  {b.payment_status === "free_trial" && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Trial
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canSelfChange ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActive({ booking: b, mode: "reschedule" })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setActive({ booking: b, mode: "cancel" })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <CalendarX2 className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Within {CANCEL_CUTOFF_HOURS}h — contact support
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Free changes up to {CANCEL_CUTOFF_HOURS} hours before class. Paid
        classes are fully refunded when cancelled before the cutoff.
      </p>

      {active?.mode === "cancel" && (
        <CancelModal
          booking={active.booking}
          onClose={() => setActive(null)}
        />
      )}
      {active?.mode === "reschedule" && (
        <RescheduleModal
          booking={active.booking}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

function CancelModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function onConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not cancel");
      toast.success(
        data?.refunded
          ? "Class cancelled — refund issued."
          : "Class cancelled."
      );
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={() => !submitting && onClose()}
      title="Cancel this class?"
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          {booking.teacher_name} —{" "}
          <span className="font-medium text-foreground">
            {formatBookingSlot(booking.selected_slot)}
          </span>
        </div>
        <p className="text-sm text-foreground/90">
          {booking.payment_status === "paid"
            ? "We'll refund the full class fee to your original payment method (5–10 business days)."
            : "Your slot will be released back to the teacher's availability."}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            Keep class
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancel class
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RescheduleModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [slot, setSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onConfirm() {
    if (!slot) {
      toast.error("Pick a new time first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_slot: slot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not reschedule");
      toast.success("Class rescheduled.");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reschedule failed");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={() => !submitting && onClose()}
      title={`Reschedule with ${booking.teacher_name}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          Current time:{" "}
          <span className="font-medium text-foreground">
            {formatBookingSlot(booking.selected_slot)}
          </span>
        </div>
        <SlotPicker
          teacherSlug={booking.teacher_slug}
          value={slot}
          onChange={setSlot}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || !slot}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Move class
          </button>
        </div>
      </div>
    </Modal>
  );
}
