import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { TEACHERS as SEED_TEACHERS } from "./teachers-data";
import type {
  BookingInsert,
  Teacher,
  TeacherApplicationInsert,
  TeacherFilters,
} from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPlaceholder = (v: string | undefined) =>
  !v || v.includes("your_supabase") || v.includes("your-project");

export const isSupabaseConfigured =
  !isPlaceholder(url) && !isPlaceholder(anonKey);

export const isSupabaseAdminConfigured =
  isSupabaseConfigured && !isPlaceholder(serviceKey);

// ---------------------------------------------------------------------------
// Browser client — safe to import anywhere. Uses anon key.
// ---------------------------------------------------------------------------
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: false } })
  : null;

// ---------------------------------------------------------------------------
// Server client — service role. Only call from server-side code (API routes,
// route handlers, Server Components). Bypasses RLS.
// ---------------------------------------------------------------------------
export function createServerSupabaseClient(): SupabaseClient {
  if (!isSupabaseAdminConfigured) {
    throw new Error(
      "Supabase service role is not configured. Set SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in .env.local."
    );
  }
  return createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------------------------------------------------------------------------
// Helpers — fall back to seed data when Supabase isn't configured so the
// dev/demo experience keeps working.
// ---------------------------------------------------------------------------

export async function getTeachers(filters?: TeacherFilters): Promise<Teacher[]> {
  if (!supabase) {
    return applyFiltersToSeed(SEED_TEACHERS, filters);
  }

  let q = supabase.from("teachers").select("*").eq("is_active", true);
  if (filters?.gender) q = q.eq("gender", filters.gender);
  if (typeof filters?.is_featured === "boolean")
    q = q.eq("is_featured", filters.is_featured);
  if (filters?.language) q = q.ilike("language", `%${filters.language}%`);

  const { data, error } = await q.order("rating", { ascending: false });
  if (error) {
    console.warn("[supabase] getTeachers fallback to seed:", error.message);
    return applyFiltersToSeed(SEED_TEACHERS, filters);
  }
  return (data ?? []) as Teacher[];
}

export async function getTeacherBySlug(slug: string): Promise<Teacher | null> {
  if (!supabase) {
    return SEED_TEACHERS.find((t) => t.slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    console.warn("[supabase] getTeacherBySlug fallback to seed:", error.message);
    return SEED_TEACHERS.find((t) => t.slug === slug) ?? null;
  }
  return (data as Teacher) ?? null;
}

export async function createBooking(
  data: BookingInsert
): Promise<{ id: string }> {
  if (!isSupabaseAdminConfigured) {
    return { id: `mock_${Date.now()}` };
  }
  const admin = createServerSupabaseClient();
  const { data: row, error } = await admin
    .from("bookings")
    .insert(data)
    .select("id")
    .single();
  if (error) throw error;
  return { id: row.id as string };
}

// Returns true if the student already has a non-cancelled booking with this
// teacher — i.e. their free first class has been used and the next one needs
// to be paid for.
export async function hasPriorBookingWithTeacher(
  studentEmail: string,
  teacherId: string
): Promise<boolean> {
  if (!isSupabaseAdminConfigured) return false;
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("bookings")
    .select("id")
    .eq("student_email", studentEmail.toLowerCase())
    .eq("teacher_id", teacherId)
    .neq("status", "cancelled")
    .limit(1);
  if (error) {
    console.warn("[supabase] hasPriorBookingWithTeacher failed:", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function createTeacherApplication(
  data: TeacherApplicationInsert
): Promise<{ id: string }> {
  if (!isSupabaseAdminConfigured) {
    return { id: `mock_${Date.now()}` };
  }
  const admin = createServerSupabaseClient();
  const { data: row, error } = await admin
    .from("teacher_applications")
    .insert(data)
    .select("id")
    .single();
  if (error) throw error;
  return { id: row.id as string };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------
function applyFiltersToSeed(
  list: Teacher[],
  filters?: TeacherFilters
): Teacher[] {
  let out = list.slice();
  if (filters?.gender) out = out.filter((t) => t.gender === filters.gender);
  if (typeof filters?.is_featured === "boolean")
    out = out.filter((t) => t.is_featured === filters.is_featured);
  if (filters?.language) {
    const re = new RegExp(filters.language, "i");
    out = out.filter((t) => re.test(t.language));
  }
  return out.sort((a, b) => b.rating - a.rating);
}
