"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Star, Languages, Clock, Sparkles } from "lucide-react";
import { TeacherAvatar } from "./TeacherAvatar";
import { Button } from "@/components/ui/button";
import type { Teacher } from "@/lib/types";

export function TeacherCard({
  teacher,
  index = 0,
}: {
  teacher: Teacher;
  index?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex h-full flex-col rounded-3xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
    >
      <div className="flex items-start gap-4">
        <TeacherAvatar name={teacher.name} gender={teacher.gender} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 truncate font-heading text-lg font-semibold text-foreground">
              {teacher.name}
            </h3>
            {teacher.is_featured && (
              <span className="inline-flex flex-none items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-700">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-base leading-none">{teacher.country_flag}</span>
            {teacher.country}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-start gap-2 text-foreground/85">
          <BookOpen className="mt-0.5 h-4 w-4 flex-none text-primary" />
          <span>{teacher.subject}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <Languages className="mt-0.5 h-4 w-4 flex-none text-primary/70" />
          <span>{teacher.language}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Clock className="h-3 w-3" />
          {teacher.experience_years} years
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-700">
          <Star className="h-3 w-3 fill-current" />
          {teacher.rating.toFixed(1)}
          <span className="font-normal text-accent-700/70">({teacher.review_count})</span>
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-1 border-t border-border/70 pt-4">
        <span className="font-heading text-2xl font-bold text-foreground">
          ${teacher.price_per_class}
        </span>
        <span className="text-xs text-muted-foreground">per class</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href={`/teachers/${teacher.slug}`} className="contents">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <Link href={`/book/${teacher.slug}`} className="contents">
          <Button variant="primary" size="sm" className="w-full">
            Book Trial
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
