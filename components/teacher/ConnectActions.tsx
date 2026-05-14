"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

type Status = "not_started" | "incomplete" | "active";

export function ConnectActions({ status }: { status: Status }) {
  const [busy, setBusy] = useState<"" | "onboard" | "dashboard">("");
  const toast = useToast();

  async function startOnboarding() {
    setBusy("onboard");
    try {
      const res = await fetch("/api/teacher/connect/onboard", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Could not start onboarding");
      }
      window.location.href = data.url as string;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start");
      setBusy("");
    }
  }

  async function openDashboard() {
    setBusy("dashboard");
    try {
      const res = await fetch("/api/teacher/connect/dashboard");
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Could not open dashboard");
      }
      window.open(data.url as string, "_blank", "noopener");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open");
    } finally {
      setBusy("");
    }
  }

  if (status === "active") {
    return (
      <button
        type="button"
        onClick={openDashboard}
        disabled={busy === "dashboard"}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {busy === "dashboard" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        Open Stripe dashboard
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startOnboarding}
      disabled={busy === "onboard"}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
    >
      {busy === "onboard" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
      {status === "not_started" ? "Set up payouts" : "Continue setup"}
    </button>
  );
}
