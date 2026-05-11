import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/admin-auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminRequest()) {
    redirect("/admin");
  }
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
