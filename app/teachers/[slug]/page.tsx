import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TeacherProfile } from "@/components/teachers/TeacherProfile";
import { TEACHERS, getSeedTeacherBySlug } from "@/lib/teachers-data";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return TEACHERS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const teacher = getSeedTeacherBySlug(params.slug);
  if (!teacher) {
    return { title: "Teacher not found | QuranSphere" };
  }
  return {
    title: `${teacher.name} — ${teacher.subject} | QuranSphere`,
    description: teacher.bio,
  };
}

export default function TeacherProfilePage({ params }: Props) {
  const teacher = getSeedTeacherBySlug(params.slug);
  if (!teacher) notFound();

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <TeacherProfile teacher={teacher} />
      <Footer />
    </main>
  );
}
