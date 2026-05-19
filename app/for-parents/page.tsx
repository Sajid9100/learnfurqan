import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  BarChart2,
  UserCheck,
  MessageCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "For Parents — Your Child's Quran Journey in Your Hands | LearnFurqan",
  description:
    "Track lessons, message verified teachers, and manage every child from one parent dashboard. Built for families serious about Islamic education.",
};

const GEOMETRIC_GRID =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%230a2e1e' stroke-width='0.5' opacity='0.06'><path d='M30 0L60 30L30 60L0 30Z'/><path d='M0 0H60M0 30H60M0 60H60M0 0V60M30 0V60M60 0V60'/></g></svg>\")";

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: BarChart2,
    title: "Track Progress",
    desc: "See completed lessons, upcoming classes, and your child's Quran progress — all in one dashboard.",
  },
  {
    Icon: UserCheck,
    title: "Verified Teachers",
    desc: "Every teacher on LearnFurqan is manually verified. Female teachers available for sisters and children.",
  },
  {
    Icon: MessageCircle,
    title: "Message Teachers",
    desc: "Communicate directly with your child's teacher. Get weekly updates and feedback after every class.",
  },
  {
    Icon: Users,
    title: "Multiple Children",
    desc: "Add multiple children to one account. Manage all their lessons, teachers, and progress from one place.",
  },
];

const STATS = [
  { value: "10,000+", label: "Families trust LearnFurqan" },
  { value: "500+", label: "Female teachers available" },
  { value: "4.9/5", label: "Parent satisfaction rating" },
  { value: "48hr", label: "Average teacher response time" },
];

const TESTIMONIALS = [
  {
    quote:
      "My daughter finished Noorani Qaida in 3 months. The teacher was so patient!",
    author: "Fatima A.",
    role: "Mother of 2",
  },
  {
    quote:
      "I can see exactly what my son is learning every week. Amazing platform.",
    author: "Ahmed K.",
    role: "Father",
  },
  {
    quote: "Finally found a reliable female Quran teacher for my girls.",
    author: "Maryam S.",
    role: "Parent",
  },
];

export default function ForParentsPage() {
  return (
    <main className="relative">
      <Navbar />

      <section
        className="relative overflow-hidden bg-white py-20 md:py-28"
        style={{ backgroundImage: GEOMETRIC_GRID }}
      >
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7e34]">
              For Parents
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-[#0a2e1e] sm:text-5xl md:text-6xl">
              Your Child&rsquo;s Quran Journey,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg,#f3d97a 0%,#c9a84c 50%,#9a7e34 100%)",
                }}
              >
                In Your Hands
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              LearnFurqan gives parents full visibility into their child&rsquo;s
              Islamic education — from finding the right teacher to tracking
              every lesson.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a2e1e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3d29]"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0a2e1e] bg-white px-6 py-3 text-sm font-semibold text-[#0a2e1e] transition-colors hover:bg-[#0a2e1e] hover:text-white"
              >
                Learn More
                <ArrowDown className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#0a2e1e] sm:text-4xl">
              Everything you need to manage your child&rsquo;s learning
            </h2>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Built around what parents actually ask for.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex gap-5 rounded-3xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a84c]/40 hover:shadow-[0_24px_60px_-20px_rgba(10,46,30,0.18)]"
              >
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#0a2e1e]/5 text-[#0a2e1e]">
                  <feature.Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#0a2e1e]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a2e1e] py-16 md:py-20">
        <div className="container">
          <div className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-heading text-4xl font-bold sm:text-5xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg,#f3d97a 0%,#c9a84c 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#0a2e1e] sm:text-4xl">
              Parents love what we&rsquo;re building
            </h2>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Real feedback from families on LearnFurqan.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.author}
                className="flex flex-col rounded-3xl border border-gray-200 bg-gray-50 p-7"
              >
                <span aria-hidden className="text-4xl leading-none text-[#c9a84c]">
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 text-base leading-relaxed text-gray-700">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-gray-200 pt-4">
                  <p className="font-heading text-sm font-semibold text-[#0a2e1e]">
                    {t.author}
                  </p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#0a2e1e] py-20 md:py-24"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23c9a84c' stroke-width='0.6' opacity='0.12'><path d='M40 0L80 40L40 80L0 40Z'/><path d='M40 12L68 40L40 68L12 40Z'/><circle cx='40' cy='40' r='6'/></g></svg>\")",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[64rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(201,168,76,0.45), transparent)",
          }}
        />
        <div className="container relative text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Ready to Start?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 sm:text-lg">
            Create your free parent account and find the right teacher for your
            child today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#0a2e1e] shadow-[0_12px_32px_-10px_rgba(201,168,76,0.6)] transition hover:brightness-110"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#f3d97a 0%,#c9a84c 50%,#a88932 100%)",
              }}
            >
              Create Parent Account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/teachers"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#c9a84c]/50 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c9a84c]/15"
            >
              Browse Teachers First
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
