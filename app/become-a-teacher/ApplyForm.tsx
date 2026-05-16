"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const COUNTRIES = [
  "Pakistan",
  "India",
  "Bangladesh",
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Turkey",
  "Indonesia",
  "Malaysia",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Jordan",
  "Palestine",
  "Yemen",
  "Sudan",
  "Nigeria",
  "South Africa",
  "France",
  "Germany",
  "Other",
];

const SUBJECTS = [
  "Quran Reading",
  "Tajweed",
  "Hifz",
  "Arabic",
  "Islamic Studies",
  "Kids Classes",
];

const LANGUAGES = ["English", "Arabic", "Urdu", "Turkish", "French", "Malay"];

// Suggested languages by country. First entry is the primary (auto-checked).
const COUNTRY_LANGUAGES: Record<string, string[]> = {
  Pakistan: ["Urdu", "English"],
  India: ["Urdu", "English"],
  Bangladesh: ["Urdu", "English"],
  Egypt: ["Arabic", "English"],
  "Saudi Arabia": ["Arabic", "English"],
  "United Arab Emirates": ["Arabic", "English"],
  Jordan: ["Arabic", "English"],
  Palestine: ["Arabic", "English"],
  Yemen: ["Arabic", "English"],
  Sudan: ["Arabic", "English"],
  Morocco: ["Arabic", "French"],
  Algeria: ["Arabic", "French"],
  Tunisia: ["Arabic", "French"],
  Turkey: ["Turkish", "English"],
  Malaysia: ["Malay", "English"],
  Indonesia: ["Malay", "English"],
  "United Kingdom": ["English"],
  "United States": ["English"],
  Canada: ["English"],
  Australia: ["English"],
  France: ["French", "English"],
  Germany: ["English"],
  Nigeria: ["English"],
  "South Africa": ["English"],
};

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "GMT+0", label: "GMT+0 (UK)" },
  { value: "GMT+2", label: "GMT+2 (Egypt)" },
  { value: "GMT+3", label: "GMT+3 (Saudi Arabia / Turkey)" },
  { value: "GMT+5", label: "GMT+5 (Pakistan)" },
  { value: "GMT+8", label: "GMT+8 (Malaysia)" },
  { value: "GMT+10", label: "GMT+10 (Australia EST)" },
  { value: "GMT-5", label: "GMT-5 (USA EST)" },
  { value: "GMT-8", label: "GMT-8 (USA PST)" },
];

const COUNTRY_TIMEZONE: Record<string, string> = {
  Pakistan: "GMT+5",
  India: "GMT+5",
  Bangladesh: "GMT+5",
  Egypt: "GMT+2",
  "Saudi Arabia": "GMT+3",
  "United Arab Emirates": "GMT+3",
  Jordan: "GMT+3",
  Palestine: "GMT+3",
  Yemen: "GMT+3",
  Sudan: "GMT+2",
  Turkey: "GMT+3",
  Malaysia: "GMT+8",
  Indonesia: "GMT+8",
  "United Kingdom": "GMT+0",
  "United States": "GMT-5",
  Canada: "GMT-5",
  Australia: "GMT+10",
  France: "GMT+0",
  Germany: "GMT+0",
  Morocco: "GMT+0",
  Algeria: "GMT+0",
  Tunisia: "GMT+0",
};

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type DaySchedule = { from: string; to: string } | null;
type Schedule = Record<DayKey, DaySchedule>;

const DEFAULT_SCHEDULE: Schedule = {
  mon: { from: "09:00", to: "17:00" },
  tue: { from: "09:00", to: "17:00" },
  wed: { from: "09:00", to: "17:00" },
  thu: { from: "09:00", to: "17:00" },
  fri: { from: "09:00", to: "17:00" },
  sat: null,
  sun: null,
};

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

