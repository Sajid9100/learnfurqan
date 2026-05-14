import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { ToastProvider } from "@/components/admin/Toast";
import { getAuthedTeacher } from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    // Not signed in OR signed in but no teacher row matches the email.
    // The middleware already enforces sign-in, so this is the "not a teacher"
    // case — punt them home.
    redirect("/");
  }
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <TeacherSidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
