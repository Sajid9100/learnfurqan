import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ApplyForm } from "./ApplyForm";
import {
  CalendarDays,
  Globe2,
  Banknote,
  Users,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Teacher | LearnFurqan",
  description:
    "Teach Quran online with LearnFurqan. Set your own schedule, teach from anywhere, and get paid weekly via Stripe.",
};

const BENEFITS = [
  {
    icon: CalendarDays,
    title: "Set your own schedule",
    description: "Choose when you teach. Block out times that don't work for you.",
  },
  {
    icon: Globe2,
    title: "Teach from anywhere",
    description: "All you need is a laptop and a stable internet connection.",
  },
  {
    icon: Banknote,
    title: "Get paid weekly via Stripe",
    description:
      "Connect your Stripe account once. Earnings land in your bank every week.",
  },
  {
    icon: Users,
    title: "Students waiting for you",
    description:
      "We do the marketing. You focus on teaching — students come to you.",
  },
];

export default function BecomeATeacherPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <section className="bg-pattern-islamic-soft">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Join Our Teachers
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Become a{" "}
              <span className="text-gradient-primary">LearnFurqan Teacher</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Share your knowledge, set your own hours, and earn weekly — all
              from home.
            </p>
          </div>
        </div>
      </section>

      <section className="container pb-24 pt-8 md:pb-32">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <aside className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Why teach with LearnFurqan?
            </h2>

            <ul className="space-y-4">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Earnings example
                </span>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                10 classes/week × $15 ={" "}
                <span className="text-primary">$150/week</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Most teachers run 10–25 classes per week. You set your hourly
                rate.
              </p>
            </div>
          </aside>

          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Apply now
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We review within 3–5 business days.
            </p>
            <div className="mt-6">
              <ApplyForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
