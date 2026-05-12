import { redirect } from "next/navigation";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import type { ParentPreferences } from "@/lib/types";
import { PreferencesForm } from "./PreferencesForm";

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

async function loadPreferences(email: string): Promise<ParentPreferences> {
  if (!isSupabaseAdminConfigured) return defaults(email);
  const admin = createServerSupabaseClient();
  const { data } = await admin
    .from("parent_preferences")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  return (data as ParentPreferences) ?? defaults(email);
}

export default async function ParentSettingsPage() {
  const parent = await getAuthedStudent();
  if (!parent) redirect("/sign-in");
  const prefs = await loadPreferences(parent.email);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and notification preferences.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Account
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <Row label="Name" value={parent.fullName} />
          <Row label="Email" value={parent.email} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Manage your name or email from the account menu (top-right).
        </p>
      </section>

      <PreferencesForm initial={prefs} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-2 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}
