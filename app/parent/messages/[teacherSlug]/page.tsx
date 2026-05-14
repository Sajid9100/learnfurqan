import { notFound, redirect } from "next/navigation";
import { getAuthedStudent } from "@/lib/student-auth";
import { getTeacherBySlug } from "@/lib/supabase";
import { getParentChildren } from "@/lib/parent-data";
import {
  listStudentThreads,
  teacherAndStudentShareBooking,
} from "@/lib/messages";
import { ThreadList } from "@/components/messages/ThreadList";
import { ThreadView } from "@/components/messages/ThreadView";

export const dynamic = "force-dynamic";

export default async function ParentThreadPage({
  params,
}: {
  params: { teacherSlug: string };
}) {
  const user = await getAuthedStudent();
  if (!user) redirect("/sign-in");

  const teacher = await getTeacherBySlug(params.teacherSlug);
  if (!teacher) notFound();

  // The parent always sends as their own email — but they may also have a
  // teacher-initiated thread under one of their children's linked emails. If
  // a thread exists under that linked email AND not under the parent's own,
  // we'll surface that channel instead.
  const children = await getParentChildren(user.email);
  const knownEmails = [
    user.email,
    ...children
      .map((c) => c.linked_booking_email)
      .filter((e): e is string => Boolean(e)),
  ];
  const allThreads = await listStudentThreads(knownEmails);
  const threadForTeacher = allThreads.find(
    (t) => t.teacher_id === teacher.id
  );

  // Default channel = parent's own email (so future replies stay there).
  let channel = user.email.toLowerCase();
  if (
    threadForTeacher &&
    threadForTeacher.student_email.toLowerCase() !== channel
  ) {
    channel = threadForTeacher.student_email.toLowerCase();
  }

  const allowed = await teacherAndStudentShareBooking(teacher.id, channel);
  if (!allowed) {
    // Fall back to the parent's email channel if the other one isn't booked.
    const fallbackAllowed = await teacherAndStudentShareBooking(
      teacher.id,
      user.email.toLowerCase()
    );
    if (!fallbackAllowed) notFound();
    channel = user.email.toLowerCase();
  }

  const endpoint = `/api/parent/messages/${teacher.slug}?channel=${encodeURIComponent(channel)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Messages
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <section className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-soft lg:block">
          <ThreadList
            threads={allThreads}
            viewerRole="student"
            basePath="/parent/messages"
            activeKey={teacher.slug}
          />
        </section>
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <ThreadView
            endpoint={endpoint}
            viewerRole="student"
            headerTitle={teacher.name}
            headerSubtitle={teacher.subject}
            backHref="/parent/messages"
          />
        </section>
      </div>
    </div>
  );
}
