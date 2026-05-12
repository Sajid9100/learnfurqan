import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { ParentPreferences } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function defaults(email: string): ParentPreferences {
  return {
    email,
    notify_confirmed: true,
    notify_zoom: true,
    notify_reminder: true,
    notify_notes: true,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  const parent = await getAuthedStudent();
  if (!parent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ preferences: defaults(parent.email) });
  }

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("parent_preferences")
    .select("*")
    .eq("email", parent.email)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    preferences: (data as ParentPreferences) ?? defaults(parent.email),
  });
}

export async function PATCH(req: Request) {
  const parent = await getAuthedStudent();
  if (!parent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: Partial<
    Pick<
      ParentPreferences,
      "notify_confirmed" | "notify_zoom" | "notify_reminder" | "notify_notes"
    >
  >;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const upsert: ParentPreferences = {
    ...defaults(parent.email),
    ...(typeof body.notify_confirmed === "boolean" && {
      notify_confirmed: body.notify_confirmed,
    }),
    ...(typeof body.notify_zoom === "boolean" && {
      notify_zoom: body.notify_zoom,
    }),
    ...(typeof body.notify_reminder === "boolean" && {
      notify_reminder: body.notify_reminder,
    }),
    ...(typeof body.notify_notes === "boolean" && {
      notify_notes: body.notify_notes,
    }),
    updated_at: new Date().toISOString(),
  };

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("parent_preferences")
    .upsert(upsert, { onConflict: "email" })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ preferences: data as ParentPreferences });
}
