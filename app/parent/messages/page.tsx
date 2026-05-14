import { redirect } from "next/navigation";
import { getAuthedStudent } from "@/lib/student-auth";
import { getParentChildren } from "@/lib/parent-data";
import { listStudentThreads } from "@/lib/messages";
import { ThreadList } from "@/components/messages/ThreadList";

export const dynamic = "force-dynamic";

export default async function ParentMessagesPage() {
  const user = await getAuthedStudent();
  if (!user) redirect("/sign-in");

  const children = await getParentChildren(user.email);
  const emails = [
    user.email,
    ...children
      .map((c) => c.linked_booking_email)
      .filter((e): e is string => Boolean(e)),
  ];
  const threads = await listStudentThreads(emails);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reach out to your child's teacher between classes.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <ThreadList
          threads={threads}
          viewerRole="student"
          basePath="/parent/messages"
          emptyMessage="No conversations yet. Once you book a class, you can message the teacher here."
        />
      </section>
    </div>
  );
}
