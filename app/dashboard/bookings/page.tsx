import Link from "next/link";
import { redirect } from "next/navigation";
import { Video } from "lucide-react";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { formatBookingSlot } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadBookings(email: string): Promise<Booking[]> {
  if (!isSupabaseAdminConfigured) return [];
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("bookings")
    .select("*")
    .ilike("student_email", email)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[bookings] failed", error.message);
    return [];
  }
  return (data ?? []) as Booking[];
}

export default async function MyBookingsPage() {
  const student = await getAuthedStudent();
  if (!student) redirect("/sign-in");
  const bookings = await loadBookings(student.email);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          My Bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your trial and ongoing classes.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            No bookings yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When you book a class, it'll appear here.
          </p>
          <Link
            href="/teachers"
            className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Browse Teachers
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Zoom</th>
                  <th className="px-4 py-3">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking: b }: { booking: Booking }) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-foreground">{b.teacher_name}</td>
      <td className="px-4 py-3 text-muted-foreground">{b.teacher_slug}</td>
      <td className="px-4 py-3 text-foreground">{formatBookingSlot(b.selected_slot)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={b.status} />
      </td>
      <td className="px-4 py-3">
        {b.zoom_link ? (
          <a
            href={b.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-700"
          >
            <Video className="h-3.5 w-3.5" />
            Join
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(b.created_at)}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    pending: "bg-accent/15 text-accent-700",
    confirmed: "bg-primary/15 text-primary",
    completed: "bg-emerald-100 text-emerald-700",
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
