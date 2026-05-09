import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingTeacherCard } from "@/components/booking/BookingTeacherCard";
import { TEACHERS, getSeedTeacherBySlug } from "@/lib/teachers-data";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return TEACHERS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const teacher = getSeedTeacherBySlug(params.slug);
  if (!teacher) return { title: "Book a trial | QuranSphere" };
  return {
    title: `Book a free trial with ${teacher.name} | QuranSphere`,
    description: `Reserve your free trial class with ${teacher.name} — ${teacher.subject}.`,
  };
}

export default function BookingPage({ params }: Props) {
  const teacher = getSeedTeacherBySlug(params.slug);
  if (!teacher) notFound();

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <section className="bg-pattern-islamic-soft">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Free Trial
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Book your{" "}
              <span className="text-gradient-primary">free trial class</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Meet your teacher live — no commitment, no payment.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <BookingTeacherCard teacher={teacher} />
          </div>
          <div className="lg:col-span-7">
            <BookingForm teacher={teacher} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
