import { createServerSupabaseClient } from "@/lib/supabase";

const WINDOW_REQUESTS_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_BEFORE_LOCKOUT = 5;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function checkAdminRateLimit(ip: string): Promise<RateLimitResult> {
  const supabase = createServerSupabaseClient();
  const now = Date.now();
  const lockoutStart = new Date(now - LOCKOUT_WINDOW_MS).toISOString();

  const { data } = await supabase
    .from("admin_login_attempts")
    .select("attempt_at, success")
    .eq("ip", ip)
    .gte("attempt_at", lockoutStart)
    .order("attempt_at", { ascending: false })
    .limit(50);

  const attempts = data ?? [];

  const lastMinute = attempts.filter(
    (a) => new Date(a.attempt_at).getTime() >= now - WINDOW_REQUESTS_MS
  );
  if (lastMinute.length >= MAX_REQUESTS_PER_WINDOW) {
    return { ok: false, retryAfterSeconds: 60 };
  }

  const fails = attempts.filter((a) => !a.success);
  if (fails.length >= MAX_FAILED_BEFORE_LOCKOUT) {
    const oldestFailMs = new Date(fails[fails.length - 1].attempt_at).getTime();
    const retryMs = Math.max(0, oldestFailMs + LOCKOUT_WINDOW_MS - now);
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)) };
  }

  return { ok: true };
}

export async function recordAdminLoginAttempt(
  ip: string,
  success: boolean
): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.from("admin_login_attempts").insert({ ip, success });
}
