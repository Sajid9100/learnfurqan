import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Renders a booking slot as a human-readable string. New bookings store ISO
// timestamps; legacy rows hold free-text like "Mon 9am UTC" and pass through.
export function formatBookingSlot(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime()) || !raw.includes("T")) return raw;
  try {
    const tz =
      typeof window !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC";
    return new Intl.DateTimeFormat([], {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return raw;
  }
}
