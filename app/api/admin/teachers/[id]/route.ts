import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { Teacher } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED: (keyof Teacher | "is_active" | "class_duration_minutes")[] = [
  "name",
  "gender",
  "subject",
  "language",
  "country",
  "country_flag",
  "experience_years",
  "price_per_class",
  "rating",
  "review_count",
  "bio",
  "teaching_style",
  "certifications",
  "intro_video_url",
  "available_slots",
  "is_featured",
  "slug",
  "is_active",
  "class_duration_minutes",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No updatable fields provided" },
      { status: 400 }
    );
  }

  // Coerce numeric fields when present
  for (const k of [
    "experience_years",
    "price_per_class",
    "rating",
    "review_count",
    "class_duration_minutes",
  ]) {
    if (k in update) update[k] = Number(update[k]);
  }

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }
  return NextResponse.json({ teacher: data });
}
