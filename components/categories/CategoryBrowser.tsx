"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/categories";

type Gender = "Any" | "Male" | "Female";
type ExperienceBucket = "Any" | "1-3" | "3-5" | "5+";
type AvailabilitySlot = "Weekdays" | "Weekends" | "Evenings";
type Language = "Urdu" | "English" | "Arabic";

type SortKey =
  | "top-rated"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "most-reviews";

type Teacher = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  country: string;
  flag: string;
  gender: Exclude<Gender, "Any">;
  verified: boolean;
  rating: number;
  reviews: number;
  years: number;
  bio: string;
  priceUsd: number;
  languages: Language[];
  availability: AvailabilitySlot[];
  joinedDaysAgo: number;
  extraTags: string[];
};

const BASE_TEACHERS: Teacher[] = [
  {
    id: "ustadha-ayesha",
    name: "Ustadha Ayesha Siddiqua",
    initials: "AS",
    avatarColor: "#fce4ec",
    country: "Pakistan",
    flag: "🇵🇰",
    gender: "Female",
    verified: true,
    rating: 4.9,
    reviews: 312,
    years: 8,
    bio: "Certified Hafiza with Ijazah. Specializes in Tajweed for sisters and children. Calm, patient teaching style with personalized lesson plans.",
    priceUsd: 12,
    languages: ["Urdu", "English"],
    availability: ["Weekdays", "Evenings"],
    joinedDaysAgo: 540,
    extraTags: ["Female Teacher", "Kids Friendly"],
  },
  {
    id: "qari-ahmad",
    name: "Qari Ahmad Hassan",
    initials: "AH",
    avatarColor: "#e3f2fd",
    country: "Egypt",
    flag: "🇪🇬",
    gender: "Male",
    verified: true,
    rating: 5.0,
    reviews: 489,
    years: 12,
    bio: "Al-Azhar graduate with Ijazah in Hafs an Asim. Trained over 600 students worldwide. Expert in advanced recitation and Qira'at.",
    priceUsd: 28,
    languages: ["Arabic", "English"],
    availability: ["Weekdays", "Weekends", "Evenings"],
    joinedDaysAgo: 1200,
    extraTags: ["Ijazah Certified", "Native Arabic"],
  },
  {
    id: "sheikh-bilal",
    name: "Sheikh Bilal Akhtar",
    initials: "BA",
    avatarColor: "#e8f5e9",
    country: "Pakistan",
    flag: "🇵🇰",
    gender: "Male",
    verified: true,
    rating: 4.8,
    reviews: 218,
    years: 6,
    bio: "Madinah University graduate. Teaches Islamic Studies, Aqeedah, and structured Hifz program with weekly progress reports for parents.",
    priceUsd: 18,
    languages: ["Urdu", "Arabic", "English"],
    availability: ["Weekends", "Evenings"],
    joinedDaysAgo: 380,
    extraTags: ["Madinah Grad"],
  },
  {
    id: "ustadha-mariam",
    name: "Ustadha Mariam Al-Tamimi",
    initials: "MT",
    avatarColor: "#fff8e1",
    country: "Jordan",
    flag: "🇯🇴",
    gender: "Female",
    verified: true,
    rating: 4.9,
    reviews: 156,
    years: 4,
    bio: "Native Arabic speaker, specializes in Quranic Arabic and word-by-word translation. Excellent with revert sisters new to Arabic script.",
    priceUsd: 15,
    languages: ["Arabic", "English"],
    availability: ["Weekdays"],
    joinedDaysAgo: 90,
    extraTags: ["Female Teacher", "Native Arabic"],
  },
  {
    id: "qari-usman",
    name: "Qari Usman Tariq",
    initials: "UT",
    avatarColor: "#f3e5f5",
    country: "Pakistan",
    flag: "🇵🇰",
    gender: "Male",
    verified: true,
    rating: 4.7,
    reviews: 94,
    years: 3,
    bio: "Affordable, energetic teacher great with kids. Beautiful recitation, focused on Noorani Qaida and early Quran reading fundamentals.",
    priceUsd: 6,
    languages: ["Urdu", "English"],
    availability: ["Weekends", "Evenings"],
    joinedDaysAgo: 200,
    extraTags: ["Kids Friendly", "Budget"],
  },
  {
    id: "sheikh-yusuf",
    name: "Sheikh Yusuf Ibrahim",
    initials: "YI",
    avatarColor: "#e0f7fa",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    gender: "Male",
    verified: true,
    rating: 4.95,
    reviews: 367,
    years: 15,
    bio: "Senior scholar with 15+ years experience. Specializes in Tafseer, advanced Tajweed, and Qira'at. Premium one-on-one mentorship.",
    priceUsd: 45,
    languages: ["Arabic", "English"],
    availability: ["Weekdays", "Evenings"],
    joinedDaysAgo: 1800,
    extraTags: ["Senior Scholar", "Ijazah Certified"],
  },
];

