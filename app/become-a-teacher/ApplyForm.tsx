"use client";

import { useState } from "react";
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

const AVAILABILITY = [
  "Weekday mornings",
  "Weekday evenings",
  "Weekends",
];

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

function CheckboxGroup({
  options,
  values,
  onChange,
  name,
}: {
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
  name: string;
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
        return (
          <label
            key={opt}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              checked
                ? "border-primary bg-primary/5 text-primary"
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
            <span>{opt}</span>
          </label>
        );
      })}
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
  const [availability, setAvailability] = useState<string[]>([]);
  const [demoVideo, setDemoVideo] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !name ||
      !email ||
      !phone ||
      !country ||
      subject.length === 0 ||
      languages.length === 0 ||
      availability.length === 0
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
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
          availability,
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
        <CheckboxGroup
          name="languages"
          options={LANGUAGES}
          values={languages}
          onChange={setLanguages}
        />
      </div>

      <div>
        <span className={labelCls}>
          Weekly Availability <span className="text-red-500">*</span>
        </span>
        <CheckboxGroup
          name="availability"
          options={AVAILABILITY}
          values={availability}
          onChange={setAvailability}
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
