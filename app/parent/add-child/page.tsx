import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { Booking } from "@/lib/types";
import { AddChildForm } from "./AddChildForm";

export const dynamic = "force-dynamic";

async function loadParentBookings(email: string): Promise<Booking[]> {
  if (!isSupabaseAdminConfigured) return [];
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("bookings")
    .select("*")
    .ilike("student_email", email)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[add-child] failed to load bookings", error.message);
    return [];
  }
  return (data ?? []) as Booking[];
}

export default async function AddChildPage() {
  const parent = await getAuthedStudent();
  if (!parent) redirect("/sign-in");
  const bookings = await loadParentBookings(parent.email);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/parent"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Add a child
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your child to your account to start monitoring their progress.
        </p>
      </div>

      <AddChildForm parentEmail={parent.email} bookings={bookings} />
    </div>
  );
}