const PRICE_MIN = 2;
const PRICE_MAX = 50;

function formatUsd(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[#c9a84c]" aria-label={`${rating} out of 5 stars`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CategoryBrowser({ category }: { category: Category }) {
  const [priceMaxInput, setPriceMaxInput] = useState(PRICE_MAX);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [gender, setGender] = useState<Gender>("Any");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [experience, setExperience] = useState<ExperienceBucket>("Any");
  const [sort, setSort] = useState<SortKey>("top-rated");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPriceMax(priceMaxInput), 300);
    return () => clearTimeout(t);
  }, [priceMaxInput]);

  const teachers = useMemo<Teacher[]>(() => {
    return BASE_TEACHERS.map((t) => ({
      ...t,
      extraTags: [category.name, ...t.extraTags].slice(0, 3),
    }));
  }, [category.name]);

  const filtered = useMemo(() => {
    let list = teachers.filter((t) => {
      if (t.priceUsd > priceMax) return false;
      if (gender !== "Any" && t.gender !== gender) return false;
      if (languages.length > 0 && !languages.some((l) => t.languages.includes(l))) return false;
      if (availability.length > 0 && !availability.some((a) => t.availability.includes(a))) return false;
      if (experience === "1-3" && (t.years < 1 || t.years > 3)) return false;
      if (experience === "3-5" && (t.years < 3 || t.years > 5)) return false;
      if (experience === "5+" && t.years < 5) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return a.joinedDaysAgo - b.joinedDaysAgo;
        case "price-asc":
          return a.priceUsd - b.priceUsd;
        case "price-desc":
          return b.priceUsd - a.priceUsd;
        case "most-reviews":
          return b.reviews - a.reviews;
        case "top-rated":
        default:
          return b.rating - a.rating || b.reviews - a.reviews;
      }
    });

    return list;
  }, [teachers, priceMax, gender, languages, availability, experience, sort]);

  function resetFilters() {
    setPriceMaxInput(PRICE_MAX);
    setPriceMax(PRICE_MAX);
    setAvailability([]);
    setGender("Any");
    setLanguages([]);
    setExperience("Any");
  }

  function toggleAvail(slot: AvailabilitySlot) {
    setAvailability((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  function toggleLang(lang: Language) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-white">
        <div className="container py-8 md:py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-inner"
              style={{ backgroundColor: category.color }}
            >
              <span className="leading-none">{category.emoji}</span>
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight text-[#0a2e1e] sm:text-5xl">
              Find Your{" "}
              <span className="text-[#0a2e1e]">{category.name}</span> Teacher
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              {category.tagline}
            </p>
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-1.5 text-xs font-semibold text-[#8a6f29]">
              <span className="h-2 w-2 rounded-full bg-[#c9a84c]" />
              {category.teachers} teachers available
            </span>
          </div>
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="container py-8 md:py-10">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Mobile filter toggle */}
            <div className="flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Filters
              </button>
              <SortDropdown sort={sort} setSort={setSort} />
            </div>

            {/* Sidebar (desktop) */}
            <aside className="hidden w-[280px] shrink-0 lg:block">
              <div className="sticky top-24">
                <FilterPanel
                  category={category}
                  priceMaxInput={priceMaxInput}
                  setPriceMaxInput={setPriceMaxInput}
                  availability={availability}
                  toggleAvail={toggleAvail}
                  gender={gender}
                  setGender={setGender}
                  languages={languages}
                  toggleLang={toggleLang}
                  experience={experience}
                  setExperience={setExperience}
                />
              </div>
            </aside>

            {/* Mobile drawer */}
            {drawerOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setDrawerOpen(false)}
                  aria-hidden
                />
                <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-[#0a2e1e]">
                      Filters
                    </h2>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                      aria-label="Close filters"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <FilterPanel
                    category={category}
                    priceMaxInput={priceMaxInput}
                    setPriceMaxInput={setPriceMaxInput}
                    availability={availability}
                    toggleAvail={toggleAvail}
                    gender={gender}
                    setGender={setGender}
                    languages={languages}
                    toggleLang={toggleLang}
                    experience={experience}
                    setExperience={setExperience}
                  />
                </div>
              </div>
            )}

            {/* Results */}
            <div className="min-w-0 flex-1">
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-white px-4 py-3 shadow-soft lg:mt-0">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {teachers.length}
                  </span>{" "}
                  {teachers.length === 1 ? "teacher" : "teachers"}
                </p>
                <div className="hidden lg:block">
                  <SortDropdown sort={sort} setSort={setSort} />
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {filtered.map((t) => (
                    <TeacherCard key={t.id} teacher={t} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7"
                      aria-hidden
                    >
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="mt-4 font-heading text-lg font-semibold text-[#0a2e1e]">
                    No teachers match your filters
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-sm font-semibold text-[#0a2e1e] underline-offset-4 transition hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SortDropdown({
  sort,
  setSort,
}: {
  sort: SortKey;
  setSort: (s: SortKey) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort by:</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-[#0a2e1e]"
      >
        <option value="top-rated">Top Rated</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="most-reviews">Most Reviews</option>
      </select>
    </label>
  );
}

type FilterPanelProps = {
  category: Category;
  priceMaxInput: number;
  setPriceMaxInput: (n: number) => void;
  availability: AvailabilitySlot[];
  toggleAvail: (s: AvailabilitySlot) => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  languages: Language[];
  toggleLang: (l: Language) => void;
  experience: ExperienceBucket;
  setExperience: (e: ExperienceBucket) => void;
};

function FilterPanel(props: FilterPanelProps) {
  const { category, priceMaxInput, setPriceMaxInput, availability, toggleAvail, gender, setGender, languages, toggleLang, experience, setExperience } = props;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: category.color }}
        >
          <span className="leading-none">{category.emoji}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </p>
          <p className="truncate font-heading font-semibold text-[#0a2e1e]">
            {category.name}
          </p>
        </div>
      </div>

      <FilterGroup title="Price Range">
        <div className="space-y-3">
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={1}
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(Number(e.target.value))}
            className="w-full accent-[#0a2e1e]"
            aria-label="Maximum price"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatUsd(PRICE_MIN)}</span>
            <span className="font-semibold text-foreground">
              up to {formatUsd(priceMaxInput)}
            </span>
            <span>{formatUsd(PRICE_MAX)}</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-2">
          {(["Weekdays", "Weekends", "Evenings"] as AvailabilitySlot[]).map((slot) => (
            <CheckboxRow
              key={slot}
              label={slot}
              checked={availability.includes(slot)}
              onChange={() => toggleAvail(slot)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Teacher Gender">
        <div className="space-y-2">
          {(["Any", "Male", "Female"] as Gender[]).map((g) => (
            <RadioRow
              key={g}
              label={g}
              name="gender"
              checked={gender === g}
              onChange={() => setGender(g)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Language">
        <div className="space-y-2">
          {(["Urdu", "English", "Arabic"] as Language[]).map((l) => (
            <CheckboxRow
              key={l}
              label={l}
              checked={languages.includes(l)}
              onChange={() => toggleLang(l)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Experience" last>
        <div className="space-y-2">
          {([
            ["Any", "Any"],
            ["1-3", "1 - 3 years"],
            ["3-5", "3 - 5 years"],
            ["5+", "5+ years"],
          ] as [ExperienceBucket, string][]).map(([val, label]) => (
            <RadioRow
              key={val}
              label={label}
              name="experience"
              checked={experience === val}
              onChange={() => setExperience(val)}
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`py-4 ${last ? "" : "border-b border-border"}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
          checked
            ? "border-[#0a2e1e] bg-[#0a2e1e] text-white"
            : "border-border bg-white"
        }`}
      >
        {checked && <CheckIcon className="h-3 w-3" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function RadioRow({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
          checked ? "border-[#0a2e1e]" : "border-border"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#0a2e1e]" />}
      </span>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a84c]/50 hover:shadow-card">
      <span
        aria-hidden
        className="absolute left-0 top-6 h-12 w-[3px] origin-top scale-y-0 rounded-r bg-gradient-to-b from-[#f3d97a] to-[#9a7e34] transition-transform duration-300 group-hover:scale-y-100"
      />
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-heading text-lg font-bold text-[#0a2e1e]"
          style={{ backgroundColor: teacher.avatarColor }}
          aria-hidden
        >
          {teacher.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-heading text-base font-semibold text-[#0a2e1e]">
              {teacher.name}
            </h3>
            {teacher.verified && (
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                title="Verified teacher"
                aria-label="Verified"
              >
                <CheckIcon className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="mr-1" aria-hidden>{teacher.flag}</span>
            {teacher.country} · {teacher.years}{" "}
            {teacher.years === 1 ? "year" : "years"} experience
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <StarRating rating={teacher.rating} />
            <span className="text-muted-foreground">
              ({teacher.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {teacher.extraTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-[#0a2e1e]/5 px-2.5 py-0.5 text-[11px] font-medium text-[#0a2e1e]"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {teacher.bio}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            From
          </p>
          <p className="font-heading text-lg font-bold text-[#0a2e1e]">
            {formatUsd(teacher.priceUsd)}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              / lesson
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/teachers/${teacher.id}`}
            className="inline-flex items-center rounded-full border border-[#0a2e1e] px-3.5 py-2 text-xs font-semibold text-[#0a2e1e] transition hover:bg-[#0a2e1e] hover:text-white sm:px-4 sm:text-sm"
          >
            View Profile
          </Link>
          <Link
            href={`/book?teacher=${teacher.id}`}
            className="inline-flex items-center rounded-full bg-[#0a2e1e] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4a30] sm:px-4 sm:text-sm"
          >
            Book Trial
          </Link>
        </div>
      </div>
    </article>
  );
}
