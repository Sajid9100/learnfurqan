"use client";

import { Search, CalendarCheck, BookOpen, type LucideIcon } from "lucide-react";
import { Reveal } from "./ui/Reveal";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: Search,
    title: "Choose Your Teacher",
    description:
      "Browse verified teachers by specialization, gender, and price. Read reviews from real parents.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book a Free Trial",
    description:
      "Pick a time that works for you and meet your teacher in a no-commitment trial class.",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Start Learning",
    description:
      "Subscribe to a plan and begin a structured journey through Quran with weekly progress.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-pattern-islamic-soft py-20 md:py-28">
      <div className="container">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-700">
              How it works
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Start learning in 3 simple steps
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              From signup to your first ayah — get going in minutes.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-12 right-12 top-9 hidden h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 lg:block"
          />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.1}>
                <StepCard step={step} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: Step }) {
  const { number, icon: Icon, title, description } = step;
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-white shadow-soft">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-soft">
          {number}
        </div>
      </div>
      <h3 className="mt-6 font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
