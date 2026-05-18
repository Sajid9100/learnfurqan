"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "All",
  "Students",
  "Teachers",
  "Payments",
  "Technical",
] as const;
type Category = (typeof CATEGORIES)[number];
type FaqCategory = Exclude<Category, "All">;

type FAQ = { id: string; q: string; a: string; category: FaqCategory };

const FAQS: FAQ[] = [
  // Students
  {
    id: "s1",
    category: "Students",
    q: "How do I find the right teacher for me?",
    a: "Browse the teacher directory, filter by subject, language, price, and availability, watch intro videos, read reviews, and book a free trial with anyone who matches what you're looking for.",
  },
  {
    id: "s2",
    category: "Students",
    q: "Is the trial lesson free?",
    a: "Yes — your first 30-minute trial with any teacher is completely free. No payment is required to book it.",
  },
  {
    id: "s3",
    category: "Students",
    q: "Can I learn if I'm a complete beginner?",
    a: "Absolutely. Many of our teachers specialize in helping complete beginners start from the Arabic alphabet, basic Tajweed, and short surahs.",
  },
  {
    id: "s4",
    category: "Students",
    q: "What age groups do you teach?",
    a: "We teach all ages — from young children (5+) to adults and seniors. Filter for teachers experienced with kids on the directory page.",
  },
  {
    id: "s5",
    category: "Students",
    q: "Can I take classes for my child?",
    a: "Yes. Parents can create a separate profile for each child and manage scheduling, billing, and progress from one parent dashboard.",
  },
  {
    id: "s6",
    category: "Students",
    q: "How long are the lessons?",
    a: "Standard lessons are 30 or 60 minutes. You and your teacher agree on what works best for you.",
  },

  // Teachers
  {
    id: "t1",
    category: "Teachers",
    q: "How do I become a teacher on LearnFurqan?",
    a: "Apply through our Become a Teacher page. Submit your credentials, a short intro video, and your teaching experience. Most applications are reviewed within 48 hours.",
  },
  {
    id: "t2",
    category: "Teachers",
    q: "What subjects can I teach?",
    a: "Quran recitation, Tajweed, Hifz, Tafseer, Arabic language, Fiqh, Hadith, Aqeedah, Islamic studies and more — you choose what you're qualified to teach.",
  },
  {
    id: "t3",
    category: "Teachers",
    q: "How much can I earn?",
    a: "Teachers set their own price per lesson. Your earnings depend on your rate, hours taught, and student demand.",
  },
  {
    id: "t4",
    category: "Teachers",
    q: "When do I get paid?",
    a: "Payouts are sent weekly to your linked bank account or payment provider.",
  },
  {
    id: "t5",
    category: "Teachers",
    q: "Do I need a teaching certificate?",
    a: "A formal certificate helps, but isn't strictly required. We evaluate your recitation, knowledge, and teaching ability during the application.",
  },

  // Payments
  {
    id: "p1",
    category: "Payments",
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards, plus regional methods like JazzCash, EasyPaisa, and bank transfer in supported countries.",
  },
  {
    id: "p2",
    category: "Payments",
    q: "Can I get a refund?",
    a: "Yes. If a paid lesson didn't meet your expectations, contact support within 7 days — our money-back guarantee covers eligible lessons.",
  },
  {
    id: "p3",
    category: "Payments",
    q: "Is there a subscription or pay-per-lesson?",
    a: "Both options are available. Pay per lesson, or buy a package of lessons at a discount.",
  },

  // Technical
  {
    id: "x1",
    category: "Technical",
    q: "What platform do you use for video calls?",
    a: "Lessons happen in our built-in video classroom — no Zoom or third-party app needed. Just open the lesson link in your browser.",
  },
  {
    id: "x2",
    category: "Technical",
    q: "What if my internet disconnects during a lesson?",
    a: "You can rejoin the same lesson from where you left off. If you lose more than a few minutes, your teacher can credit or reschedule the time.",
  },
  {
    id: "x3",
    category: "Technical",
    q: "Is LearnFurqan available on mobile?",
    a: "Yes. LearnFurqan works on any modern phone or tablet through your browser. Native mobile apps are in development.",
  },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f2a]">
      {children}
    </span>
  );
}

export default function FAQPage() {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (!q) return true;
      return (
        f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <main className="relative bg-white">
      <Navbar />

      {/* HERO */}
      <section className="bg-pattern-islamic pb-12 pt-16 md:pb-16 md:pt-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge>FAQ</Badge>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight text-[#0a2e1e] sm:text-5xl md:text-6xl">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-[#f3d97a] via-[#c9a84c] to-[#9a7e34] bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg">
              Everything you need to know about LearnFurqan.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-colors focus-within:border-[#0a2e1e]/40 focus-within:ring-2 focus-within:ring-[#0a2e1e]/10">
              <Search className="h-4 w-4 shrink-0 text-[#0a2e1e]/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenId(null);
                }}
                placeholder="Search questions..."
                aria-label="Search FAQs"
                className="flex-1 bg-transparent text-sm text-[#0a2e1e] placeholder-gray-400 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TABS + ACCORDION */}
      <section className="bg-pattern-islamic pb-20">
        <div className="container">
          {/* Tabs */}
          <div className="-mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max gap-2 md:w-auto md:justify-center">
              {CATEGORIES.map((c) => {
                const active = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setOpenId(null);
                    }}
                    className={`whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                      active
                        ? "border-[#0a2e1e] bg-[#0a2e1e] text-white shadow-sm"
                        : "border-gray-200 bg-white text-[#0a2e1e] hover:border-[#0a2e1e]/40 hover:bg-[#0a2e1e]/[0.04]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion */}
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                      isOpen
                        ? "border-[#0a2e1e]/20 shadow-md"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-medium text-[#0a2e1e]">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#c9a84c] transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                <p className="text-gray-600">
                  No questions match{" "}
                  <span className="font-semibold text-[#0a2e1e]">
                    &ldquo;{query}&rdquo;
                  </span>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                  className="mt-3 text-sm font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pattern-islamic pb-20 md:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#fef9e7] px-8 py-14 text-center sm:px-12 md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c9a84c]/15 blur-3xl"
            />
            <h2 className="relative font-heading text-3xl font-bold text-[#0a2e1e] sm:text-4xl">
              Still have questions?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-base text-gray-600">
              Our support team typically replies within 24 hours.
            </p>
            <div className="relative mt-7 flex justify-center">
              <Link href="/support" className="contents">
                <Button size="lg">
                  Contact Support
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
