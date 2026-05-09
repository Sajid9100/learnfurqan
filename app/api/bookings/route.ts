import { NextResponse } from "next/server";
import { createBooking, getTeacherBySlug } from "@/lib/supabase";
import { sendBookingConfirmationEmails } from "@/lib/email";
import type { AgeGroup, StudentLevel } from "@/lib/types";

export const runtime = "nodejs";

type BookingPayload = {
  teacher_slug: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_country: string;
  age_group: AgeGroup;
  current_level: StudentLevel;
  selected_slot: string;
  message?: string;
};

const VALID_AGE: AgeGroup[] = ["child", "teen", "adult"];
const VALID_LEVEL: StudentLevel[] = ["beginner", "can-read", "intermediate"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Partial<BookingPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validate(body);
  if (errors.length) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 }
    );
  }

  const teacher = await getTeacherBySlug(body.teacher_slug!);
  if (!teacher) {
    return NextResponse.json(
      { error: `Teacher not found: ${body.teacher_slug}` },
      { status: 404 }
    );
  }

  if (!teacher.available_slots.includes(body.selected_slot!)) {
    return NextResponse.json(
      { error: "Selected slot is not available for this teacher" },
      { status: 400 }
    );
  }

  try {
    const { id } = await createBooking({
      teacher_id: teacher.id,
      teacher_name: teacher.name,
      teacher_slug: teacher.slug,
      student_name: body.student_name!.trim(),
      student_email: body.student_email!.trim().toLowerCase(),
      student_phone: body.student_phone!.trim(),
      student_country: body.student_country!.trim(),
      age_group: body.age_group!,
      current_level: body.current_level!,
      selected_slot: body.selected_slot!,
      message: (body.message ?? "").trim(),
    });

    // Fire-and-forget email send so a transient Resend failure doesn't fail
    // the whole request — the booking is already saved.
    sendBookingConfirmationEmails({
      studentName: body.student_name!.trim(),
      studentEmail: body.student_email!.trim(),
      studentPhone: body.student_phone!.trim(),
      studentCountry: body.student_country!.trim(),
      ageGroup: body.age_group!,
      currentLevel: body.current_level!,
      selectedSlot: body.selected_slot!,
      message: (body.message ?? "").trim(),
      teacher,
    }).catch((err) => {
      console.error("[bookings] email send failed", err);
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error("[bookings] insert failed", err);
    return NextResponse.json(
      { error: "Could not save booking. Please try again." },
      { status: 500 }
    );
  }
}

function validate(p: Partial<BookingPayload>): string[] {
  const e: string[] = [];
  if (!p.teacher_slug) e.push("teacher_slug is required");
  if (!p.student_name?.trim()) e.push("student_name is required");
  if (!p.student_email?.trim()) e.push("student_email is required");
  else if (!EMAIL_RE.test(p.student_email)) e.push("student_email is invalid");
  if (!p.student_phone?.trim()) e.push("student_phone is required");
  if (!p.student_country?.trim()) e.push("student_country is required");
  if (!p.age_group || !VALID_AGE.includes(p.age_group))
    e.push(`age_group must be one of ${VALID_AGE.join(", ")}`);
  if (!p.current_level || !VALID_LEVEL.includes(p.current_level))
    e.push(`current_level must be one of ${VALID_LEVEL.join(", ")}`);
  if (!p.selected_slot?.trim()) e.push("selected_slot is required");
  return e;
}
