import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ApplyForm } from "../ApplyForm";
import { CalendarDays, Banknote, Users, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply to Teach | LearnFurqan",
  description:
    "Apply to teach Quran online with LearnFurqan. Set your own schedule and rate, and get paid weekly via Stripe.",
};

const QUICK_BENEFITS = [
  {
    icon: CalendarDays,
    title: "Set your own schedule",
    description: "Block out the times that don't work for you.",
  },
  {
    icon: Banknote,
    title: "Weekly Stripe payouts",
    description: "Earnings land in your bank every week.",
  },
  {
    icon: Users,
    title: "Students waiting",
    description: "We do the marketing — you focus on teaching.",
  },
  {
    icon: Globe2,
    title: "Teach from anywhere",
    description: "All you need is a laptop and stable internet.",
  },
];

export default function ApplyPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <section className="bg-pattern-islamic-soft">
        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Application
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Apply to Teach on{" "}
              <span className="text-gradient-primary">LearnFurqan</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Tell us about yourself. We review every application within 3–5
              business days.
            </p>
          </div>
        </div>
      </section>

      {/* Quick benefits — vertical cards */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 via-white to-white">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Why teach with us
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Everything you need to{" "}
              <span className="text-gradient-primary">teach &amp; earn</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Built for Quran teachers — keep full control of your time, your
              students, and your payouts.
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_BENEFITS.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-border bg-white p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow"
              >
                {/* Top accent strip */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Icon */}
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <div className="absolute inset-0 rounded-2xl bg-primary/0 blur-xl transition-all duration-300 group-hover:bg-primary/30" />
                  <Icon className="relative h-9 w-9" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                  {title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>

                {/* Bottom checkmark */}
                <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      d="M5 12l5 5L20 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Included
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container pb-24 pt-10 md:pb-32 md:pt-14">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-10">
          <ApplyForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
