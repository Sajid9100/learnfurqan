"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import { TeacherAvatar } from "@/components/teachers/TeacherAvatar";
import type { Teacher } from "@/lib/types";

export function BookingTeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="lg:sticky lg:top-28"
    >
      <div className="rounded-3xl border border-border bg-white p-7 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Trial booking
        </p>
        <h2 className="mt-2 font-heading text-xl font-bold text-foreground">
          You are booking a trial class with {teacher.name}
        </h2>

        <div className="mt-6 flex items-center gap-4">
          <TeacherAvatar
            name={teacher.name}
            gender={teacher.gender}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {teacher.name}{" "}
              <span className="ml-1">{teacher.country_flag}</span>
            </p>
            <p className="truncate text-sm text-primary">{teacher.subject}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="font-semibold text-foreground">
                {teacher.rating.toFixed(1)}
              </span>
              ({teacher.review_count} reviews)
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-baseline gap-1 rounded-2xl bg-pattern-islamic-soft p-5">
          <span className="font-heading text-3xl font-bold text-foreground">
            ${teacher.price_per_class}
          </span>
          <span className="text-sm text-muted-foreground">per class</span>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your first class is FREE
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              No payment required today. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
