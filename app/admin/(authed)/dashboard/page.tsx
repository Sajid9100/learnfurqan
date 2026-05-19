import Link from "next/link";
import { Calendar, Clock, Users, FileText, TrendingUp } from "lucide-react";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { formatBookingSlot } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

type Stats = {
  today: number;
  week: number;
  all: number;
  pending: number;
  recent: Booking[];
};

async function loadStats(): Promise<Stats> {
  if (!isSupabaseAdminConfigured) {
    return { today: 0, week: 0, all: 0, pending: 0, recent: [] };
  }
  const admin = createServerSupabaseClient();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayRes, weekRes, allRes, pendingRes, recentRes] = await Promise.all([
    admin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString()),
    admin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString()),
    admin.from("bookings").select("*", { count: "exact", head: true }),
    admin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    today: todayRes.count ?? 0,
    week: weekRes.count ?? 0,
    all: allRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    recent: (recentRes.data ?? []) as Booking[],
  };
}

export default async function DashboardPage() {
  const stats = await loadStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of bookings and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bookings today"
          value={stats.today}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Bookings this week"
          value={stats.week}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="All-time bookings"
          value={stats.all}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<FileText className="h-5 w-5" />}
          accent
        />
      </div>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Recent bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-primary hover:text-primary-700"
          >
            View all →
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Teacher</th>
                  <th className="px-3 py-2">Slot</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recent.map((b) => (
                  <tr key={b.id}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">
                        {b.student_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.student_email}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-foreground">
                      {b.teacher_name}
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          href="/admin/bookings"
          title="Bookings"
          desc="Confirm, add Zoom link, complete"
          icon={<Calendar className="h-5 w-5" />}
        />
        <QuickLink
          href="/admin/teachers"
          title="Teachers"
          desc="Manage profiles and availability"
          icon={<Users className="h-5 w-5" />}
        />
        <QuickLink
          href="/admin/applications"
          title="Applications"
          desc="Review teacher applications"
          icon={<FileText className="h-5 w-5" />}
        />
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
            (accent ? "bg-accent/15 text-accent-600" : "bg-primary/10 text-primary")
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

function QuickLink({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>
      <div>
        <div className="font-heading font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </Link>
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
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
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
