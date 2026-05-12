import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import {
  CHILD_LEVELS,
  LEARNING_GOALS,
  type ChildLevel,
  type LearningGoal,
  type ParentChild,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const parent = await getAuthedStudent();
  if (!parent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ children: [] });
  }
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("parent_children")
    .select("*")
    .ilike("parent_email", parent.email)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ children: (data ?? []) as ParentChild[] });
}

export async function POST(req: Request) {
  const parent = await getAuthedStudent();
  if (!parent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: {
    child_name?: string;
    child_age?: number | string;
    learning_goal?: string;
    current_level?: string;
    linked_booking_email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const child_name = (body.child_name ?? "").trim();
  const age = Number(body.child_age);
  const learning_goal = (body.learning_goal ?? "") as LearningGoal;
  const current_level = (body.current_level ?? "") as ChildLevel;
  const linked_booking_email = (body.linked_booking_email ?? "")
    .trim()
    .toLowerCase();

  if (!child_name) {
    return NextResponse.json({ error: "Child name is required" }, { status: 400 });
  }
  if (!Number.isFinite(age) || age < 3 || age > 25) {
    return NextResponse.json(
      { error: "Child age must be between 3 and 25" },
      { status: 400 }
    );
  }
  if (!LEARNING_GOALS.includes(learning_goal)) {
    return NextResponse.json(
      { error: `learning_goal must be one of ${LEARNING_GOALS.join(", ")}` },
      { status: 400 }
    );
  }
  if (!CHILD_LEVELS.includes(current_level)) {
    return NextResponse.json(
      { error: `current_level must be one of ${CHILD_LEVELS.join(", ")}` },
      { status: 400 }
    );
  }

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("parent_children")
    .insert({
      parent_email: parent.email,
      child_name,
      child_age: age,
      learning_goal,
      current_level,
      linked_booking_email,
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ child: data as ParentChild });
}
