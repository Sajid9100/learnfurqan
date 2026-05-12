"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CHILD_LEVELS,
  LEARNING_GOALS,
  type Booking,
  type ChildLevel,
  type LearningGoal,
} from "@/lib/types";
import { useToast } from "@/components/admin/Toast";

type LinkChoice = "existing" | "custom" | "none";

export function AddChildForm({
  parentEmail,
  bookings,
}: {
  parentEmail: string;
  bookings: Booking[];
}) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState<LearningGoal>(LEARNING_GOALS[0]);
  const [level, setLevel] = useState<ChildLevel>(CHILD_LEVELS[0]);
  const [linkChoice, setLinkChoice] = useState<LinkChoice>(
    bookings.length > 0 ? "existing" : "none"
  );
  const [linkedEmail, setLinkedEmail] = useState(
    bookings.length > 0 ? parentEmail : ""
  );
  const [customEmail, setCustomEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const uniqueEmails = Array.from(
    new Set(bookings.map((b) => b.student_email.toLowerCase()))
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    let booking_email = "";
    if (linkChoice === "existing") booking_email = linkedEmail;
    else if (linkChoice === "custom") booking_email = customEmail.trim();

    setSaving(true);
    try {
      const res = await fetch("/api/parent/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_name: name.trim(),
          child_age: Number(age),
          learning_goal: goal,
          current_level: level,
          linked_booking_email: booking_email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success("Child added");
      router.push("/parent");
      router.refresh();
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
      <div className="space-y-4">
        <Field label="Child full name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Yusuf Ahmad"
            className={inputCls}
          />
        </Field>

        <Field label="Child age">
          <input
            required
            type="number"
            min={3}
            max={25}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 8"
            className={inputCls}
          />
        </Field>

        <Field label="Learning goal">
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as LearningGoal)}
            className={inputCls}
          >
            {LEARNING_GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Current level">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as ChildLevel)}
            className={inputCls}
          >
            {CHILD_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium text-foreground">
            Link existing bookings
          </legend>

          {uniqueEmails.length > 0 && (
            <label className="mt-2 flex items-start gap-3 rounded-lg p-2 hover:bg-muted/40">
              <input
                type="radio"
                name="linkChoice"
                value="existing"
                checked={linkChoice === "existing"}
                onChange={() => setLinkChoice("existing")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  Use one of my booking emails
                </div>
                <select
                  value={linkedEmail}
                  onChange={(e) => setLinkedEmail(e.target.value)}
                  disabled={linkChoice !== "existing"}
                  className={`${inputCls} mt-2`}
                >
                  {uniqueEmails.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          )}

          <label className="mt-2 flex items-start gap-3 rounded-lg p-2 hover:bg-muted/40">
            <input
              type="radio"
              name="linkChoice"
              value="custom"
              checked={linkChoice === "custom"}
              onChange={() => setLinkChoice("custom")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                Enter the email used when booking
              </div>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                disabled={linkChoice !== "custom"}
                placeholder="child-or-other@email.com"
                className={`${inputCls} mt-2`}
              />
            </div>
          </label>

          <label className="mt-2 flex items-start gap-3 rounded-lg p-2 hover:bg-muted/40">
            <input
              type="radio"
              name="linkChoice"
              value="none"
              checked={linkChoice === "none"}
              onChange={() => setLinkChoice("none")}
              className="mt-1"
            />
            <div className="flex-1 text-sm text-foreground">
              No bookings yet — I'll link later
            </div>
          </label>
        </fieldset>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save child"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:bg-muted/30 disabled:text-muted-foreground";

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
