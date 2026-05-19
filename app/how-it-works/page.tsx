import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Search,
  Calendar,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Shield,
  BadgeDollarSign,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works — Start Learning Quran in 4 Steps | LearnFurqan",
  description:
    "From registration to your first lesson in less than 10 minutes. Learn how to find a verified Quran teacher, book a free trial, and start your journey.",
};

const STEPS: { n: string; Icon: LucideIcon; title: string; desc: string }[] = [
  {
    n: "01",
    Icon: Search,
    title: "Find Your Teacher",
    desc: "Browse 1,200+ verified Quran and Islamic teachers. Filter by subject, language, price, and availability.",
  },
  {
    n: "02",
    Icon: Calendar,
    title: "Book a Free Trial",
    desc: "Schedule a free 30-minute trial lesson at a time that suits you. No payment required upfront.",
  },
  {
    n: "03",
    Icon: GraduationCap,
    title: "Start Learning",
    desc: "Join your live 1-on-1 class via video call. Learn from the comfort of your home.",
  },
  {
    n: "04",
    Icon: TrendingUp,
    title: "Track Progress",
    desc: "Get regular feedback, track your Quran journey, and level up at your own pace.",
  },
];

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: CheckCircle, title: "No contracts", desc: "Cancel anytime" },
  { Icon: Shield, title: "Safe & verified", desc: "Every teacher vetted" },
  { Icon: BadgeDollarSign, title: "Money-back guarantee", desc: "Risk-free trial" },
];

const FAQ_PREVIEW = [
  {
    q: "Is the trial lesson really free?",
    a: "Yes! Your first 30-minute trial with any teacher is completely free.",
  },
  {
    q: "Can I change my teacher?",
    a: "Absolutely. You can switch teachers anytime with no extra charge.",
  },
  {
    q: "What do I need to get started?",
    a: "Just a laptop or phone with internet. No special software needed.",
  },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f2a]">
      {children}
    </span>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="relative bg-white">
      <Navbar />

      {/* HERO */}
      <section className="bg-pattern-islamic pb-16 pt-16 md:pb-20 md:pt-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge>How It Works</Badge>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight text-[#0a2e1e] sm:text-5xl md:text-6xl">
              Start Learning Quran in{" "}
              <span className="bg-gradient-to-r from-[#f3d97a] via-[#c9a84c] to-[#9a7e34] bg-clip-text text-transparent">
                4 Simple Steps
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
              From registration to your first lesson — it takes less than 10
              minutes.
            </p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="bg-pattern-islamic pb-20 md:pb-28">
        <div className="container">
          <div className="space-y-14 md:space-y-20">
            {STEPS.map((step, i) => {
              const reverse = i % 2 === 1;
              return (
                <div
                  key={step.n}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
                >
                  {/* Visual */}
                  <div className={reverse ? "lg:order-2" : ""}>
                    <div
                      className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-14 ${
                        reverse
                          ? "border-r-4 border-r-[#0a2e1e]"
                          : "border-l-4 border-l-[#0a2e1e]"
                      }`}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c9a84c]/10 blur-3xl"
                      />
                      <div className="relative">
                        <div className="font-heading text-[5rem] font-bold leading-none tracking-tighter text-[#c9a84c] sm:text-[6rem]">
                          {step.n}
                        </div>
                        <div className="mt-4 text-[#0a2e1e]">
                          <step.Icon className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.75} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className={reverse ? "lg:order-1" : ""}>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6f2a]">
                      <span className="h-px w-8 bg-[#c9a84c]" />
                      Step {step.n}
                    </div>
                    <h3 className="mt-4 font-heading text-2xl font-bold text-[#0a2e1e] sm:text-3xl md:text-4xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="relative overflow-hidden bg-[#0a2e1e] py-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c9a84c 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container relative">
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
              >
                <div className="text-[#c9a84c]">
                  <f.Icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="font-heading text-lg font-semibold text-white">
                    {f.title}
                  </div>
                  <div className="mt-1 text-sm text-white/70">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="bg-pattern-islamic py-20 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge>Common Questions</Badge>
            <h2 className="mt-5 font-heading text-3xl font-bold text-[#0a2e1e] sm:text-4xl md:text-5xl">
              Quick Answers
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {FAQ_PREVIEW.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-[#0a2e1e] marker:hidden [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#c9a84c] transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
            >
              See all FAQs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pattern-islamic pb-20 md:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#fef9e7] px-8 py-16 text-center sm:px-12 md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c9a84c]/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#0a2e1e]/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold leading-tight text-[#0a2e1e] sm:text-4xl md:text-5xl">
                Ready to Begin?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
                Take your first step today — your free trial is just a click
                away.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/teachers" className="contents">
                  <Button size="lg" className="w-full sm:w-auto">
                    Find Your Teacher
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/become-a-teacher" className="contents">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Become a Teacher
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
