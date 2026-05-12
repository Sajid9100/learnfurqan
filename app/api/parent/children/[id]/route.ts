import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import {
  CHILD_LEVELS,
  LEARNING_GOALS,
  type Booking,
  type ChildLevel,
  type LearningGoal,
  type ParentChild,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadChild(
  adminClient: ReturnType<typeof createServerSupabaseClient>,
  id: string,
  parentEmail: string
): Promise<ParentChild | null> {
  const { data } = await adminClient
    .from("parent_children")
    .select("*")
    .eq("id", id)
    .ilike("parent_email", parentEmail)
    .maybeSingle();
  return (data as ParentChild) ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
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

  const admin = createServerSupabaseClient();
  const child = await loadChild(admin, params.id, parent.email);
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lookupEmail = (child.linked_booking_email || parent.email).trim();
  let bookings: Booking[] = [];
  if (lookupEmail) {
    const { data } = await admin
      .from("bookings")
      .select("*")
      .ilike("student_email", lookupEmail)
      .order("created_at", { ascending: false });
    bookings = (data ?? []) as Booking[];
  }

  return NextResponse.json({ child, bookings });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  const admin = createServerSupabaseClient();
  const existing = await loadChild(admin, params.id, parent.email);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const patch: Partial<ParentChild> = {};
  if (typeof body.child_name === "string") patch.child_name = body.child_name.trim();
  if (body.child_age !== undefined) {
    const age = Number(body.child_age);
    if (!Number.isFinite(age) || age < 3 || age > 25) {
      return NextResponse.json(
        { error: "Child age must be between 3 and 25" },
        { status: 400 }
      );
    }
    patch.child_age = age;
  }
  if (body.learning_goal !== undefined) {
    if (!LEARNING_GOALS.includes(body.learning_goal as LearningGoal)) {
      return NextResponse.json(
        { error: `learning_goal must be one of ${LEARNING_GOALS.join(", ")}` },
        { status: 400 }
      );
    }
    patch.learning_goal = body.learning_goal as LearningGoal;
  }
  if (body.current_level !== undefined) {
    if (!CHILD_LEVELS.includes(body.current_level as ChildLevel)) {
      return NextResponse.json(
        { error: `current_level must be one of ${CHILD_LEVELS.join(", ")}` },
        { status: 400 }
      );
    }
    patch.current_level = body.current_level as ChildLevel;
  }
  if (body.linked_booking_email !== undefined) {
    patch.linked_booking_email = body.linked_booking_email.trim().toLowerCase();
  }

  const { data, error } = await admin
    .from("parent_children")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ child: data as ParentChild });
}
