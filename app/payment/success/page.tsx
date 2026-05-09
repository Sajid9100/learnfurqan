import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Subscription confirmed | QuranSphere",
  description: "Your QuranSphere subscription is active.",
};

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id ?? "";

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <section className="bg-pattern-cta">
        <div className="container flex items-center justify-center py-24 md:py-32">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-white p-8 text-center shadow-card md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2.2} />
            </div>
            <h1 className="mt-6 font-heading text-3xl font-bold text-foreground md:text-4xl">
              You’re all set!
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
              Your subscription is active. We’ve emailed your receipt and next
              steps. Browse teachers and book your first class right now.
            </p>

            {sessionId && (
              <p className="mx-auto mt-4 max-w-md break-all rounded-xl bg-muted px-4 py-2 text-xs text-muted-foreground">
                Session: <span className="font-mono">{sessionId}</span>
              </p>
            )}

            <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
              <Link href="/" className="contents">
                <Button variant="outline" size="lg" className="w-full">
                  Back to home
                </Button>
              </Link>
              <Link href="/teachers" className="contents">
                <Button variant="primary" size="lg" className="w-full">
                  Browse teachers
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
