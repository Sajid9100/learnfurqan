import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ParentSidebar } from "@/components/parent/ParentSidebar";
import { ToastProvider } from "@/components/admin/Toast";

export const dynamic = "force-dynamic";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <ParentSidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
