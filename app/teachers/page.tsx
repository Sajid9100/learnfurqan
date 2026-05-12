import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TeachersListing } from "@/components/teachers/TeachersListing";
import { TEACHERS } from "@/lib/teachers-data";

export const metadata: Metadata = {
  title: "Find Your Perfect Quran Teacher | LearnFurqan",
  description:
    "Browse verified Quran teachers from around the world. Filter by subject, gender, language, and price.",
};

export default function TeachersPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <section className="bg-pattern-islamic-soft">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Browse Teachers
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Find Your Perfect{" "}
              <span className="text-gradient-primary">Quran Teacher</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Browse verified teachers from around the world.
            </p>
          </div>
        </div>
      </section>

      <section className="container pb-24 pt-2 md:pb-32">
        <TeachersListing teachers={TEACHERS} />
      </section>

      <Footer />
    </main>
  );
}
