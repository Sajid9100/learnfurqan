"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { CATEGORIES, CATEGORY_TAGS } from "@/lib/categories";

const TAGS = CATEGORY_TAGS;

const VISIBLE_INITIAL = 8;

// Inline Islamic geometric pattern — overlapping diamonds & circles in faint gold
const ISLAMIC_PATTERN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23c9a84c' stroke-width='0.6' opacity='0.09'><path d='M40 0L80 40L40 80L0 40Z'/><path d='M40 12L68 40L40 68L12 40Z'/><circle cx='40' cy='40' r='6'/><path d='M0 0L80 80M80 0L0 80' stroke-width='0.3'/></g></svg>\")";

export function CategoriesSection() {
  const [activeTag, setActiveTag] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.filter((c) => {
      const tagMatch = activeTag === "All" || c.tag === activeTag;
      if (!tagMatch) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q)
      );
    });
  }, [activeTag, query]);

  const visible = expanded ? filtered : filtered.slice(0, VISIBLE_INITIAL);
  const canToggle = filtered.length > VISIBLE_INITIAL;

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        backgroundColor: "#0a2e1e",
        backgroundImage: ISLAMIC_PATTERN,
      }}
    >
      {/* Soft gold halo */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[64rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(201,168,76,0.45), transparent)",
        }}
        aria-hidden
      />
      {/* Bottom vignette */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, rgba(8,32,24,0.95), transparent)",
        }}
        aria-hidden
      />

      <div className="container relative">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6c97a]">
            What would you like to learn?
          </span>
          <h2
            className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Explore Our{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#f3d97a 0%,#c9a84c 50%,#9a7e34 100%)",
              }}
            >
              Islamic Programs
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            From complete beginners to advanced learners — find the perfect
            teacher for your journey
          </p>

          {/* Search bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-1.5 rounded-full border border-[#c9a84c]/25 bg-white/[0.06] p-1.5 pl-4 backdrop-blur-sm transition-colors focus-within:border-[#c9a84c]/70 focus-within:bg-white/[0.09]"
          >
            <Search aria-hidden className="h-4 w-4 shrink-0 text-[#c9a84c]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a subject e.g. Tajweed, Hifz..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-white/40 outline-none"
              aria-label="Search programs"
            />
            <button
              type="submit"
              className="rounded-full bg-[#0f5036] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#136a47]"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter pills */}
        <div className="mt-10 -mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-2 md:w-auto md:justify-center">
            {TAGS.map((tag) => {
              const active = tag === activeTag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setActiveTag(tag);
                    setExpanded(false);
                  }}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border-[#c9a84c] bg-[#c9a84c] text-[#0a2e1e] shadow-[0_4px_16px_-4px_rgba(201,168,76,0.5)]"
                      : "border-[#c9a84c]/25 text-white/75 hover:border-[#c9a84c]/60 hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards grid */}
        {visible.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 ease-out animate-fade-in-up hover:-translate-y-1.5 hover:border-[#c9a84c]/45 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_-20px_rgba(201,168,76,0.35)]"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                {/* Gold left-border accent on hover */}
                <span
                  aria-hidden
                  className="absolute left-0 top-6 h-12 w-[3px] origin-top scale-y-0 rounded-r bg-gradient-to-b from-[#f3d97a] to-[#9a7e34] transition-transform duration-300 group-hover:scale-y-100"
                />
                {/* Subtle inner glow on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(120% 60% at 0% 0%, rgba(201,168,76,0.10), transparent 60%)",
                  }}
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a84c]/40 bg-white/[0.07] text-[#c9a84c] shadow-inner transition-transform duration-300 group-hover:scale-110">
                  <cat.Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-heading text-xl font-bold text-white">

                  {cat.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                  {cat.tagline}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-2.5 py-1 text-[11px] font-medium text-[#e6c97a] transition group-hover:animate-pulse-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
                    {cat.teachers} teachers available
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 text-[#c9a84c] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-white/70">
              No programs match{" "}
              <span className="text-white">&ldquo;{query}&rdquo;</span>. Try a
              different search.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTag("All");
              }}
              className="mt-3 text-sm font-semibold text-[#e6c97a] underline-offset-4 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Show more / less */}
        {canToggle && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((x) => !x)}
              className="group inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/40 bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-[#e6c97a] transition hover:bg-[#c9a84c]/10 hover:text-white"
            >
              {expanded
                ? "Show less"
                : `Show ${filtered.length - VISIBLE_INITIAL} more programs`}
              <ChevronDown
                aria-hidden
                className={`h-4 w-4 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}

        {/* Bottom CTA banner */}
        <div
          className="relative mt-16 overflow-hidden rounded-3xl border border-[#c9a84c]/30 p-8 sm:p-10 md:flex md:items-center md:justify-between md:gap-8"
          style={{
            backgroundImage: `${ISLAMIC_PATTERN}, linear-gradient(135deg, #0d3a26 0%, #082018 100%)`,
          }}
        >
          {/* Corner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(201,168,76,0.7), transparent)",
            }}
          />
          <div className="relative md:max-w-xl">
            <h3 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">

              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg,#f3d97a 0%,#c9a84c 100%)",
                }}
              >
                Can&rsquo;t find what you&rsquo;re looking for?
              </span>
            </h3>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Browse all 1,200+ verified Quran &amp; Islamic teachers
            </p>
          </div>
          <Link
            href="/teachers"
            className="relative mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#0a2e1e] shadow-[0_12px_32px_-10px_rgba(201,168,76,0.6)] transition hover:brightness-110 md:mt-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg,#f3d97a 0%,#c9a84c 50%,#a88932 100%)",
            }}
          >
            Browse All Teachers
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
