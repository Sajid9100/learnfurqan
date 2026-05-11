import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/email";
import type { TeacherApplication } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS: TeacherApplication["status"][] = [
  "pending",
  "approved",
  "rejected",
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

  let body: { status?: TeacherApplication["status"] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.status || !VALID_STATUS.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of ${VALID_STATUS.join(", ")}` },
      { status: 400 }
    );
  }

  const admin = createServerSupabaseClient();
  const { data: updated, error } = await admin
    .from("teacher_applications")
    .update({ status: body.status })
    .eq("id", params.id)
    .select("*")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  if (body.status === "approved") {
    sendApplicationApprovedEmail({
      name: updated.name,
      email: updated.email,
      subject: updated.subject,
    }).catch((err) =>
      console.error("[admin/applications] approval email failed", err)
    );
  } else if (body.status === "rejected") {
    sendApplicationRejectedEmail({
      name: updated.name,
      email: updated.email,
      subject: updated.subject,
    }).catch((err) =>
      console.error("[admin/applications] rejection email failed", err)
    );
  }

  return NextResponse.json({ application: updated });
}
