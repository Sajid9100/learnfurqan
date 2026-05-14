import { notFound } from "next/navigation";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import {
  listTeacherThreads,
  teacherAndStudentShareBooking,
} from "@/lib/messages";
import { ThreadList } from "@/components/messages/ThreadList";
import { ThreadView } from "@/components/messages/ThreadView";

export const dynamic = "force-dynamic";

export default async function TeacherThreadPage({
  params,
}: {
  params: { studentEmail: string };
}) {
  const teacher = (await getAuthedTeacher())!;
  const studentEmail = decodeURIComponent(params.studentEmail).toLowerCase();

  const allowed = await teacherAndStudentShareBooking(teacher.id, studentEmail);
  if (!allowed) notFound();

  const threads = await listTeacherThreads(teacher.id, teacher.name, teacher.slug);
  const current = threads.find(
    (t) => t.student_email.toLowerCase() === studentEmail
  );
  const displayName = current?.student_name || studentEmail;

  const endpoint = `/api/teacher/messages/${encodeURIComponent(studentEmail)}`;

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
            threads={threads}
            viewerRole="teacher"
            basePath="/teacher/messages"
            activeKey={studentEmail}
          />
        </section>
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <ThreadView
            endpoint={endpoint}
            viewerRole="teacher"
            headerTitle={displayName}
            headerSubtitle={studentEmail}
            backHref="/teacher/messages"
          />
        </section>
      </div>
    </div>
  );
}
