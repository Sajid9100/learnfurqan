"use client";

import { useState } from "react";
import type { AgeGroup, StudentProfile } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

const AGE_GROUPS: { value: AgeGroup | ""; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "child", label: "Child (4-12)" },
  { value: "teen", label: "Teen (13-17)" },
  { value: "adult", label: "Adult (18+)" },
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Pakistan",
  "India",
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Australia",
  "Malaysia",
  "Other",
];

export function ProfileForm({ initial }: { initial: StudentProfile }) {
  const [phone, setPhone] = useState(initial.phone);
  const [country, setCountry] = useState(initial.country);
  const [ageGroup, setAgeGroup] = useState<StudentProfile["age_group"]>(
    initial.age_group
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, country, age_group: ageGroup }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success("Profile updated");
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
        Preferences
      </h2>

      <div className="mt-4 space-y-4">
        <Field label="Phone (WhatsApp)">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            className={inputCls}
          />
        </Field>

        <Field label="Country">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputCls}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Age group">
          <select
            value={ageGroup}
            onChange={(e) =>
              setAgeGroup(e.target.value as StudentProfile["age_group"])
            }
            className={inputCls}
          >
            {AGE_GROUPS.map((a) => (
              <option key={a.value || "unset"} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
