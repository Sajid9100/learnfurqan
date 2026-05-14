import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  let body: { lesson_notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.lesson_notes !== "string") {
    return NextResponse.json(
      { error: "lesson_notes is required" },
      { status: 400 }
    );
  }
  const notes = body.lesson_notes.trim();
  if (notes.length > 5000) {
    return NextResponse.json(
      { error: "lesson_notes must be 5000 characters or fewer" },
      { status: 400 }
    );
  }

  const admin = createServerSupabaseClient();
  const { data: booking, error: lookupErr } = await admin
    .from("bookings")
    .select("id, teacher_id, status")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupErr) {
    return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  }
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.teacher_id !== teacher.id) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: "Notes can only be added to completed classes" },
      { status: 409 }
    );
  }

  const { data: updated, error } = await admin
    .from("bookings")
    .update({ lesson_notes: notes })
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ booking: updated as Booking });
}
