import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { Booking, ParentChild } from "@/lib/types";

export async function getParentChildren(
  parentEmail: string
): Promise<ParentChild[]> {
  if (!isSupabaseAdminConfigured) return [];
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("parent_children")
    .select("*")
    .ilike("parent_email", parentEmail)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[parent] failed to load children", error.message);
    return [];
  }
  return (data ?? []) as ParentChild[];
}

export async function getBookingsForEmails(
  emails: string[]
): Promise<Record<string, Booking[]>> {
  const out: Record<string, Booking[]> = {};
  const unique = Array.from(
    new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  if (unique.length === 0 || !isSupabaseAdminConfigured) return out;

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("bookings")
    .select("*")
    .in("student_email", unique)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[parent] failed to load bookings", error.message);
    return out;
  }
  for (const b of (data ?? []) as Booking[]) {
    const key = b.student_email.toLowerCase();
    (out[key] ||= []).push(b);
  }
  return out;
}

export function summarizeBookings(bookings: Booking[]) {
  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const upcoming = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const next =
    upcoming.find((b) => b.status === "confirmed") ?? upcoming[0] ?? null;
  const teacher = next?.teacher_name ?? bookings[0]?.teacher_name ?? "";
  return { total, completed, upcoming: upcoming.length, next, teacher };
}
