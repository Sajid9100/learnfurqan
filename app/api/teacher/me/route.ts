import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ teacher: null });
  }
  return NextResponse.json({
    teacher: { id: teacher.id, name: teacher.name, slug: teacher.slug },
  });
}
