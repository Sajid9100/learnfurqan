import { NextResponse } from "next/server";
import { createTeacherApplication } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_LEN = 2000;

function clean(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function cleanList(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean)
      .join(", ")
      .slice(0, MAX_LEN);
  }
  return clean(value, MAX_LEN);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 60);
  const country = clean(body.country, 80);
  const subject = cleanList(body.subject);
  const certifications = clean(body.certifications, MAX_LEN);
  const demo_video_url = clean(body.demo_video_url, 500);
  const languages = cleanList(body.languages);
  const availability = cleanList(body.availability);
  const message = clean(body.message, MAX_LEN);
  const experienceRaw = Number(body.experience_years);
  const experience_years = Number.isFinite(experienceRaw)
    ? Math.max(0, Math.min(80, Math.floor(experienceRaw)))
    : 0;

  if (!name || !email || !phone || !country || !subject || !languages || !availability) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    const { id } = await createTeacherApplication({
      name,
      email,
      phone,
      country,
      subject,
      experience_years,
      certifications,
      demo_video_url,
      languages,
      availability,
      message,
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to submit application.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
