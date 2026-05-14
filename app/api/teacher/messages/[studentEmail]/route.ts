import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import {
  MESSAGE_MAX_LEN,
  getThread,
  insertMessage,
  lookupStudentNameForThread,
  markThreadRead,
  teacherAndStudentShareBooking,
} from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { studentEmail: string } }
) {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const studentEmail = decodeURIComponent(params.studentEmail).toLowerCase();

  const allowed = await teacherAndStudentShareBooking(teacher.id, studentEmail);
  if (!allowed) {
    return NextResponse.json(
      { error: "No booking with this student" },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const after = url.searchParams.get("after") || undefined;
  const skipRead = url.searchParams.get("skip_read") === "1";

  const messages = await getThread({
    teacherId: teacher.id,
    studentEmail,
    after,
  });
  if (!skipRead && !after) {
    // Only mark-read on the initial load. Polling fetches (`after`) skip this
    // so the read pointer doesn't move every 5 seconds.
    await markThreadRead({
      teacherId: teacher.id,
      studentEmail,
      viewerRole: "teacher",
    });
  }
  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: { studentEmail: string } }
) {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const studentEmail = decodeURIComponent(params.studentEmail).toLowerCase();
  const allowed = await teacherAndStudentShareBooking(teacher.id, studentEmail);
  if (!allowed) {
    return NextResponse.json(
      { error: "No booking with this student" },
      { status: 403 }
    );
  }

  const studentName = await lookupStudentNameForThread(teacher.id, studentEmail);

  try {
    const msg = await insertMessage({
      teacherId: teacher.id,
      studentEmail,
      studentName,
      senderRole: "teacher",
      body: text,
    });
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (err) {
    console.error("[messages] teacher send failed", err);
    return NextResponse.json(
      { error: "Could not send message" },
      { status: 500 }
    );
  }
}

