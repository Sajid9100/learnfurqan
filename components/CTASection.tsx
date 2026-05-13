"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/button";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-pattern-cta py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="container relative">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Start your{" "}
              <span className="text-gradient-primary">Quran journey</span>{" "}
              today
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Join thousands of students learning Quran with certified teachers
              worldwide.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3">
              <Link href="/teachers" className="contents">
                <Button variant="primary" size="xl" className="shadow-glow">
                  Browse Teachers
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs font-medium text-muted-foreground">
                No credit card required for your first class
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