function CheckboxGroup({
  options,
  values,
  onChange,
  name,
  highlight,
}: {
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
  name: string;
  highlight?: string[];
}) {
  function toggle(opt: string) {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const checked = values.includes(opt);
        const suggested = highlight?.includes(opt);
        return (
          <label
            key={opt}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              checked
                ? "border-primary bg-primary/5 text-primary"
                : suggested
                ? "border-primary/40 bg-white text-foreground"
                : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={checked}
              onChange={() => toggle(opt)}
              className="h-4 w-4 accent-primary"
            />
            <span className="flex-1">{opt}</span>
            {suggested && !checked && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                Suggested
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function AvailabilityGrid({
  timezone,
  onTimezoneChange,
  schedule,
  onScheduleChange,
}: {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  schedule: Schedule;
  onScheduleChange: (next: Schedule) => void;
}) {
  function setDay(key: DayKey, value: DaySchedule) {
    onScheduleChange({ ...schedule, [key]: value });
  }
  function toggleDay(key: DayKey) {
    if (schedule[key]) {
      setDay(key, null);
    } else {
      setDay(key, { from: "09:00", to: "17:00" });
    }
  }
  function setTime(key: DayKey, field: "from" | "to", value: string) {
    const current = schedule[key];
    if (!current) return;
    setDay(key, { ...current, [field]: value });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ba-tz" className={labelCls}>
          Your timezone
        </label>
        <select
          id="ba-tz"
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className={inputCls}
        >
          {TIMEZONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {DAYS.map(({ key, label }, idx) => {
          const day = schedule[key];
          const enabled = Boolean(day);
          return (
            <div
              key={key}
              className={`grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 px-3 py-2.5 sm:grid-cols-[72px_auto_minmax(0,1fr)] sm:gap-4 ${
                idx > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="text-sm font-semibold text-foreground">
                {label}
              </span>

              <label className="flex cursor-pointer items-center gap-2 sm:order-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleDay(key)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {enabled ? "Available" : "Unavailable"}
                </span>
              </label>

              <div className="col-span-2 flex items-center gap-2 sm:order-3 sm:col-span-1 sm:justify-end">
                <input
                  type="time"
                  aria-label={`${label} from`}
                  disabled={!enabled}
                  min="00:00"
                  max="23:30"
                  step={1800}
                  value={day?.from ?? "09:00"}
                  onChange={(e) => setTime(key, "from", e.target.value)}
                  className="h-9 rounded-lg border border-border bg-white px-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="time"
                  aria-label={`${label} to`}
                  disabled={!enabled}
                  min="00:00"
                  max="23:30"
                  step={1800}
                  value={day?.to ?? "17:00"}
                  onChange={(e) => setTime(key, "to", e.target.value)}
                  className="h-9 rounded-lg border border-border bg-white px-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [subject, setSubject] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [certifications, setCertifications] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [demoVideo, setDemoVideo] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const languagesTouched = useRef(false);
  const timezoneTouched = useRef(false);

  const suggestedLanguages = country ? COUNTRY_LANGUAGES[country] ?? [] : [];

  useEffect(() => {
    if (!country) return;
    if (!languagesTouched.current) {
      const suggested = COUNTRY_LANGUAGES[country];
      if (suggested && suggested.length > 0) {
        setLanguages([suggested[0]]);
      }
    }
    if (!timezoneTouched.current) {
      const tz = COUNTRY_TIMEZONE[country];
      if (tz) setTimezone(tz);
    }
  }, [country]);

  function handleLanguagesChange(next: string[]) {
    languagesTouched.current = true;
    setLanguages(next);
  }

  function handleTimezoneChange(tz: string) {
    timezoneTouched.current = true;
    setTimezone(tz);
  }

  function scheduleHasAnyDay(): boolean {
    return DAYS.some(({ key }) => Boolean(schedule[key]));
  }

  function scheduleIsValid(): { ok: true } | { ok: false; error: string } {
    for (const { key, label } of DAYS) {
      const d = schedule[key];
      if (!d) continue;
      if (d.from >= d.to) {
        return { ok: false, error: `${label}: "from" must be earlier than "to".` };
      }
    }
    return { ok: true };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !name ||
      !email ||
      !phone ||
      !country ||
      subject.length === 0 ||
      languages.length === 0
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!scheduleHasAnyDay()) {
      setError("Please mark at least one day as available.");
      return;
    }
    const valid = scheduleIsValid();
    if (!valid.ok) {
      setError(valid.error);
      return;
    }
    setLoading(true);
    try {
      const availabilityJson = JSON.stringify({ timezone, schedule });
      const res = await fetch("/api/teachers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          country,
          subject,
          experience_years: Number(experienceYears) || 0,
          certifications,
          languages,
          availability: availabilityJson,
          demo_video_url: demoVideo,
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to submit application.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Application submitted!
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          We review within 3-5 business days. You&apos;ll hear back at{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="ba-name" className={labelCls}>
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="ba-email" className={labelCls}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="ba-phone" className={labelCls}>
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        <input
          id="ba-phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
          placeholder="+92 300 1234567"
        />
      </div>

      <div>
        <label htmlFor="ba-country" className={labelCls}>
          Country <span className="text-red-500">*</span>
        </label>
        <select
          id="ba-country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>
            Select your country
          </option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelCls}>
          Subject <span className="text-red-500">*</span>
        </span>
        <CheckboxGroup
          name="subject"
          options={SUBJECTS}
          values={subject}
          onChange={setSubject}
        />
      </div>

      <div>
        <label htmlFor="ba-exp" className={labelCls}>
          Years of Experience
        </label>
        <input
          id="ba-exp"
          type="number"
          min={0}
          max={80}
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          className={inputCls}
          placeholder="0"
        />
      </div>

      <div>
        <label htmlFor="ba-cert" className={labelCls}>
          Certifications
        </label>
        <textarea
          id="ba-cert"
          rows={3}
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          className={inputCls}
          placeholder="Ijazah, university degrees, teaching certificates…"
        />
      </div>

      <div>
        <span className={labelCls}>
          Languages <span className="text-red-500">*</span>
        </span>
        {country && suggestedLanguages.length > 0 && (
          <p className="mb-2 text-xs text-muted-foreground">
            Common in {country}: {suggestedLanguages.join(", ")}. Check any
            others you can teach in.
          </p>
        )}
        <CheckboxGroup
          name="languages"
          options={LANGUAGES}
          values={languages}
          onChange={handleLanguagesChange}
          highlight={suggestedLanguages}
        />
      </div>

      <div>
        <span className={labelCls}>
          Weekly Availability <span className="text-red-500">*</span>
        </span>
        <AvailabilityGrid
          timezone={timezone}
          onTimezoneChange={handleTimezoneChange}
          schedule={schedule}
          onScheduleChange={setSchedule}
        />
      </div>

      <div>
        <label htmlFor="ba-demo" className={labelCls}>
          Demo Video URL (YouTube)
        </label>
        <input
          id="ba-demo"
          type="url"
          value={demoVideo}
          onChange={(e) => setDemoVideo(e.target.value)}
          className={inputCls}
          placeholder="https://youtube.com/watch?v=…"
        />
      </div>

      <div>
        <label htmlFor="ba-msg" className={labelCls}>
          Why do you want to teach?
        </label>
        <textarea
          id="ba-msg"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
          placeholder="Tell us about your teaching style and motivation."
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}
