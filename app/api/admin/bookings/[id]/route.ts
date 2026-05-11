import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { sendZoomLinkEmail } from "@/lib/email";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS: Booking["status"][] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: { status?: Booking["status"]; zoom_link?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Partial<Booking> = {};
  if (typeof body.status === "string") {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of ${VALID_STATUS.join(", ")}` },
        { status: 400 }
      );
    }
    update.status = body.status;
  }
  if (typeof body.zoom_link === "string") {
    update.zoom_link = body.zoom_link.trim();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No updatable fields provided" },
      { status: 400 }
    );
  }

  const admin = createServerSupabaseClient();
  const { data: updated, error } = await admin
    .from("bookings")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // If a Zoom link was added (or replaced), notify the student.
  if (typeof body.zoom_link === "string" && update.zoom_link) {
    sendZoomLinkEmail({
      studentName: updated.student_name,
      studentEmail: updated.student_email,
      teacherName: updated.teacher_name,
      selectedSlot: updated.selected_slot,
      zoomLink: update.zoom_link,
    }).catch((err) => {
      console.error("[admin/bookings] zoom email failed", err);
    });
  }

  return NextResponse.json({ booking: updated });
}
