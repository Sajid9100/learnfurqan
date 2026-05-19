import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryBrowser } from "@/components/categories/CategoryBrowser";
import { getCategoryById } from "@/lib/categories";

type Props = { params: { subject: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryById(params.subject);
  if (!category) return { title: "Category not found | LearnFurqan" };
  return {
    title: `${category.name} Teachers — Find Your ${category.name} Teacher | LearnFurqan`,
    description: `${category.tagline}. Browse ${category.teachers}+ verified ${category.name} teachers on LearnFurqan.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const category = getCategoryById(params.subject);
  if (!category) notFound();

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <CategoryBrowser categoryId={category.id} />
      <Footer />
    </main>
  );
}
