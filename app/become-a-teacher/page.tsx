import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  DollarSign,
  Globe,
  BookOpen,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Teacher | LearnFurqan",
  description:
    "Make a living teaching Quran online. Set your own schedule, set your own rate, and get paid weekly via Stripe.",
};

const STEPS = [
  {
    icon: FileText,
    title: "Apply",
    description: "Fill in the form with your experience and a demo video link.",
  },
  {
    icon: CheckCircle2,
    title: "Get approved",
    description: "Our team reviews your application within 3–5 business days.",
  },
  {
    icon: Sparkles,
    title: "Start earning",
    description: "Set your schedule and rate. Students book — you get paid.",
  },
];

const WHY_CARDS = [
  {
    icon: DollarSign,
    title: "Earn on your terms",
    description:
      "Set your own rate and schedule. Top teachers earn $300–500 per week teaching from the comfort of home.",
  },
  {
    icon: Globe,
    title: "Reach students worldwide",
    description:
      "Connect with Muslim families in the USA, UK, Canada, Australia and beyond who are actively seeking qualified teachers.",
  },
  {
    icon: BookOpen,
    title: "Make a real difference",
    description:
      "Help students memorize Quran, perfect their Tajweed, and grow in their Islamic knowledge — one class at a time.",
  },
];

const FAQS = [
  {
    q: "Do I need a certification?",
    a: "We prefer certified teachers but consider experienced teachers with strong Quran knowledge. A demo video helps.",
  },
  {
    q: "How do I get paid?",
    a: "Weekly payouts via Stripe directly to your bank account.",
  },
  {
    q: "What is LearnFurqan's commission?",
    a: "We take 20% commission. You keep 80% of every class fee.",
  },
  {
    q: "How long does approval take?",
    a: "We review applications within 3–5 business days.",
  },
  {
    q: "Can I set my own schedule?",
    a: "Yes! You set your own availability and hourly rate.",
  },
  {
    q: "What equipment do I need?",
    a: "A laptop, stable internet, webcam and microphone. We provide the Zoom integration.",
  },
];

const APPLY_HREF = "/become-a-teacher/apply";

export default function BecomeATeacherPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="bg-pattern-islamic-soft">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Teach with LearnFurqan
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Make a living{" "}
              <span className="text-gradient-primary">teaching Quran online</span>
            </h1>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Join hundreds of teachers earning from home.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={APPLY_HREF} className="contents">
                <Button variant="primary" size="xl">
                  Apply to Teach
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground">
                Free to apply · 3–5 day review
              </span>
            </div>
          </div>

          {/* 3 steps */}
          <ol className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <li
                key={title}
                className="relative rounded-2xl border border-border bg-white p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    className="absolute right-[-22px] top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary/60 md:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHY TEACH */}
      <section className="container py-20 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why teach with LearnFurqan?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Built for teachers who care about their craft — and their income.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {WHY_CARDS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-6 shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        {/* Image */}
        <figure className="mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80"
            alt="Muslim student learning online"
            loading="lazy"
            className="h-64 w-full rounded-3xl object-cover shadow-soft sm:h-80 md:h-96"
          />
          <figcaption className="mt-3 text-center text-sm text-muted-foreground">
            Join our growing community of Quran teachers worldwide
          </figcaption>
        </figure>

        {/* Testimonial */}
        <figure className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8">
          <div
            className="flex gap-0.5 text-yellow-500"
            aria-label="5 out of 5 stars"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <blockquote className="mt-3 text-base text-foreground sm:text-lg">
            &ldquo;LearnFurqan gave me the flexibility to teach Quran from home
            while earning a great income.&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-sm">
            <span className="font-semibold text-foreground">
              Ustadha Fatima M.
            </span>{" "}
            <span className="text-muted-foreground">
              — Quran &amp; Tajweed Teacher
            </span>
          </figcaption>
        </figure>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-pattern-islamic-soft">
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              FAQ
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Common questions
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-border bg-white p-5 shadow-soft open:shadow-glow"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-heading text-base font-semibold text-foreground sm:text-lg">
                    {q}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-open:rotate-45">
                    <span className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container py-20 md:py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-primary/5 p-10 text-center shadow-soft md:p-14">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to start teaching?
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Apply today and we&apos;ll review your application within 3–5
            business days.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href={APPLY_HREF} className="contents">
              <Button variant="primary" size="xl">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
