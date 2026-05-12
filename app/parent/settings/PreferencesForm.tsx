"use client";

import { useState } from "react";
import type { ParentPreferences } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

type PrefKey =
  | "notify_confirmed"
  | "notify_zoom"
  | "notify_reminder"
  | "notify_notes";

const TOGGLES: { key: PrefKey; label: string; description: string }[] = [
  {
    key: "notify_confirmed",
    label: "Class is confirmed",
    description: "When a teacher accepts a booking.",
  },
  {
    key: "notify_zoom",
    label: "Zoom link is sent",
    description: "When the join link is added to a booking.",
  },
  {
    key: "notify_reminder",
    label: "Class reminder",
    description: "One hour before each class starts.",
  },
  {
    key: "notify_notes",
    label: "Teacher sends a note",
    description: "Homework or feedback after class.",
  },
];

export function PreferencesForm({ initial }: { initial: ParentPreferences }) {
  const [prefs, setPrefs] = useState<ParentPreferences>(initial);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function toggle(key: PrefKey) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/parent/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notify_confirmed: prefs.notify_confirmed,
          notify_zoom: prefs.notify_zoom,
          notify_reminder: prefs.notify_reminder,
          notify_notes: prefs.notify_notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-white p-6 shadow-soft"
    >
      <h2 className="font-heading text-base font-semibold text-foreground">
        Email notifications
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose when LearnFurqan should email you about your children's classes.
      </p>

      <div className="mt-4 divide-y divide-border">
        {TOGGLES.map((t) => (
          <label
            key={t.key}
            className="flex cursor-pointer items-start justify-between gap-4 py-3"
          >
            <div>
              <div className="text-sm font-medium text-foreground">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </div>
            <Switch checked={prefs[t.key]} onChange={() => toggle(t.key)} />
          </label>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </form>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={
        "relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors " +
        (checked ? "bg-primary" : "bg-muted")
      }
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
          (checked ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}
