"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SUBJECTS = [
  "General Query",
  "Technical Issue",
  "Teacher Support",
  "Student Support",
  "Billing",
];

const QUICK_LINKS = [
  { label: "How to find a teacher?", href: "/teachers" },
  { label: "How to become a teacher?", href: "/become-a-teacher" },
  { label: "Browse all courses", href: "/courses" },
];

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your full name.";
    if (!email.trim()) next.email = "Please enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Please enter a valid email address.";
    if (!subject) next.subject = "Please choose a subject.";
    if (!message.trim()) next.message = "Please write a message.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmittedEmail(email);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setErrors({});
    setSubmittedEmail(null);
  };

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0a2e1e] placeholder-gray-400 outline-none transition-colors focus:border-[#0a2e1e] focus:ring-2 focus:ring-[#0a2e1e]/10";
  const fieldBorder = (key: keyof Errors) =>
    errors[key] ? "border-red-500" : "border-gray-200";

  return (
    <main className="relative bg-white">
      <Navbar />

      <section className="bg-pattern-islamic py-16 md:py-24">
        <div className="container">
          {/* Page header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f2a]">
              Get in Touch
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight text-[#0a2e1e] sm:text-5xl md:text-6xl">
              We&apos;re Here to{" "}
              <span className="bg-gradient-to-r from-[#0a2e1e] via-[#1a5d3f] to-[#3a8a5f] bg-clip-text text-transparent">
                Help
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg">
              Fill out the form and our team will get back to you within 24
              hours.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* LEFT — Form / Success */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
                {submittedEmail ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0a2e1e]/[0.08]">
                      <Check
                        className="h-10 w-10 text-[#0a2e1e]"
                        strokeWidth={3}
                      />
                    </div>
                    <h2 className="mt-6 font-heading text-3xl font-bold text-[#0a2e1e]">
                      Message Sent!
                    </h2>
                    <p className="mt-3 max-w-md text-base text-gray-600">
                      We&apos;ll get back to you at{" "}
                      <span className="font-semibold text-[#0a2e1e]">
                        {submittedEmail}
                      </span>{" "}
                      within 24 hours. JazakAllah Khair 🌿
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
                    >
                      Send another message
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium text-[#0a2e1e]"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className={`${inputBase} ${fieldBorder("name")}`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-[#0a2e1e]"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`${inputBase} ${fieldBorder("email")}`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-1.5 block text-sm font-medium text-[#0a2e1e]"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`${inputBase} ${fieldBorder("subject")} appearance-none bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230a2e1e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                        }}
                      >
                        <option value="" disabled>
                          Choose a subject
                        </option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-1.5 block text-sm font-medium text-[#0a2e1e]"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue or question..."
                        className={`${inputBase} ${fieldBorder("message")} resize-y`}
                      />
                      {errors.message && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a2e1e] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0f4a31] hover:shadow-lg active:scale-[0.99]"
                    >
                      Send Message
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT — Contact info */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <h2 className="font-heading text-xl font-semibold text-[#0a2e1e]">
                    Contact Information
                  </h2>

                  <ul className="mt-6 space-y-5">
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a2e1e]/[0.06] text-xl">
                        📧
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Email
                        </div>
                        <a
                          href="mailto:support@learnfurqan.com"
                          className="mt-0.5 block break-all text-sm font-semibold text-[#0a2e1e] hover:text-[#c9a84c]"
                        >
                          support@learnfurqan.com
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a2e1e]/[0.06] text-xl">
                        💬
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          WhatsApp
                        </div>
                        <a
                          href="https://wa.me/923000000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block text-sm font-semibold text-[#0a2e1e] hover:text-[#c9a84c]"
                        >
                          +92 300 0000000
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a2e1e]/[0.06] text-xl">
                        🕐
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Response Time
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-[#0a2e1e]">
                          Within 24 hours
                        </div>
                      </div>
                    </li>
                  </ul>

                  <div className="my-6 border-t border-gray-100" />

                  <div className="rounded-xl border border-[#0a2e1e]/10 bg-[#ecfdf5] px-4 py-3.5 text-sm leading-relaxed text-[#0a2e1e]">
                    🌙 Our support team is available Saturday to Thursday,{" "}
                    <span className="font-semibold">9 AM – 9 PM PKT</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f2a]">
                    Quick Help
                  </h3>
                  <ul className="mt-4 space-y-1">
                    {QUICK_LINKS.map((q) => (
                      <li key={q.href}>
                        <Link
                          href={q.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#0a2e1e] transition-colors hover:bg-[#0a2e1e]/[0.04] hover:text-[#c9a84c]"
                        >
                          {q.label}
                          <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
