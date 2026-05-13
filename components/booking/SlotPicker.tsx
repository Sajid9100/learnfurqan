"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilitySlot } from "@/lib/types";

type Status = "loading" | "ready" | "empty" | "error";

type Props = {
  teacherSlug: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
};

export function SlotPicker({ teacherSlug, value, onChange, error }: Props) {
  const tz = useMemo(() => detectTimeZone(), []);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMsg(null);
    fetch(`/api/teachers/${teacherSlug}/availability`)
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}) as { error?: string });
          throw new Error(j.error || `Request failed (${res.status})`);
        }
        return res.json() as Promise<{ slots: AvailabilitySlot[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots);
        setStatus(data.slots.length === 0 ? "empty" : "ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg((err as Error).message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [teacherSlug]);

  const grouped = useMemo(() => groupSlotsByDay(slots, tz), [slots, tz]);

  return (
    <div className="space-y-3">
      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        Times shown in your local time
        <span className="font-medium text-foreground">({tz})</span>
      </p>

      {status === "loading" && (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading available times…
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <div>
            <p>Couldn’t load availability.</p>
            {errorMsg && (
              <p className="mt-1 text-xs text-red-700/80">{errorMsg}</p>
            )}
          </div>
        </div>
      )}

      {status === "empty" && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          No open times in the next 2 weeks. Try again later or message the
          teacher.
        </div>
      )}

      {status === "ready" && (
        <div className="space-y-4">
          {grouped.map((day) => (
            <div key={day.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {day.label}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {day.slots.map((slot) => {
                  const checked = value === slot.start;
                  return (
                    <label
                      key={slot.start}
                      className={cn(
                        "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                        checked
                          ? "border-primary bg-primary text-white shadow-soft"
                          : "border-border bg-white text-foreground/80 hover:border-primary/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="selectedSlot"
                        value={slot.start}
                        checked={checked}
                        onChange={() => onChange(slot.start)}
                        className="sr-only"
                      />
                      {formatTimeInTz(slot.start, tz)}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function groupSlotsByDay(slots: AvailabilitySlot[], tz: string) {
  const dayFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const keyFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = keyFmt.format(new Date());
  const tomorrow = keyFmt.format(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const map = new Map<string, { label: string; slots: AvailabilitySlot[] }>();
  for (const slot of slots) {
    const d = new Date(slot.start);
    const key = keyFmt.format(d);
    if (!map.has(key)) {
      const label =
        key === today
          ? "Today"
          : key === tomorrow
            ? "Tomorrow"
            : dayFmt.format(d);
      map.set(key, { label, slots: [] });
    }
    map.get(key)!.slots.push(slot);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({ key, ...v }));
}

function formatTimeInTz(iso: string, tz: string): string {
  return new Intl.DateTimeFormat([], {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}
