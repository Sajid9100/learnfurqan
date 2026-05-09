import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Pricing | QuranSphere",
  description:
    "Simple, transparent pricing for QuranSphere — free trial on every plan, cancel anytime.",
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
