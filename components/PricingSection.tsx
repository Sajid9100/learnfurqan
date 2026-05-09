"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/button";
import { SubscribeModal } from "./SubscribeModal";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/types";

type Tier = {
  name: string;
  plan: SubscriptionPlan | null;
  price: string;
  cadence?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    plan: null,
    price: "Free",
    description: "Perfect to explore the platform.",
    features: [
      "1 free trial class",
      "Browse all teachers",
      "Basic progress tracking",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Basic",
    plan: "basic",
    price: "$29",
    cadence: "/month",
    description: "Best for steady weekly learners.",
    features: [
      "4 classes per month",
      "Homework & assignments",
      "Monthly certificates",
      "Email support",
    ],
    cta: "Subscribe to Basic",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    plan: "premium",
    price: "$59",
    cadence: "/month",
    description: "For serious students aiming high.",
    features: [
      "Unlimited classes",
      "AI Tajweed assistance",
      "Parent dashboard",
      "Priority teacher matching",
    ],
    cta: "Subscribe to Premium",
  },
];

export function PricingSection() {
  const [openPlan, setOpenPlan] = useState<SubscriptionPlan | null>(null);

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Pricing
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              No hidden fees. Cancel anytime. Free trial on every plan.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <PricingCard
                tier={tier}
                onSubscribe={(plan) => setOpenPlan(plan)}
              />
            </Reveal>
          ))}
        </div>
      </div>

      <SubscribeModal
        open={openPlan !== null}
        plan={openPlan}
        onClose={() => setOpenPlan(null)}
      />
    </section>
  );
}

function PricingCard({
  tier,
  onSubscribe,
}: {
  tier: Tier;
  onSubscribe: (plan: SubscriptionPlan) => void;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border bg-white p-8 transition-all duration-300",
        tier.highlighted
          ? "border-primary/60 shadow-card lg:-translate-y-3 lg:shadow-[0_24px_48px_-12px_rgba(15,118,110,0.25)]"
          : "border-border shadow-soft hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
      )}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-soft">
          <Sparkles className="h-3 w-3" />
          {tier.badge}
        </span>
      )}

      <h3 className="font-heading text-lg font-semibold text-foreground">
        {tier.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-heading text-5xl font-bold tracking-tight text-foreground">
          {tier.price}
        </span>
        {tier.cadence && (
          <span className="text-sm font-medium text-muted-foreground">
            {tier.cadence}
          </span>
        )}
      </div>

      <ul className="mt-8 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span
              className={cn(
                "mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full",
                tier.highlighted
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/85">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        {tier.plan ? (
          <Button
            variant={tier.highlighted ? "primary" : "outline"}
            size="lg"
            className="w-full"
            onClick={() => onSubscribe(tier.plan!)}
          >
            {tier.cta}
          </Button>
        ) : (
          <Link href="/teachers" className="contents">
            <Button
              variant={tier.highlighted ? "primary" : "outline"}
              size="lg"
              className="w-full"
            >
              {tier.cta}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
