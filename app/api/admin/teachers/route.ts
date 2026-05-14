import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { Teacher } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({
      teachers: [],
      warning: "Supabase not configured",
    });
  }
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ teachers: data ?? [] });
}

type TeacherInsert = Omit<Teacher, "id">;

const REQUIRED: (keyof TeacherInsert)[] = [
  "name",
  "gender",
  "subject",
  "language",
  "country",
  "country_flag",
  "experience_years",
  "price_per_class",
  "slug",
];

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }
  let body: Partial<TeacherInsert> & { is_active?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const missing = REQUIRED.filter((k) => {
    const v = body[k];
    return v === undefined || v === null || v === "";
  });
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const row = {
    name: body.name!.trim(),
    gender: body.gender!,
    subject: body.subject!.trim(),
    language: body.language!.trim(),
    country: body.country!.trim(),
    country_flag: body.country_flag!.trim(),
    experience_years: Number(body.experience_years),
    price_per_class: Number(body.price_per_class),
    rating: body.rating !== undefined ? Number(body.rating) : 5.0,
    review_count:
      body.review_count !== undefined ? Number(body.review_count) : 0,
    bio: (body.bio ?? "").trim(),
    teaching_style: (body.teaching_style ?? "").trim(),
    certifications: (body.certifications ?? "").trim(),
    intro_video_url: (body.intro_video_url ?? "").trim(),
    available_slots: Array.isArray(body.available_slots)
      ? body.available_slots
      : [],
    is_featured: Boolean(body.is_featured),
    slug: body.slug!.trim(),
    is_active: body.is_active === false ? false : true,
    class_duration_minutes:
      body.class_duration_minutes !== undefined
        ? Number(body.class_duration_minutes)
        : 30,
    email: normalizeEmail(body.email),
  };

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ teacher: data }, { status: 201 });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (!EMAIL_RE.test(v)) return null;
  return v;
}
