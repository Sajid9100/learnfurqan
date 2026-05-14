"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MessageSquarePlus } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { formatBookingSlot } from "@/lib/utils";
import type { ReviewableBooking } from "@/lib/types";

export function ReviewableBookings({
  bookings,
}: {
  bookings: ReviewableBooking[];
}) {
  const [active, setActive] = useState<ReviewableBooking | null>(null);

  if (bookings.length === 0) return null;

  return (
    <section className="rounded-3xl border border-accent/30 bg-accent/5 p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent/15 text-accent-700">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Leave a review
          </h2>
          <p className="text-sm text-muted-foreground">
            {bookings.length === 1
              ? "You have one completed class waiting for a review."
              : `You have ${bookings.length} completed classes waiting for a review.`}
          </p>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {b.teacher_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBookingSlot(b.selected_slot)} · for {b.student_name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive(b)}
              className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-700"
            >
              Leave review
            </button>
          </li>
        ))}
      </ul>

      <ReviewModal booking={active} onClose={() => setActive(null)} />
    </section>
  );
}

function ReviewModal({
  booking,
  onClose,
}: {
  booking: ReviewableBooking | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setRating(0);
    setHover(0);
    setComment("");
    setSubmitting(false);
  }

  function close() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not submit review");
      toast.success("Thank you for your review!");
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={Boolean(booking)}
      onClose={close}
      title={booking ? `Review ${booking.teacher_name}` : "Review"}
      size="md"
    >
      {booking && (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            Class on{" "}
            <span className="font-medium text-foreground">
              {formatBookingSlot(booking.selected_slot)}
            </span>{" "}
            · for{" "}
            <span className="font-medium text-foreground">
              {booking.student_name}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              How was the class?
            </label>
            <div
              className="mt-2 inline-flex items-center gap-1"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    className="rounded-md p-1 transition-transform hover:scale-110"
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  >
                    <Star
                      className={
                        "h-7 w-7 " +
                        (filled
                          ? "fill-current text-accent"
                          : "text-muted-foreground/40")
                      }
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-foreground">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Share what went well and how the teacher helped."
              className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {comment.length} / 2000
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating < 1}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
