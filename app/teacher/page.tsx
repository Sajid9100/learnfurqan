import { Calendar, CheckCircle2, Clock3, Users } from "lucide-react";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import { getBookingsForTeacher } from "@/lib/supabase";
import { RecentCompletedClasses } from "@/components/teacher/RecentCompletedClasses";
import { TeacherUpcomingList } from "@/components/teacher/UpcomingBookings";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeacherHomePage() {
  // Layout has already redirected non-teachers; this is a teacher.
  const teacher = (await getAuthedTeacher())!;
  const bookings = await getBookingsForTeacher(teacher.id);

  const now = Date.now();
  const todayKey = new Date().toISOString().slice(0, 10);
  const sevenDays = now + 7 * 24 * 60 * 60 * 1000;

  const upcoming = bookings
    .filter((b) => isUpcoming(b, now))
    .sort(
      (a, b) =>
        new Date(a.selected_slot).getTime() -
        new Date(b.selected_slot).getTime()
    );
  const today = upcoming.filter((b) =>
    b.selected_slot.startsWith(todayKey)
  );
  const thisWeek = upcoming.filter((b) => {
    const t = new Date(b.selected_slot).getTime();
    return t >= now && t <= sevenDays;
  });
  const completed = bookings
    .filter((b) => b.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.selected_slot).getTime() -
        new Date(a.selected_slot).getTime()
    );
  const completedCount = completed.length;
  const recentCompleted = completed.slice(0, 8);
  const uniqueStudents = new Set(
    bookings.map((b) => b.student_email.toLowerCase())
  ).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Assalamu Alaikum, {teacher.name.split(" ").slice(-1)[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's a snapshot of your classes today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Clock3 className="h-4 w-4" />}
          label="Today"
          value={today.length}
        />
        <Stat
          icon={<Calendar className="h-4 w-4" />}
          label="Next 7 days"
          value={thisWeek.length}
        />
        <Stat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={completedCount}
        />
        <Stat
          icon={<Users className="h-4 w-4" />}
          label="Students"
          value={uniqueStudents}
        />
      </div>

      <Section title="Today's classes">
        <TeacherUpcomingList
          bookings={today}
          emptyMessage="No classes scheduled for today."
        />
      </Section>

      <Section title="Coming up this week">
        <TeacherUpcomingList
          bookings={thisWeek}
          emptyMessage="No upcoming classes in the next 7 days. Add availability so students can book you."
        />
      </Section>

      <Section title="Recent completed classes">
        <RecentCompletedClasses bookings={recentCompleted} />
      </Section>
    </div>
  );
}

function isUpcoming(b: Booking, nowMs: number): boolean {
  if (b.status === "cancelled") return false;
  const t = new Date(b.selected_slot).getTime();
  if (!Number.isFinite(t)) return false;
  return t >= nowMs - 60 * 60 * 1000; // include in-progress (last hour)
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-heading text-2xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <h2 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

