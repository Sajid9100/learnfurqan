import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TeacherProfile } from "@/components/teachers/TeacherProfile";
import { getReviewsByTeacherId, getTeacherBySlug } from "@/lib/supabase";
import { getSeedTeacherBySlug } from "@/lib/teachers-data";

type Props = { params: { slug: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const teacher =
    (await getTeacherBySlug(params.slug)) ?? getSeedTeacherBySlug(params.slug);
  if (!teacher) {
    return { title: "Teacher not found | LearnFurqan" };
  }
  return {
    title: `${teacher.name} — ${teacher.subject} | LearnFurqan`,
    description: teacher.bio,
  };
}

export default async function TeacherProfilePage({ params }: Props) {
  const teacher = await getTeacherBySlug(params.slug);
  if (!teacher) notFound();

  const reviews = await getReviewsByTeacherId(teacher.id);

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <TeacherProfile teacher={teacher} reviews={reviews} />
      <Footer />
    </main>
  );
}
