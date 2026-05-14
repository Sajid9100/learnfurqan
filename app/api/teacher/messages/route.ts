import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import { listTeacherThreads } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const threads = await listTeacherThreads(teacher.id, teacher.name, teacher.slug);
  return NextResponse.json({ threads });
}
