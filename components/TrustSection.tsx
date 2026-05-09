"use client";

import { GraduationCap, Users, Star } from "lucide-react";
import { Reveal } from "./ui/Reveal";

const STATS = [
  {
    value: "10,000+",
    label: "Classes Completed",
    icon: GraduationCap,
  },
  {
    value: "500+",
    label: "Verified Teachers",
    icon: Users,
  },
  {
    value: "4.9/5",
    label: "Parent Rating",
    icon: Star,
  },
];

export function TrustSection() {
  return (
    <section className="bg-pattern-islamic-soft py-12 md:py-16">
      <div className="container">
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="group flex items-center gap-4 rounded-2xl border border-primary/10 bg-white/70 p-6 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
              >
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                    {value}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
