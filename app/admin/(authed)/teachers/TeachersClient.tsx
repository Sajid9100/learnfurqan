"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, CalendarClock } from "lucide-react";
import type { Teacher } from "@/lib/types";
import { Modal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { Flag } from "@/components/ui/Flag";
import { TeacherAvailabilityModal } from "./TeacherAvailabilityModal";

type TeacherRow = Teacher & { is_active?: boolean };

const EMPTY_FORM: TeacherFormState = {
  name: "",
  gender: "male",
  subject: "",
  language: "",
  country: "",
  country_flag: "",
  experience_years: 0,
  price_per_class: 0,
  rating: 5,
  review_count: 0,
  bio: "",
  teaching_style: "",
  certifications: "",
  intro_video_url: "",
  available_slots: "",
  is_featured: false,
  slug: "",
  is_active: true,
  class_duration_minutes: 30,
};

type TeacherFormState = {
  name: string;
  gender: "male" | "female";
  subject: string;
  language: string;
  country: string;
  country_flag: string;
  experience_years: number;
  price_per_class: number;
  rating: number;
  review_count: number;
  bio: string;
  teaching_style: string;
  certifications: string;
  intro_video_url: string;
  available_slots: string; // comma-separated in the form
  is_featured: boolean;
  slug: string;
  is_active: boolean;
  class_duration_minutes: number;
};

export function TeachersClient() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TeacherRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [availabilityFor, setAvailabilityFor] = useState<TeacherRow | null>(
    null
  );
  const toast = useToast();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teachers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load teachers");
      setTeachers(data.teachers ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(t: TeacherRow) {
    setBusyId(t.id);
    try {
      const res = await fetch(`/api/admin/teachers/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !(t.is_active ?? true) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setTeachers((prev) =>
        prev.map((row) => (row.id === t.id ? (data.teacher as TeacherRow) : row))
      );
      toast.success(
        `Teacher ${data.teacher.is_active ? "activated" : "deactivated"}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(id: string, body: Partial<Teacher> & { is_active?: boolean }) {
    const res = await fetch(`/api/admin/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Update failed");
    setTeachers((prev) =>
      prev.map((row) => (row.id === id ? (data.teacher as TeacherRow) : row))
    );
  }

  async function createTeacher(body: Partial<Teacher> & { is_active?: boolean }) {
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Create failed");
    setTeachers((prev) => [data.teacher as TeacherRow, ...prev]);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white shadow-soft hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add teacher
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading teachers…
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No teachers yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.slug} {t.is_featured ? "· featured" : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{t.subject}</td>
                    <td className="px-4 py-3 text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Flag code={t.country_flag} size="sm" label={t.country} />
                        {t.country}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      ${Number(t.price_per_class).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {Number(t.rating).toFixed(1)} ({t.review_count})
                    </td>
                    <td className="px-4 py-3">
                      <ActiveToggle
                        active={t.is_active ?? true}
                        loading={busyId === t.id}
                        onChange={() => toggleActive(t)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAvailabilityFor(t)}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          Availability
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(t)}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TeacherFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit teacher"
        initial={editing ? rowToForm(editing) : EMPTY_FORM}
        onSubmit={async (form) => {
          if (!editing) return;
          await saveEdit(editing.id, formToPayload(form));
          toast.success("Teacher updated");
          setEditing(null);
        }}
      />

      <TeacherFormModal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add new teacher"
        initial={EMPTY_FORM}
        onSubmit={async (form) => {
          await createTeacher(formToPayload(form));
          toast.success("Teacher added");
          setAdding(false);
        }}
      />

      {availabilityFor && (
        <TeacherAvailabilityModal
          teacher={availabilityFor}
          onClose={() => setAvailabilityFor(null)}
        />
      )}
    </div>
  );
}

function ActiveToggle({
  active,
  loading,
  onChange,
}: {
  active: boolean;
  loading: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 " +
        (active ? "bg-primary" : "bg-muted")
      }
      aria-pressed={active}
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
          (active ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}

function rowToForm(t: TeacherRow): TeacherFormState {
  return {
    name: t.name,
    gender: t.gender,
    subject: t.subject,
    language: t.language,
    country: t.country,
    country_flag: t.country_flag,
    experience_years: t.experience_years,
    price_per_class: Number(t.price_per_class),
    rating: Number(t.rating),
    review_count: t.review_count,
    bio: t.bio || "",
    teaching_style: t.teaching_style || "",
    certifications: t.certifications || "",
    intro_video_url: t.intro_video_url || "",
    available_slots: (t.available_slots || []).join(", "),
    is_featured: t.is_featured,
    slug: t.slug,
    is_active: t.is_active ?? true,
    class_duration_minutes: t.class_duration_minutes ?? 30,
  };
}

function formToPayload(f: TeacherFormState): Partial<Teacher> & { is_active: boolean } {
  return {
    name: f.name.trim(),
    gender: f.gender,
    subject: f.subject.trim(),
    language: f.language.trim(),
    country: f.country.trim(),
    country_flag: f.country_flag.trim(),
    experience_years: Number(f.experience_years),
    price_per_class: Number(f.price_per_class),
    rating: Number(f.rating),
    review_count: Number(f.review_count),
    bio: f.bio.trim(),
    teaching_style: f.teaching_style.trim(),
    certifications: f.certifications.trim(),
    intro_video_url: f.intro_video_url.trim(),
    available_slots: f.available_slots
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    is_featured: f.is_featured,
    slug: f.slug.trim(),
    is_active: f.is_active,
    class_duration_minutes: Number(f.class_duration_minutes) || 30,
  };
}

function TeacherFormModal({
  open,
  onClose,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  initial: TeacherFormState;
  onSubmit: (form: TeacherFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<TeacherFormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setError(null);
    }
  }, [open, initial]);

  function set<K extends keyof TeacherFormState>(key: K, value: TeacherFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </Field>
          <Field label="Slug" required>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              required
              placeholder="ustadh-ahmad"
            />
          </Field>
          <Field label="Gender">
            <select
              className={inputCls}
              value={form.gender}
              onChange={(e) =>
                set("gender", e.target.value as "male" | "female")
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
          <Field label="Subject" required>
            <input
              className={inputCls}
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              required
            />
          </Field>
          <Field label="Language(s)" required>
            <input
              className={inputCls}
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
              required
              placeholder="English, Arabic"
            />
          </Field>
          <Field label="Country" required>
            <input
              className={inputCls}
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              required
            />
          </Field>
          <Field
            label="Country code (ISO 3166-1 alpha-2)"
            required
          >
            <input
              className={inputCls}
              value={form.country_flag}
              onChange={(e) =>
                set("country_flag", e.target.value.toLowerCase())
              }
              required
              maxLength={2}
              placeholder="eg"
            />
          </Field>
          <Field label="Experience (years)">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.experience_years}
              onChange={(e) =>
                set("experience_years", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Price per class (USD)">
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputCls}
              value={form.price_per_class}
              onChange={(e) =>
                set("price_per_class", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Class duration (minutes)">
            <select
              className={inputCls}
              value={form.class_duration_minutes}
              onChange={(e) =>
                set("class_duration_minutes", Number(e.target.value))
              }
            >
              {[15, 30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rating (0–5)">
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              className={inputCls}
              value={form.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
            />
          </Field>
          <Field label="Review count">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.review_count}
              onChange={(e) => set("review_count", Number(e.target.value))}
            />
          </Field>
          <Field label="Intro video URL">
            <input
              className={inputCls}
              value={form.intro_video_url}
              onChange={(e) => set("intro_video_url", e.target.value)}
              placeholder="https://..."
            />
          </Field>
        </div>

        <Field label="Bio">
          <textarea
            className={inputCls}
            rows={3}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>
        <Field label="Teaching style">
          <textarea
            className={inputCls}
            rows={2}
            value={form.teaching_style}
            onChange={(e) => set("teaching_style", e.target.value)}
          />
        </Field>
        <Field label="Certifications">
          <textarea
            className={inputCls}
            rows={2}
            value={form.certifications}
            onChange={(e) => set("certifications", e.target.value)}
          />
        </Field>
        <Field label="Available slots (comma-separated)">
          <input
            className={inputCls}
            value={form.available_slots}
            onChange={(e) => set("available_slots", e.target.value)}
            placeholder="Mon 9am UTC, Wed 11am UTC"
          />
        </Field>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => set("is_featured", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Featured
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Active
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
