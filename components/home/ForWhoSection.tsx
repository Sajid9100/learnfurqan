import Link from "next/link";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Users,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const GEOMETRIC_GRID =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%230a2e1e' stroke-width='0.5' opacity='0.05'><path d='M30 0L60 30L30 60L0 30Z'/><path d='M0 0H60M0 30H60M0 60H60M0 0V60M30 0V60M60 0V60'/></g></svg>\")";

type Card = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  iconRing: string;
  title: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

const CARDS: Card[] = [
  {
    Icon: GraduationCap,
    iconBg: "#0a2e1e",
    iconColor: "#ffffff",
    iconRing: "ring-[#0a2e1e]/10",
    title: "For Students",
    subtitle: "Learn at your own pace",
    features: [
      "1-on-1 live classes",
      "Certified Quran teachers",
      "Flexible schedules",
      "Beginner to advanced",
    ],
    ctaLabel: "Find a Teacher",
    ctaHref: "/teachers",
  },
  {
    Icon: Users,
    iconBg: "#c9a84c",
    iconColor: "#0a2e1e",
    iconRing: "ring-[#c9a84c]/15",
    title: "For Parents",
    subtitle: "Your child's Islamic education, simplified",
    features: [
      "Monitor child's progress",
      "Safe & verified teachers",
      "Female teachers available",
      "Weekly progress reports",
    ],
    ctaLabel: "Manage Your Child",
    ctaHref: "/parent",
    featured: true,
  },
  {
    Icon: BookOpen,
    iconBg: "#0a2e1e",
    iconColor: "#ffffff",
    iconRing: "ring-[#0a2e1e]/10",
    title: "For Teachers",
    subtitle: "Teach from anywhere, earn in dollars",
    features: [
      "Set your own schedule",
      "Weekly USD payouts",
      "1,200+ students waiting",
      "Free to apply",
    ],
    ctaLabel: "Start Teaching",
    ctaHref: "/become-a-teacher",
  },
];

export function ForWhoSection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-20 md:py-28"
      style={{ backgroundImage: GEOMETRIC_GRID }}
    >
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7e34]">
            Who is it for?
          </span>
          <h2 className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-[#0a2e1e] sm:text-5xl">
            LearnFurqan is built for{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#f3d97a 0%,#c9a84c 50%,#9a7e34 100%)",
              }}
            >
              Everyone
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Whether you&rsquo;re a student, a parent, or a teacher — there&rsquo;s
            a place for you here
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className={`group relative flex flex-col rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c9a84c]/40 hover:shadow-[0_24px_60px_-20px_rgba(10,46,30,0.18)] ${
                card.featured ? "shadow-md ring-1 ring-[#c9a84c]/15" : ""
              }`}
            >
              <span
                aria-hidden
                className="absolute inset-x-8 top-0 h-[3px] origin-center scale-x-0 rounded-b-full bg-gradient-to-r from-[#f3d97a] via-[#c9a84c] to-[#9a7e34] transition-transform duration-300 group-hover:scale-x-100"
              />

              {card.featured && (
                <span className="absolute -top-3 right-6 inline-flex items-center rounded-full bg-gradient-to-r from-[#f3d97a] to-[#c9a84c] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#0a2e1e] shadow-sm">
                  Most Popular
                </span>
              )}

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full shadow-inner ring-8 ${card.iconRing}`}
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <card.Icon className="h-8 w-8" />
              </div>

              <h3 className="mt-6 font-heading text-2xl font-bold text-[#0a2e1e]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{card.subtitle}</p>

              <ul className="mt-6 flex flex-col gap-3">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#0a2e1e]/5 text-[#0a2e1e]">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={card.ctaHref}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0a2e1e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3d29]"
              >
                {card.ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
