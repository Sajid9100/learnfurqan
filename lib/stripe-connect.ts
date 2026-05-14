// Stripe Connect Express helpers for paying teachers (Phase 5b).
//
// Setup once on the platform Stripe account: enable Connect, then enable
// Express in Settings → Connect. No env vars needed beyond the existing
// STRIPE_SECRET_KEY (Connect rides on the same secret).

import Stripe from "stripe";
import { getStripe } from "./stripe";
import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "./supabase";
import type { Teacher } from "./types";

// LearnFurqan keeps PLATFORM_FEE_PERCENT of every paid class; the rest auto-
// settles to the teacher's Connect account via destination charges.
export const PLATFORM_FEE_PERCENT = 20;

export function computeApplicationFeeCents(priceUsd: number): number {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) return 0;
  // Round to the nearest cent. We round the cents — not the dollars — so the
  // fee on $14.99 isn't artificially shifted by float rounding.
  return Math.round(priceUsd * 100 * (PLATFORM_FEE_PERCENT / 100));
}

export function teacherCanReceivePayouts(teacher: Teacher): boolean {
  return Boolean(teacher.stripe_account_id && teacher.stripe_payouts_enabled);
}

// Creates the Express account if the teacher doesn't have one yet, then
// returns the (possibly new) account id and the resolved Teacher row.
export async function createOrGetConnectedAccount(
  teacher: Teacher
): Promise<{ accountId: string; teacher: Teacher }> {
  if (teacher.stripe_account_id) {
    return { accountId: teacher.stripe_account_id, teacher };
  }
  if (!isSupabaseAdminConfigured) {
    throw new Error("Supabase service role required to persist Connect id.");
  }

  const stripe = getStripe();
  const country = (teacher.country_flag || "").toUpperCase().trim();
  if (!country || country.length !== 2) {
    throw new Error(
      `Teacher ${teacher.slug} is missing a valid 2-letter country code.`
    );
  }

  const params: Stripe.AccountCreateParams = {
    type: "express",
    country,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      teacher_id: teacher.id,
      teacher_slug: teacher.slug,
    },
  };
  if (teacher.email) params.email = teacher.email;

  const account = await stripe.accounts.create(params);

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .update({ stripe_account_id: account.id })
    .eq("id", teacher.id)
    .select("*")
    .single();
  if (error) throw error;

  return { accountId: account.id, teacher: data as Teacher };
}

export async function createOnboardingLink(
  accountId: string,
  args: { refreshUrl: string; returnUrl: string }
): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: args.refreshUrl,
    return_url: args.returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

export async function createDashboardLoginLink(
  accountId: string
): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

// Pulls the latest Connect status from Stripe and writes it back to teachers.
// Used by the /teacher/connect/return landing — webhooks are eventually-
// consistent and we want immediate UI feedback after onboarding.
export async function syncConnectStatus(
  teacher: Teacher
): Promise<Teacher> {
  if (!teacher.stripe_account_id) return teacher;
  if (!isSupabaseAdminConfigured) return teacher;

  const stripe = getStripe();
  const acct = await stripe.accounts.retrieve(teacher.stripe_account_id);
  const update = {
    stripe_charges_enabled: Boolean(acct.charges_enabled),
    stripe_payouts_enabled: Boolean(acct.payouts_enabled),
    stripe_details_submitted: Boolean(acct.details_submitted),
  };

  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("teachers")
    .update(update)
    .eq("id", teacher.id)
    .select("*")
    .single();
  if (error) {
    console.warn("[stripe-connect] sync failed:", error.message);
    return teacher;
  }
  return data as Teacher;
}
