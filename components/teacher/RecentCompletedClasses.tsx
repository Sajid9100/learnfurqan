"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotebookPen, FileText, Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { formatBookingSlot } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export function RecentCompletedClasses({
  bookings,
}: {
  bookings: Booking[];
}) {
  const [active, setActive] = useState<Booking | null>(null);

  if (bookings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        No completed classes yet. Once you mark a class complete, you can add
        notes for the parent here.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {bookings.map((b) => {
          const hasNote = Boolean(b.lesson_notes?.trim());
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {b.student_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBookingSlot(b.selected_slot)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasNote && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8efec] px-2.5 py-0.5 text-[11px] font-medium text-[#0a2e1e]">
                    <FileText className="h-3 w-3" />
                    Note added
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActive(b)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  <NotebookPen className="h-3.5 w-3.5" />
                  {hasNote ? "Edit note" : "Add note"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <NoteModal booking={active} onClose={() => setActive(null)} />
    </>
  );
}

function NoteModal({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState<string | null>(null);

  // Reset whenever a different booking is opened.
  if (booking && booking.id !== loaded) {
    setLoaded(booking.id);
    setNotes(booking.lesson_notes ?? "");
  }
  if (!booking && loaded !== null) {
    setLoaded(null);
    setNotes("");
  }

  function close() {
    if (saving) return;
    onClose();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not save note");
      toast.success("Note saved");
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={Boolean(booking)}
      onClose={close}
      title={booking ? `Note for ${booking.student_name}` : "Note"}
      size="md"
    >
      {booking && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            Class on{" "}
            <span className="font-medium text-foreground">
              {formatBookingSlot(booking.selected_slot)}
            </span>
          </div>

          <div>
            <label
              htmlFor="lesson-notes"
              className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              What did you cover, and what should they practice?
            </label>
            <textarea
              id="lesson-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={5000}
              rows={6}
              placeholder="e.g. Reviewed Surah Al-Fatiha tajweed; practice mim sakinah rules before next class."
              className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {notes.length} / 5000
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save note
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
