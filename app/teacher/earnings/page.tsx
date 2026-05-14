import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAuthedTeacher } from "@/lib/teacher-auth";
import { getBookingsForTeacher } from "@/lib/supabase";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe-connect";
import { ConnectActions } from "@/components/teacher/ConnectActions";
import type { Booking, Teacher } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAYOUT_PERCENT = 100 - PLATFORM_FEE_PERCENT;

export default async function TeacherEarningsPage() {
  const teacher = (await getAuthedTeacher())!;
  const bookings = await getBookingsForTeacher(teacher.id);
  const totals = computeTotals(bookings, Number(teacher.price_per_class));
  const status = connectStatus(teacher);
  const teacherShare = (totals.grossRevenue * PAYOUT_PERCENT) / 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Earnings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lifetime totals from your bookings on LearnFurqan. You keep{" "}
          {PAYOUT_PERCENT}% of each paid class; LearnFurqan keeps{" "}
          {PLATFORM_FEE_PERCENT}%.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Paid classes" value={String(totals.paidCount)} />
        <Stat label="Free trials delivered" value={String(totals.trialCount)} />
        <Stat
          label={`Your share (${PAYOUT_PERCENT}%)`}
          value={`$${teacherShare.toFixed(2)}`}
        />
      </div>

      <ConnectStatusCard status={status} />
    </div>
  );
}

type Status = "not_started" | "incomplete" | "active";

function connectStatus(t: Teacher): Status {
  if (!t.stripe_account_id) return "not_started";
  if (t.stripe_payouts_enabled) return "active";
  return "incomplete";
}

function ConnectStatusCard({ status }: { status: Status }) {
  if (status === "active") {
    return (
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Payouts active
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each paid class is split automatically — your {PAYOUT_PERCENT}%
              share lands in your Stripe balance, and Stripe pays it out to
              your bank on its standard schedule.
            </p>
            <div className="mt-4">
              <ConnectActions status="active" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (status === "incomplete") {
    return (
      <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent/15 text-accent-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Finish payout setup
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your Stripe account is started but not yet ready to receive
              payouts. Until it's complete, paid classes land in the
              LearnFurqan balance and we'll forward them manually.
            </p>
            <div className="mt-4">
              <ConnectActions status="incomplete" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Get paid directly with Stripe
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a Stripe account to start receiving {PAYOUT_PERCENT}% of
            every paid class straight to your bank. Onboarding takes a few
            minutes; you can come back any time.
          </p>
          <div className="mt-4">
            <ConnectActions status="not_started" />
          </div>
        </div>
      </div>
    </section>
  );
}

function computeTotals(bookings: Booking[], pricePerClass: number) {
  let paidCount = 0;
  let trialCount = 0;
  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    if (b.payment_status === "paid") paidCount += 1;
    else if (b.payment_status === "free_trial") trialCount += 1;
  }
  return {
    paidCount,
    trialCount,
    grossRevenue: paidCount * pricePerClass,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-heading text-2xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}
