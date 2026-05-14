import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import { getParentChildren } from "@/lib/parent-data";
import { getReviewableBookings } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const parent = await getAuthedStudent();
  if (!parent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const children = await getParentChildren(parent.email);
  const emails = [
    parent.email,
    ...children.map((c) => c.linked_booking_email).filter(Boolean),
  ];
  const bookings = await getReviewableBookings(emails);
  return NextResponse.json({ bookings });
}
