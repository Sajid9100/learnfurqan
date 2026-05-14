import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import { getParentChildren } from "@/lib/parent-data";
import { listStudentThreads } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthedStudent();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Include any per-child linked booking emails so the parent can see
  // teacher messages addressed to bookings made under a different email.
  const children = await getParentChildren(user.email);
  const emails = [
    user.email,
    ...children
      .map((c) => c.linked_booking_email)
      .filter((e): e is string => Boolean(e)),
  ];
  const threads = await listStudentThreads(emails);
  return NextResponse.json({ threads });
}
