import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  GraduationCap,
} from "lucide-react";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { formatBookingSlot } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

type DashData = {
  total: number;
  upcoming: number;
  completed: number;
  next: Booking | null;
  recent: Booking[];
};

async function loadDashboard(email: string): Promise<DashData> {
  if (!isSupabaseAdminConfigured) {
    return { total: 0, upcoming: 0, completed: 0, next: null, recent: [] };
  }
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("bookings")
    .select("*")
    .ilike("student_email", email)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[dashboard] failed to load bookings", error.message);
    return { total: 0, upcoming: 0, completed: 0, next: null, recent: [] };
  }
  const rows = (data ?? []) as Booking[];
  const total = rows.length;
  const upcoming = rows.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ).length;
  const completed = rows.filter((b) => b.status === "completed").length;
  const next =
    rows.find((b) => b.status === "confirmed") ??
    rows.find((b) => b.status === "pending") ??
    null;
  return { total, upcoming, completed, next, recent: rows.slice(0, 5) };
}

export default async function StudentDashboardPage() {
  const student = await getAuthedStudent();
  if (!student) redirect("/sign-in");
  const data = await loadDashboard(student.email);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Assalamu Alaikum, {student.firstName || student.fullName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's your LearnFurqan learning overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total classes booked"
          value={data.total}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Upcoming classes"
          value={data.upcoming}
          icon={<Clock className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Classes completed"
          value={data.completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Next class
        </h2>
        {data.next ? <NextClassCard booking={data.next} /> : <NoUpcoming />}
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Recent bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-primary hover:text-primary-700"
          >
            View all →
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            You haven't booked any classes yet.{" "}
            <Link href="/teachers" className="font-medium text-primary">
              Find a teacher →
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Teacher</th>
                  <th className="px-3 py-2">Slot</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent.map((b) => (
                  <tr key={b.id}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">
                        {b.teacher_name}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {formatBookingSlot(b.selected_slot)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDate(b.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span
          className={
            "flex h-9 w-9 items-center justify-center rounded-full " +
            (accent
              ? "bg-accent/15 text-accent-600"
              : "bg-primary/10 text-primary")
          }
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 font-heading text-3xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function NextClassCard({ booking }: { booking: Booking }) {
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap className="h-5 w-5" />
          <span className="font-heading text-lg font-semibold text-foreground">
            {booking.teacher_name}
          </span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {formatBookingSlot(booking.selected_slot)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <StatusBadge status={booking.status} />
          <span>· Booked {formatDate(booking.created_at)}</span>
        </div>
      </div>
      <div>
        {booking.zoom_link ? (
          <a
            href={booking.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-700"
          >
            <Video className="h-4 w-4" />
            Join Class
          </a>
        ) : (
          <div className="rounded-full bg-accent/15 px-4 py-2 text-sm font-medium text-accent-700">
            Zoom link will be sent soon
          </div>
        )}
      </div>
    </div>
  );
}

function NoUpcoming() {
  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <Calendar className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        No upcoming classes. Book your first trial!
      </p>
      <Link
        href="/teachers"
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Browse Teachers
      </Link>
    </div>
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
