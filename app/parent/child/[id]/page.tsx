import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Mail,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { summarizeBookings } from "@/lib/parent-data";
import { UpcomingBookings } from "@/components/parent/UpcomingBookings";
import {
  CLASSES_GOAL,
  type Booking,
  type ParentChild,
} from "@/lib/types";
import { formatBookingSlot } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadChild(
  id: string,
  parentEmail: string
): Promise<{ child: ParentChild; bookings: Booking[] } | null> {
  if (!isSupabaseAdminConfigured) return null;
  const admin = createServerSupabaseClient();
  const { data } = await admin
    .from("parent_children")
    .select("*")
    .eq("id", id)
    .ilike("parent_email", parentEmail)
    .maybeSingle();
  const child = (data as ParentChild) ?? null;
  if (!child) return null;

  const lookupEmail = (child.linked_booking_email || parentEmail).trim();
  let bookings: Booking[] = [];
  if (lookupEmail) {
    const { data: rows } = await admin
      .from("bookings")
      .select("*")
      .ilike("student_email", lookupEmail)
      .order("created_at", { ascending: false });
    bookings = (rows ?? []) as Booking[];
  }
  return { child, bookings };
}

type AchievementId = "first_class" | "five_classes" | "ten_classes" | "consistent";

const ACHIEVEMENTS: { id: AchievementId; label: string; description: string }[] = [
  { id: "first_class", label: "First Class", description: "Booked your first class" },
  { id: "five_classes", label: "5 Classes", description: "Completed 5 classes" },
  { id: "ten_classes", label: "10 Classes", description: "Completed 10 classes" },
  { id: "consistent", label: "Consistent Learner", description: "4 weeks in a row" },
];

function earnedAchievements(bookings: Booking[]): Set<AchievementId> {
  const earned = new Set<AchievementId>();
  if (bookings.length >= 1) earned.add("first_class");
  const completed = bookings.filter((b) => b.status === "completed").length;
  if (completed >= 5) earned.add("five_classes");
  if (completed >= 10) earned.add("ten_classes");
  // Consistent: at least one completed booking in each of the last 4 ISO weeks.
  const weeks = new Set<string>();
  const now = Date.now();
  for (const b of bookings) {
    if (b.status !== "completed") continue;
    const t = new Date(b.created_at).getTime();
    if (!Number.isFinite(t)) continue;
    const weeksAgo = Math.floor((now - t) / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo >= 0 && weeksAgo < 4) weeks.add(String(weeksAgo));
  }
  if (weeks.size >= 4) earned.add("consistent");
  return earned;
}

export default async function ChildDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const parent = await getAuthedStudent();
  if (!parent) redirect("/sign-in");
  const result = await loadChild(params.id, parent.email);
  if (!result) notFound();
  const { child, bookings } = result;
  const summary = summarizeBookings(bookings);
  const progress = Math.min(
    100,
    Math.round((summary.completed / CLASSES_GOAL) * 100)
  );
  const onTrack = summary.upcoming > 0 || summary.completed > 0;
  const earned = earnedAchievements(bookings);
  const recent = bookings.slice(0, 10);
  const notedClasses = bookings
    .filter((b) => b.status === "completed" && b.lesson_notes?.trim())
    .sort(
      (a, b) =>
        new Date(b.selected_slot).getTime() -
        new Date(a.selected_slot).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {child.child_name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Age {child.child_age} · {child.learning_goal} · {child.current_level}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          <Card>
            <SectionTitle icon={<BookOpen className="h-4 w-4" />}>
              Child info
            </SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Name" value={child.child_name} />
              <Row label="Age" value={String(child.child_age)} />
              <Row label="Goal" value={child.learning_goal} />
              <Row label="Level" value={child.current_level} />
              <Row
                label="Booking email"
                value={child.linked_booking_email || "—"}
              />
            </dl>
          </Card>

          <Card>
            <SectionTitle icon={<GraduationCap className="h-4 w-4" />}>
              Current teacher
            </SectionTitle>
            {summary.teacher ? (
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                    {initials(summary.teacher)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">
                      {summary.teacher}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summary.next?.teacher_slug ?? "Teacher"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Next class:{" "}
                  <span className="font-medium text-foreground">
                    {summary.next ? formatBookingSlot(summary.next.selected_slot) : "Not scheduled"}
                  </span>
                </div>
                {summary.next?.teacher_slug ? (
                  <Link
                    href={`/parent/messages/${summary.next.teacher_slug}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <Mail className="h-4 w-4" />
                    Message Teacher
                  </Link>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No teacher booked yet.{" "}
                <Link href="/teachers" className="font-medium text-primary">
                  Browse teachers →
                </Link>
              </p>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />}>
              Progress
            </SectionTitle>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Completed" value={summary.completed} />
              <Stat
                label="Remaining"
                value={Math.max(0, CLASSES_GOAL - summary.completed)}
              />
              <Stat label="Upcoming" value={summary.upcoming} accent />
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-foreground">
                  Goal: {CLASSES_GOAL} classes
                </span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div
                className={
                  "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium " +
                  (onTrack
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/15 text-accent-700")
                }
              >
                {onTrack ? "On track" : "Needs attention"}
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<CalendarClock className="h-4 w-4" />}>
              Upcoming classes
            </SectionTitle>
            <div className="mt-3">
              <UpcomingBookings bookings={bookings} />
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<Calendar className="h-4 w-4" />}>
              Attendance — last {recent.length || 0} classes
            </SectionTitle>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No classes recorded yet for this child's booking email.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Teacher</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recent.map((b) => (
                      <tr key={b.id}>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDate(b.created_at)}
                        </td>
                        <td className="px-3 py-2 text-foreground">
                          {b.teacher_name}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={<BookOpen className="h-4 w-4" />}>
              Teacher's notes
            </SectionTitle>
            {notedClasses.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No notes yet. Teachers can post notes after each completed
                class.
              </p>
            ) : (
              <ul className="mt-3 space-y-4">
                {notedClasses.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {b.teacher_name}
                      </span>
                      <span>{formatDate(b.selected_slot)}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm text-foreground/90">
                      {b.lesson_notes}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle icon={<Trophy className="h-4 w-4" />}>
              Achievements
            </SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ACHIEVEMENTS.map((a) => {
                const got = earned.has(a.id);
                return (
                  <div
                    key={a.id}
                    className={
                      "flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition " +
                      (got
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-muted/20 opacity-70")
                    }
                  >
                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-full " +
                        (got ? "bg-accent text-white" : "bg-muted text-muted-foreground")
                      }
                    >
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      {a.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      {children}
    </section>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
      <span className="text-primary">{icon}</span>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-2 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <dt className="w-32 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border border-border p-3 " +
        (accent ? "bg-accent/10" : "bg-muted/30")
      }
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-heading text-2xl font-bold text-foreground">
        {value}
      </div>
    </div>
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
