import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({
      applications: [],
      warning: "Supabase not configured",
    });
  }
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teacher_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ applications: data ?? [] });
}
