import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import { getTeacherBySlug } from "@/lib/supabase";
import {
  MESSAGE_MAX_LEN,
  getThread,
  insertMessage,
  markThreadRead,
  teacherAndStudentShareBooking,
} from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Parents always converse with a teacher under their authenticated email.
// If their child's booking used a different email, a teacher-initiated thread
// would land on that other email — the inbox aggregates both via
// `parent_children.linked_booking_email`, but sending is always done as the
// parent's own email so replies stay in one channel going forward.

export async function GET(
  req: Request,
  { params }: { params: { teacherSlug: string } }
) {
  const user = await getAuthedStudent();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const teacher = await getTeacherBySlug(params.teacherSlug);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const after = url.searchParams.get("after") || undefined;
  const skipRead = url.searchParams.get("skip_read") === "1";
  // Optional: which student-email "channel" to load. Defaults to the parent's
  // own email; can be overridden to view a child's linked booking thread.
  const channel = (url.searchParams.get("channel") || user.email).toLowerCase();

  const allowed = await teacherAndStudentShareBooking(teacher.id, channel);
  if (!allowed) {
    return NextResponse.json(
      { error: "No booking with this teacher" },
      { status: 403 }
    );
  }

  const messages = await getThread({
    teacherId: teacher.id,
    studentEmail: channel,
    after,
  });
  if (!skipRead && !after) {
    await markThreadRead({
      teacherId: teacher.id,
      studentEmail: channel,
      viewerRole: "student",
    });
  }
  return NextResponse.json({
    messages,
    teacher: {
      id: teacher.id,
      name: teacher.name,
      slug: teacher.slug,
      subject: teacher.subject,
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { teacherSlug: string } }
) {
  const user = await getAuthedStudent();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const teacher = await getTeacherBySlug(params.teacherSlug);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  let body: { body?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.body !== "string") {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const text = body.body.trim();
  if (!text) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  }
  if (text.length > MESSAGE_MAX_LEN) {
    return NextResponse.json(
      { error: `Message is too long (max ${MESSAGE_MAX_LEN} characters)` },
      { status: 400 }
    );
  }

  const allowed = await teacherAndStudentShareBooking(teacher.id, user.email);
  if (!allowed) {
    return NextResponse.json(
      { error: "No booking with this teacher" },
      { status: 403 }
    );
  }

  try {
    const msg = await insertMessage({
      teacherId: teacher.id,
      studentEmail: user.email,
      studentName: user.fullName || user.email,
      senderRole: "student",
      body: text,
    });
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (err) {
    console.error("[messages] student send failed", err);
    return NextResponse.json(
      { error: "Could not send message" },
      { status: 500 }
    );
  }
}
