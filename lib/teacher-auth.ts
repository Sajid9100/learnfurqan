import { cache } from "react";
import { getAuthedStudent } from "./student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "./supabase";
import type { Teacher } from "./types";

// Resolve the authenticated user's teacher row by email match. Returns null when
// the user isn't signed in or no teacher row is linked to their email.
//
// `cache` here is React's per-request memo — multiple components in the same
// render get a single Supabase round-trip.
export const getAuthedTeacher = cache(async (): Promise<Teacher | null> => {
  const user = await getAuthedStudent();
  if (!user) return null;
  if (!isSupabaseAdminConfigured) return null;

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .select("*")
    .ilike("email", user.email)
    .maybeSingle();
  if (error) {
    console.warn("[teacher-auth] lookup failed:", error.message);
    return null;
  }
  return (data as Teacher) ?? null;
});
