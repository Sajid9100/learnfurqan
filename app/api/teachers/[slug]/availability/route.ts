import { NextResponse } from "next/server";
import { expandAvailability } from "@/lib/availability";
import {
  getAvailabilityExceptions,
  getAvailabilityRules,
  getBookedRangesForTeacher,
  getTeacherBySlug,
} from "@/lib/supabase";

export const runtime = "nodejs";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_DAYS = 14;
const MAX_WINDOW_DAYS = 60;

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const teacher = await getTeacherBySlug(params.slug);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const from = parseDate(searchParams.get("from")) ?? new Date();
  const requestedTo =
    parseDate(searchParams.get("to")) ??
    new Date(from.getTime() + DEFAULT_WINDOW_DAYS * DAY_MS);

  // Clamp the requested window to prevent expensive scans.
  const maxTo = new Date(from.getTime() + MAX_WINDOW_DAYS * DAY_MS);
  const to = requestedTo > maxTo ? maxTo : requestedTo;

  const duration = teacher.class_duration_minutes ?? 30;

  const [rules, exceptions, booked] = await Promise.all([
    getAvailabilityRules(teacher.id),
    getAvailabilityExceptions(
      teacher.id,
      from.toISOString().slice(0, 10),
      to.toISOString().slice(0, 10)
    ),
    getBookedRangesForTeacher(
      teacher.id,
      from.toISOString(),
      to.toISOString(),
      duration
    ),
  ]);

  const slots = expandAvailability({
    rules,
    exceptions,
    classDurationMinutes: duration,
    from,
    to,
    bookedRanges: booked,
  });

  return NextResponse.json({
    teacher_id: teacher.id,
    teacher_slug: teacher.slug,
    class_duration_minutes: duration,
    from: from.toISOString(),
    to: to.toISOString(),
    slots,
  });
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}
