import type {
  AvailabilitySlot,
  TeacherAvailabilityException,
  TeacherAvailabilityRule,
  Weekday,
} from "./types";

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

type BookedRange = { start: Date; end: Date };

export function expandAvailability(args: {
  rules: TeacherAvailabilityRule[];
  exceptions: TeacherAvailabilityException[];
  classDurationMinutes: number;
  from: Date;
  to: Date;
  bookedRanges?: BookedRange[];
}): AvailabilitySlot[] {
  const stepMs = args.classDurationMinutes * MS_PER_MINUTE;
  if (stepMs <= 0) return [];

  const fromMs = args.from.getTime();
  const toMs = args.to.getTime();
  if (toMs <= fromMs) return [];

  const nowMs = Date.now();
  const booked = args.bookedRanges ?? [];

  // Walk UTC days, plus one day either side, so rules whose UTC instant lands
  // on a neighbouring UTC date (because of the rule's timezone) are still
  // considered. We filter slots back to [from, to] at the end.
  const startDayMs = startOfUtcDay(args.from).getTime() - MS_PER_DAY;
  const endDayMs = startOfUtcDay(args.to).getTime() + MS_PER_DAY;

  const ruleSlots: AvailabilitySlot[] = [];
  for (let day = startDayMs; day <= endDayMs; day += MS_PER_DAY) {
    const dayUtc = new Date(day);
    for (const rule of args.rules) {
      if (!rule.is_active) continue;
      const local = getLocalDateParts(dayUtc, rule.timezone);
      if (local.weekday !== rule.weekday) continue;

      const st = parseHms(rule.start_time);
      const et = parseHms(rule.end_time);
      const windowStart = localWallTimeToUtc(
        local.year,
        local.month,
        local.day,
        st.h,
        st.m,
        st.s,
        rule.timezone
      ).getTime();
      const windowEnd = localWallTimeToUtc(
        local.year,
        local.month,
        local.day,
        et.h,
        et.m,
        et.s,
        rule.timezone
      ).getTime();

      for (let s = windowStart; s + stepMs <= windowEnd; s += stepMs) {
        ruleSlots.push(slotFromMs(s, stepMs));
      }
    }
  }

  // Exceptions: 'block' subtracts intervals; 'extra' adds one-off windows.
  const blocked: Array<{ start: number; end: number }> = [];
  const extraSlots: AvailabilitySlot[] = [];
  for (const ex of args.exceptions) {
    const [y, m, d] = ex.exception_date.split("-").map((n) => parseInt(n, 10));
    if (ex.kind === "block") {
      const tz = ex.timezone ?? "UTC";
      if (!ex.start_time || !ex.end_time) {
        // Whole-day block in the exception's local timezone.
        const dayStart = localWallTimeToUtc(y, m, d, 0, 0, 0, tz).getTime();
        blocked.push({ start: dayStart, end: dayStart + MS_PER_DAY });
      } else {
        const st = parseHms(ex.start_time);
        const et = parseHms(ex.end_time);
        const s = localWallTimeToUtc(y, m, d, st.h, st.m, st.s, tz).getTime();
        const e = localWallTimeToUtc(y, m, d, et.h, et.m, et.s, tz).getTime();
        blocked.push({ start: s, end: e });
      }
    } else if (ex.start_time && ex.end_time && ex.timezone) {
      const st = parseHms(ex.start_time);
      const et = parseHms(ex.end_time);
      const s = localWallTimeToUtc(y, m, d, st.h, st.m, st.s, ex.timezone).getTime();
      const e = localWallTimeToUtc(y, m, d, et.h, et.m, et.s, ex.timezone).getTime();
      for (let t = s; t + stepMs <= e; t += stepMs) {
        extraSlots.push(slotFromMs(t, stepMs));
      }
    }
  }

  const all = [...ruleSlots, ...extraSlots];
  const seen = new Set<string>();
  const out: AvailabilitySlot[] = [];

  for (const slot of all) {
    if (seen.has(slot.start)) continue;
    const s = new Date(slot.start).getTime();
    const e = new Date(slot.end).getTime();
    if (s < nowMs) continue;
    if (s < fromMs || s >= toMs) continue;
    if (rangesOverlap(s, e, blocked)) continue;
    if (
      booked.some((b) => overlap(s, e, b.start.getTime(), b.end.getTime()))
    ) {
      continue;
    }
    seen.add(slot.start);
    out.push(slot);
  }

  out.sort((a, b) => a.start.localeCompare(b.start));
  return out;
}

// ---------------------------------------------------------------------------
// Internals — timezone math via Intl.DateTimeFormat
// ---------------------------------------------------------------------------

function slotFromMs(startMs: number, stepMs: number): AvailabilitySlot {
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + stepMs).toISOString(),
    duration_minutes: stepMs / MS_PER_MINUTE,
  };
}

function parseHms(s: string): { h: number; m: number; s: number } {
  const [h = 0, m = 0, sec = 0] = s.split(":").map((n) => parseInt(n, 10) || 0);
  return { h, m, s: sec };
}

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function overlap(a1: number, a2: number, b1: number, b2: number): boolean {
  return a1 < b2 && b1 < a2;
}

function rangesOverlap(
  s: number,
  e: number,
  windows: Array<{ start: number; end: number }>
): boolean {
  for (const w of windows) {
    if (overlap(s, e, w.start, w.end)) return true;
  }
  return false;
}

// Convert a wall-clock date+time in a given IANA timezone to a UTC Date.
// Works by guessing UTC, then measuring how the guess renders in the target
// timezone and correcting by the observed offset.
export function localWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  tz: string
): Date {
  if (tz === "UTC") {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const parts = TIME_FORMATTERS.get(tz) ?? makeTimeFormatter(tz);
  const obs = readParts(parts.formatToParts(new Date(utcGuess)));
  const observedUtc = Date.UTC(
    obs.year,
    obs.month - 1,
    obs.day,
    obs.hour === 24 ? 0 : obs.hour,
    obs.minute,
    obs.second
  );
  const offset = observedUtc - utcGuess;
  return new Date(utcGuess - offset);
}

const DATE_PART_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function makeDateFormatter(tz: string): Intl.DateTimeFormat {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  DATE_PART_FORMATTERS.set(tz, f);
  return f;
}

function makeTimeFormatter(tz: string): Intl.DateTimeFormat {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  TIME_FORMATTERS.set(tz, f);
  return f;
}

function readParts(parts: Intl.DateTimeFormatPart[]) {
  const o: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") o[p.type] = p.value;
  }
  return {
    year: parseInt(o.year ?? "0", 10),
    month: parseInt(o.month ?? "0", 10),
    day: parseInt(o.day ?? "0", 10),
    hour: parseInt(o.hour ?? "0", 10),
    minute: parseInt(o.minute ?? "0", 10),
    second: parseInt(o.second ?? "0", 10),
    weekday: o.weekday,
  };
}

const WEEKDAY_MAP: Record<string, Weekday> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getLocalDateParts(
  d: Date,
  tz: string
): { year: number; month: number; day: number; weekday: Weekday } {
  const f = DATE_PART_FORMATTERS.get(tz) ?? makeDateFormatter(tz);
  const obs = readParts(f.formatToParts(d));
  return {
    year: obs.year,
    month: obs.month,
    day: obs.day,
    weekday: (WEEKDAY_MAP[obs.weekday ?? "Sun"] ?? 0) as Weekday,
  };
}
