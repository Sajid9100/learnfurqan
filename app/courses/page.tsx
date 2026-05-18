import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoriesSection } from "@/components/home/CategoriesSection";

export const metadata = {
  title: "Courses — Explore Quran & Islamic Learning Programs | LearnFurqan",
  description:
    "Browse structured Quran and Islamic learning programs — from Tajweed and Hifz to Arabic, Fiqh, and Tafseer. Find the right course for your journey.",
};

export default function CoursesPage() {
  return (
    <main className="relative bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-white pb-12 pt-16 md:pb-16 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-[#0a2e1e]/[0.06] to-transparent"
        />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f2a]">
              Our Courses
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight text-[#0a2e1e] sm:text-5xl md:text-6xl">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-[#0a2e1e] via-[#1a5d3f] to-[#3a8a5f] bg-clip-text text-transparent">
                Courses
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
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
