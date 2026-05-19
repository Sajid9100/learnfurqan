"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { formatBookingSlot } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export function TeacherUpcomingList({
  bookings,
  emptyMessage,
}: {
  bookings: Booking[];
  emptyMessage: string;
}) {
  const [active, setActive] = useState<Booking | null>(null);

  if (bookings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {b.student_name}
                <span className="ml-2 text-xs text-muted-foreground">
                  · {b.age_group} · {b.current_level}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBookingSlot(b.selected_slot)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={b.status} />
              {b.zoom_link && (
                <a
                  href={b.zoom_link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                >
                  Open Zoom
                </a>
              )}
              <button
                type="button"
                onClick={() => setActive(b)}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <CalendarX2 className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </li>
        ))}
      </ul>
      <TeacherCancelModal
        booking={active}
        onClose={() => setActive(null)}
      />
    </>
  );
}

function TeacherCancelModal({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function onConfirm() {
    if (!booking) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not cancel");
      toast.success(
        data?.refunded
          ? "Class cancelled — full refund issued to the student."
          : "Class cancelled and the student has been notified."
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
      open={Boolean(booking)}
      onClose={() => !submitting && onClose()}
      title={booking ? `Cancel class with ${booking.student_name}?` : "Cancel"}
      size="sm"
    >
      {booking && (
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            Scheduled:{" "}
            <span className="font-medium text-foreground">
              {formatBookingSlot(booking.selected_slot)}
            </span>
          </div>
          <p className="text-sm text-foreground/90">
            {booking.payment_status === "paid"
              ? "The student will receive a full refund automatically."
              : "The student will be notified by email."}{" "}
            Frequent teacher-side cancellations affect your visibility on the
            platform.
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
      )}
    </Modal>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    pending: "bg-accent/15 text-accent-700",
    confirmed: "bg-primary/15 text-primary",
    completed: "bg-[#e8efec] text-[#0a2e1e]",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
