import { NextResponse } from "next/server";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import { createDashboardLoginLink } from "@/lib/stripe-connect";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
  if (!teacher.stripe_account_id) {
    return NextResponse.json(
      { error: "Stripe Connect onboarding has not been started yet." },
      { status: 409 }
    );
  }
  try {
    const url = await createDashboardLoginLink(teacher.stripe_account_id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[connect/dashboard] failed", err);
    const message =
      err instanceof Error ? err.message : "Could not open Stripe dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
