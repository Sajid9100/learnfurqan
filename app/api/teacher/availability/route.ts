import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_WEEKDAY = [0, 1, 2, 3, 4, 5, 6];
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ rules: [], exceptions: [] });
  }
  const admin = createServerSupabaseClient();
  const [rulesRes, exRes] = await Promise.all([
    admin
      .from("teacher_availability_rules")
      .select("*")
      .eq("teacher_id", teacher.id)
      .order("weekday")
      .order("start_time"),
    admin
      .from("teacher_availability_exceptions")
      .select("*")
      .eq("teacher_id", teacher.id)
      .order("exception_date"),
  ]);
  if (rulesRes.error) {
    return NextResponse.json(
      { error: rulesRes.error.message },
      { status: 500 }
    );
  }
  if (exRes.error) {
    return NextResponse.json({ error: exRes.error.message }, { status: 500 });
  }
  return NextResponse.json({
    rules: rulesRes.data ?? [],
    exceptions: exRes.data ?? [],
  });
}

export async function POST(req: Request) {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
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

  const kind = body.kind;
  if (kind === "rule") {
    const weekday = Number(body.weekday);
    const start_time = String(body.start_time ?? "");
    const end_time = String(body.end_time ?? "");
    const timezone = String(body.timezone ?? "").trim();
    if (!VALID_WEEKDAY.includes(weekday)) {
      return NextResponse.json(
        { error: "weekday must be 0-6" },
        { status: 400 }
      );
    }
    if (!TIME_RE.test(start_time) || !TIME_RE.test(end_time)) {
      return NextResponse.json(
        { error: "start_time/end_time must be HH:MM[:SS]" },
        { status: 400 }
      );
    }
    if (!timezone) {
      return NextResponse.json(
        { error: "timezone is required" },
        { status: 400 }
      );
    }
    if (!isValidTimezone(timezone)) {
      return NextResponse.json(
        { error: `Unknown IANA timezone: ${timezone}` },
        { status: 400 }
      );
    }
    const admin = createServerSupabaseClient();
    const { data, error } = await admin
      .from("teacher_availability_rules")
      .insert({
        teacher_id: teacher.id,
        weekday,
        start_time,
        end_time,
        timezone,
        is_active: body.is_active === false ? false : true,
      })
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rule: data }, { status: 201 });
  }

  if (kind === "exception") {
    const exception_date = String(body.exception_date ?? "");
    const exKind = body.exception_kind === "extra" ? "extra" : "block";
    if (!DATE_RE.test(exception_date)) {
      return NextResponse.json(
        { error: "exception_date must be YYYY-MM-DD" },
        { status: 400 }
      );
    }
    const start_time = body.start_time ? String(body.start_time) : null;
    const end_time = body.end_time ? String(body.end_time) : null;
    const timezone = body.timezone ? String(body.timezone).trim() : null;
    if (start_time && !TIME_RE.test(start_time)) {
      return NextResponse.json(
        { error: "start_time invalid" },
        { status: 400 }
      );
    }
    if (end_time && !TIME_RE.test(end_time)) {
      return NextResponse.json({ error: "end_time invalid" }, { status: 400 });
    }
    if (exKind === "extra" && (!start_time || !end_time || !timezone)) {
      return NextResponse.json(
        { error: "extra exceptions need start_time, end_time, timezone" },
        { status: 400 }
      );
    }
    if (timezone && !isValidTimezone(timezone)) {
      return NextResponse.json(
        { error: `Unknown IANA timezone: ${timezone}` },
        { status: 400 }
      );
    }
    const admin = createServerSupabaseClient();
    const { data, error } = await admin
      .from("teacher_availability_exceptions")
      .insert({
        teacher_id: teacher.id,
        exception_date,
        kind: exKind,
        start_time,
        end_time,
        timezone,
        notes: typeof body.notes === "string" ? body.notes : "",
      })
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ exception: data }, { status: 201 });
  }

  return NextResponse.json(
    { error: "kind must be 'rule' or 'exception'" },
    { status: 400 }
  );
}

export async function DELETE(req: Request) {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const rowId = searchParams.get("row_id");
  if (!rowId) {
    return NextResponse.json({ error: "row_id is required" }, { status: 400 });
  }
  if (kind !== "rule" && kind !== "exception") {
    return NextResponse.json(
      { error: "kind must be 'rule' or 'exception'" },
      { status: 400 }
    );
  }
  const table =
    kind === "rule"
      ? "teacher_availability_rules"
      : "teacher_availability_exceptions";

  const admin = createServerSupabaseClient();
  const { error } = await admin
    .from(table)
    .delete()
    .eq("id", rowId)
    .eq("teacher_id", teacher.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
