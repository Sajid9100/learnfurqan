import { getAuthedTeacher } from "@/lib/teacher-auth";
import { listTeacherThreads } from "@/lib/messages";
import { ThreadList } from "@/components/messages/ThreadList";

export const dynamic = "force-dynamic";

export default async function TeacherMessagesPage() {
  const teacher = (await getAuthedTeacher())!;
  const threads = await listTeacherThreads(teacher.id, teacher.name, teacher.slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay in touch with your students between classes.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <ThreadList
          threads={threads}
          viewerRole="teacher"
          basePath="/teacher/messages"
        />
      </section>
    </div>
  );
}
