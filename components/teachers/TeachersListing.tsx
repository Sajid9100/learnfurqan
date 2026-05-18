"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { TeacherCard } from "./TeacherCard";
import {
  TeachersFilterBar,
  type Filters,
  type SubjectFilter,
  type LanguageFilter,
} from "./TeachersFilterBar";
import type { Teacher } from "@/lib/types";

const SUBJECT_KEYWORDS: Record<Exclude<SubjectFilter, "all">, RegExp> = {
  tajweed: /tajweed|quran/i,
  kids: /kids|children|young|noorani/i,
  hifz: /hifz|memori/i,
  arabic: /arabic|tafseer/i,
  reverts: /revert|beginner/i,
};

const LANGUAGE_KEYWORDS: Record<Exclude<LanguageFilter, "all">, RegExp> = {
  english: /english/i,
  urdu: /urdu/i,
  arabic: /arabic/i,
};

export function TeachersListing({ teachers }: { teachers: Teacher[] }) {
  const [filters, setFilters] = useState<Filters>({
    gender: "all",
    subject: "all",
    language: "all",
    sort: "rating",
  });

  const filtered = useMemo(() => {
    let list = teachers.slice();

    if (filters.gender !== "all") {
      list = list.filter((t) => t.gender === filters.gender);
    }
    if (filters.subject !== "all") {
      const re = SUBJECT_KEYWORDS[filters.subject];
      if (re) {
        list = list.filter((t) => re.test(t.subject));
      } else {
        // For new category ids, match by checking if teacher subject contains any word from the category name
        const categoryName = filters.subject.replace(/-/g, ' ').toLowerCase();
        list = list.filter((t) =>
          t.subject.toLowerCase().includes(categoryName) ||
          categoryName.includes(t.subject.toLowerCase())
        );
      }
    }
    if (filters.language !== "all") {
      const re = LANGUAGE_KEYWORDS[filters.language];
      list = list.filter((t) => re.test(t.language));
    }

    switch (filters.sort) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        list.sort((a, b) => a.price_per_class - b.price_per_class);
        break;
      case "price-desc":
        list.sort((a, b) => b.price_per_class - a.price_per_class);
        break;
      case "experience":
        list.sort((a, b) => b.experience_years - a.experience_years);
        break;
    }

    return list;
  }, [teachers, filters]);

  return (
    <>
      <TeachersFilterBar filters={filters} onChange={setFilters} />

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {teachers.length}
          </span>{" "}
          teachers
        </p>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white/60 p-16 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
            No teachers match your filters
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try widening your search — clear a filter to see more matching
            teachers.
          </p>
        </motion.div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((teacher, i) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
