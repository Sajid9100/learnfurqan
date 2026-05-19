"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Video, CheckCircle2, XCircle, Check } from "lucide-react";
import type { Booking } from "@/lib/types";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { formatBookingSlot } from "@/lib/utils";

type FilterStatus = "all" | Booking["status"];

const STATUSES: FilterStatus[] = ["all", "pending", "confirmed", "completed"];

export function BookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [zoomModal, setZoomModal] = useState<Booking | null>(null);
  const toast = useToast();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load bookings");
      setBookings(data.bookings ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function patchBooking(
    id: string,
    body: { status?: Booking["status"]; zoom_link?: string },
    successMsg: string
  ) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? (data.booking as Booking) : b))
      );
      toast.success(successMsg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPendingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        b.student_name.toLowerCase().includes(q) ||
        b.student_email.toLowerCase().includes(q)
      );
    });
  }, [bookings, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors " +
                (filter === s
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground border border-border hover:text-primary hover:border-primary")
              }
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading bookings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No bookings match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Age · Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Booked</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <tr key={b.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {b.student_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{b.student_email}</div>
                      <div className="text-xs">{b.student_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {b.teacher_name}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatBookingSlot(b.selected_slot)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="capitalize">{b.age_group}</div>
                      <div className="text-xs capitalize">
                        {b.current_level.replace("-", " ")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                      {b.zoom_link && (
                        <div className="mt-1 text-xs text-primary">
                          Zoom link sent
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(b.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {b.status === "pending" && (
                          <ActionBtn
                            onClick={() =>
                              patchBooking(
                                b.id,
                                { status: "confirmed" },
                                "Booking confirmed"
                              )
                            }
                            disabled={pendingId === b.id}
                            color="primary"
                            icon={<Check className="h-3.5 w-3.5" />}
                          >
                            Confirm
                          </ActionBtn>
                        )}
                        <ActionBtn
                          onClick={() => setZoomModal(b)}
                          disabled={pendingId === b.id}
                          color="accent"
                          icon={<Video className="h-3.5 w-3.5" />}
                        >
                          {b.zoom_link ? "Update Zoom" : "Override Zoom Link"}
                        </ActionBtn>
                        {b.status !== "completed" && (
                          <ActionBtn
                            onClick={() =>
                              patchBooking(
                                b.id,
                                { status: "completed" },
                                "Marked complete"
                              )
                            }
                            disabled={pendingId === b.id}
                            color="muted"
                            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          >
                            Complete
                          </ActionBtn>
                        )}
                        {b.status !== "cancelled" && (
                          <ActionBtn
                            onClick={() =>
                              patchBooking(
                                b.id,
                                { status: "cancelled" },
                                "Booking cancelled"
                              )
                            }
                            disabled={pendingId === b.id}
                            color="danger"
                            icon={<XCircle className="h-3.5 w-3.5" />}
                          >
                            Cancel
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ZoomModal
        booking={zoomModal}
        onClose={() => setZoomModal(null)}
        onSave={async (id, link) => {
          await patchBooking(
            id,
            { zoom_link: link, status: "confirmed" },
            "Zoom link saved — email sent to student"
          );
          setZoomModal(null);
        }}
      />
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  color,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: "primary" | "accent" | "muted" | "danger";
  icon?: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-700",
    accent: "bg-accent text-foreground hover:bg-accent-600 hover:text-white",
    muted: "bg-white text-foreground border border-border hover:border-primary hover:text-primary",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${styles[color]}`}
    >
      {icon}
      {children}
    </button>
  );
}

function ZoomModal({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking | null;
  onClose: () => void;
  onSave: (id: string, link: string) => Promise<void>;
}) {
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLink(booking?.zoom_link ?? "");
  }, [booking]);

  if (!booking) return null;

  return (
    <Modal open={!!booking} onClose={onClose} title="Override Zoom Link">
      <div className="space-y-4">
        <div className="rounded-xl bg-muted/40 p-3 text-sm">
          <div>
            <span className="text-muted-foreground">Student: </span>
            <span className="font-medium">{booking.student_name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Teacher: </span>
            <span className="font-medium">{booking.teacher_name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Slot: </span>
            <span className="font-medium">{formatBookingSlot(booking.selected_slot)}</span>
          </div>
        </div>
        <div>
          <label
            htmlFor="zoom-link"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Zoom meeting link
          </label>
          <input
            id="zoom-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Bookings auto-generate a Zoom link via the LearnFurqan host
            account. Use this only to override the auto-generated link. The
            student will receive an email with the new link.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !link.trim()}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(booking.id, link.trim());
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & send email"}
          </button>
        </div>
      </div>
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
