"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Video, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-pattern-islamic pt-10 md:pt-16 lg:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl"
      />

      <div className="container relative grid items-center gap-12 pb-20 md:pb-28 lg:grid-cols-12 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary shadow-soft backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 10,000+ students worldwide
          </div>

          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[64px]">
            Learn Quran Online with{" "}
            <span className="text-gradient-primary">Certified Teachers</span>{" "}
            Worldwide
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Live one-on-one classes for kids and adults. Flexible schedules,
            verified teachers, proven results.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/teachers" className="contents">
              <Button variant="primary" size="xl" className="shadow-glow">
                Browse Teachers
              </Button>
            </Link>
            <Link href="/how-it-works" className="contents">
              <Button variant="primary" size="xl" className="shadow-glow">
                How It Works
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center -space-x-2">
              {["#0a2e1e", "#c9a84c", "#1f4d33", "#a98a3a"].map((c, i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-white"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-xs">
                <span className="font-semibold text-foreground">4.9/5</span>{" "}
                from 2,000+ parents
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative lg:col-span-5"
        >
          <FloatingClassCard />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingClassCard() {
  return (
    <div className="relative mx-auto max-w-md">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-card sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">Surah Al-Mulk</p>
            <p className="text-xs text-muted-foreground">Memorized this week</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -right-4 hidden rounded-2xl bg-white p-4 shadow-card sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Video className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">98% attendance</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
        </div>
      </motion.div>

      <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Live Now
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            45:12
          </span>
        </div>

        <div className="mt-5 aspect-[5/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary-800 p-5 text-white">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base font-bold text-foreground ring-4 ring-white/20">
                  AH
                </div>
                <div>
                  <p className="text-sm font-semibold">Ustadh Ahmad</p>
                  <p className="text-xs text-white/70">Tajweed · Egypt</p>
                </div>
              </div>
              <div className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide">
                1-on-1
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-white/60">
                Now reciting
              </p>
              <p className="mt-1 font-heading text-lg font-semibold">
                Surah Al-Fatiha · Ayah 4
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              YA
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Yusuf, age 9</p>
              <div className="flex items-center gap-0.5 text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
                <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                  4.9
                </span>
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm">
            Join Class
          </Button>
        </div>
      </div>
    </div>
  );
}
