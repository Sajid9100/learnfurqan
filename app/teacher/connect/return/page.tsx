import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import { syncConnectStatus } from "@/lib/stripe-connect";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function ConnectReturnPage() {
  const teacher = (await getAuthedTeacher())!;
  // The webhook will catch up async, but pulling status now means the next
  // page load already shows the correct state.
  const synced =
    isStripeConfigured && teacher.stripe_account_id
      ? await syncConnectStatus(teacher)
      : teacher;

  // Teacher hit /return without ever starting onboarding — punt back home.
  if (!synced.stripe_account_id) redirect("/teacher/earnings");

  const ready = synced.stripe_payouts_enabled;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <section className="rounded-3xl border border-border bg-white p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <div
            className={
              "flex h-14 w-14 items-center justify-center rounded-full " +
              (ready
                ? "bg-primary/15 text-primary"
                : "bg-accent/15 text-accent-700")
            }
          >
            {ready ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <Clock className="h-7 w-7" />
            )}
          </div>
          <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">
            {ready ? "You're all set" : "Stripe is reviewing your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ready
              ? "Your Stripe account can receive payouts. New paid classes will route to your bank automatically."
              : "Onboarding details have been submitted. Stripe usually finishes verification in a few minutes; this page will reflect the new status when you refresh."}
          </p>
          <Link
            href="/teacher/earnings"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Back to earnings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
