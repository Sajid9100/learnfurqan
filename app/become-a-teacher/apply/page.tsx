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

      <section className="container pb-24 pt-10 md:pb-32 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <aside className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              What you get
            </h2>
            <ul className="space-y-3">
              {QUICK_BENEFITS.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Quick tip:
                </span>{" "}
                Adding a short demo video link strengthens your application —
                it&apos;s the #1 thing our reviewers look at.
              </p>
            </div>
          </aside>

          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Application form
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              All fields marked with{" "}
              <span className="text-red-500">*</span> are required.
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
