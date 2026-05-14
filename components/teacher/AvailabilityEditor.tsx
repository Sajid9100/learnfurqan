"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { cn } from "@/lib/utils";
import type {
  TeacherAvailabilityException,
  TeacherAvailabilityRule,
  Weekday,
} from "@/lib/types";

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const inputCls =
  "block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function AvailabilityEditor({
  classDurationMinutes,
}: {
  classDurationMinutes: number;
}) {
  const [rules, setRules] = useState<TeacherAvailabilityRule[]>([]);
  const [exceptions, setExceptions] = useState<TeacherAvailabilityException[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const browserTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const [ruleForm, setRuleForm] = useState({
    weekday: 1,
    start_time: "09:00",
    end_time: "10:00",
    timezone: browserTz,
  });
  const [exForm, setExForm] = useState({
    exception_date: "",
    exception_kind: "block" as "block" | "extra",
    start_time: "",
    end_time: "",
    timezone: browserTz,
    notes: "",
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/teacher/availability");
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      const data = await r.json();
      setRules(data.rules ?? []);
      setExceptions(data.exceptions ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function addRule() {
    setBusy(true);
    try {
      const r = await fetch("/api/teacher/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "rule", ...ruleForm }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      await load();
      toast.success("Rule added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function addException() {
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        kind: "exception",
        exception_date: exForm.exception_date,
        exception_kind: exForm.exception_kind,
        notes: exForm.notes,
      };
      if (
        exForm.exception_kind === "extra" ||
        (exForm.start_time && exForm.end_time)
      ) {
        payload.start_time = exForm.start_time;
        payload.end_time = exForm.end_time;
        payload.timezone = exForm.timezone;
      }
      const r = await fetch("/api/teacher/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      await load();
      toast.success("Exception added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(kind: "rule" | "exception", rowId: string) {
    setBusy(true);
    try {
      const r = await fetch(
        `/api/teacher/availability?kind=${kind}&row_id=${rowId}`,
        { method: "DELETE" }
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      await load();
      toast.success("Removed");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Weekly recurring rules
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Each rule generates {classDurationMinutes}-minute slots between start
          and end in the chosen timezone.
        </p>

        <div className="mt-4 space-y-2">
          {rules.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
              No rules yet. You will appear unavailable to students.
            </p>
          )}
          {rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-foreground">
                  {WEEKDAYS[r.weekday]?.label ?? `Day ${r.weekday}`}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}{" "}
                  {r.timezone}
                </span>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove("rule", r.id)}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border border-border bg-muted/10 p-3 sm:grid-cols-5">
          <select
            className={inputCls}
            value={ruleForm.weekday}
            onChange={(e) =>
              setRuleForm({ ...ruleForm, weekday: Number(e.target.value) })
            }
          >
            {WEEKDAYS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          <input
            type="time"
            className={inputCls}
            value={ruleForm.start_time}
            onChange={(e) =>
              setRuleForm({ ...ruleForm, start_time: e.target.value })
            }
          />
          <input
            type="time"
            className={inputCls}
            value={ruleForm.end_time}
            onChange={(e) =>
              setRuleForm({ ...ruleForm, end_time: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="IANA tz (e.g. UTC)"
            className={inputCls}
            value={ruleForm.timezone}
            onChange={(e) =>
              setRuleForm({ ...ruleForm, timezone: e.target.value })
            }
          />
          <button
            type="button"
            disabled={busy}
            onClick={addRule}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-700",
              busy && "opacity-60"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add rule
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <h2 className="font-heading text-base font-semibold text-foreground">
          One-off exceptions
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          <strong>Block</strong>: remove time on a specific date (vacation
          etc.). <strong>Extra</strong>: add a one-off window outside your
          weekly schedule.
        </p>

        <div className="mt-4 space-y-2">
          {exceptions.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
              No exceptions.
            </p>
          )}
          {exceptions.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <div>
                <span
                  className={cn(
                    "mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    ex.kind === "block"
                      ? "bg-red-100 text-red-700"
                      : "bg-primary/15 text-primary"
                  )}
                >
                  {ex.kind}
                </span>
                <span className="font-medium text-foreground">
                  {ex.exception_date}
                </span>
                {ex.start_time && ex.end_time && (
                  <span className="ml-2 text-muted-foreground">
                    {ex.start_time.slice(0, 5)}–{ex.end_time.slice(0, 5)}{" "}
                    {ex.timezone}
                  </span>
                )}
                {ex.notes && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    — {ex.notes}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove("exception", ex.id)}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/10 p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              type="date"
              className={inputCls}
              value={exForm.exception_date}
              onChange={(e) =>
                setExForm({ ...exForm, exception_date: e.target.value })
              }
            />
            <select
              className={inputCls}
              value={exForm.exception_kind}
              onChange={(e) =>
                setExForm({
                  ...exForm,
                  exception_kind: e.target.value as "block" | "extra",
                })
              }
            >
              <option value="block">Block (remove time)</option>
              <option value="extra">Extra (add window)</option>
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              className={inputCls}
              value={exForm.notes}
              onChange={(e) =>
                setExForm({ ...exForm, notes: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <input
              type="time"
              placeholder="Start"
              className={inputCls}
              value={exForm.start_time}
              onChange={(e) =>
                setExForm({ ...exForm, start_time: e.target.value })
              }
            />
            <input
              type="time"
              placeholder="End"
              className={inputCls}
              value={exForm.end_time}
              onChange={(e) =>
                setExForm({ ...exForm, end_time: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="IANA tz"
              className={inputCls}
              value={exForm.timezone}
              onChange={(e) =>
                setExForm({ ...exForm, timezone: e.target.value })
              }
            />
            <button
              type="button"
              disabled={busy || !exForm.exception_date}
              onClick={addException}
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-700",
                (busy || !exForm.exception_date) && "opacity-60"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Add exception
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
