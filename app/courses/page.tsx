import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoriesSection } from "@/components/home/CategoriesSection";

export const metadata = {
  title: "Courses — Explore Quran & Islamic Learning Programs | LearnFurqan",
  description:
    "Browse structured Quran and Islamic learning programs — from Tajweed and Hifz to Arabic, Fiqh, and Tafseer. Find the right course for your journey.",
};

const ISLAMIC_PATTERN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23c9a84c' stroke-width='0.6' opacity='0.09'><path d='M40 0L80 40L40 80L0 40Z'/><path d='M40 12L68 40L40 68L12 40Z'/><circle cx='40' cy='40' r='6'/><path d='M0 0L80 80M80 0L0 80' stroke-width='0.3'/></g></svg>\")";

export default function CoursesPage() {
  return (
    <main className="relative bg-white">
      <Navbar />

      <section
        className="relative overflow-hidden pb-10 pt-16 md:pb-14 md:pt-24"
        style={{
          backgroundColor: "#0a2e1e",
          backgroundImage: ISLAMIC_PATTERN,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[64rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(201,168,76,0.45), transparent)",
          }}
        />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6c97a]">
              Our Courses
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Explore Our{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg,#f3d97a 0%,#c9a84c 50%,#9a7e34 100%)",
                }}
              >
                Courses
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
              Browse structured Quran and Islamic learning programs — taught by
              certified teachers, designed for every level.
            </p>
          </div>
        </div>
      </section>

      <CategoriesSection />

      <Footer />
    </main>
  );
}
