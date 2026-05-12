import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (isAdminRequest()) {
    redirect("/admin/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-primary">
            LearnFurqan Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your password to access the dashboard.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
