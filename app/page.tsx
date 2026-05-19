import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ForWhoSection } from "@/components/home/ForWhoSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { TrustSection } from "@/components/TrustSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TeachersSection } from "@/components/TeachersSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <ForWhoSection />
      <CategoriesSection />
      <TrustSection />
      <FeaturesSection />
      <HowItWorks />
      <TeachersSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
