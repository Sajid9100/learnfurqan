import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import {
  createOnboardingLink,
  createOrGetConnectedAccount,
} from "@/lib/stripe-connect";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const teacher = await getAuthedTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const { accountId } = await createOrGetConnectedAccount(teacher);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = await createOnboardingLink(accountId, {
      refreshUrl: `${siteUrl}/teacher/earnings`,
      returnUrl: `${siteUrl}/teacher/connect/return`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[connect/onboard] failed", err);
    const message =
      err instanceof Error ? err.message : "Could not start Stripe onboarding";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
