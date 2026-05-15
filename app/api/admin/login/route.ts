import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  checkAdminEmail,
  checkAdminPassword,
  createAdminToken,
} from "@/lib/admin-auth";
import {
  checkAdminRateLimit,
  clientIp,
  recordAdminLoginAttempt,
} from "@/lib/admin-rate-limit";

export const runtime = "nodejs";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  console.log("[turnstile-debug] secret_present=", Boolean(secret), "secret_len=", secret?.length ?? 0);
  console.log("[turnstile-debug] token_present=", Boolean(token), "token_len=", token?.length ?? 0, "token_prefix=", token?.slice(0, 12));
  console.log("[turnstile-debug] verify_url=", TURNSTILE_VERIFY_URL, "ip=", ip);
  if (!secret) {
    console.log("[turnstile-debug] no secret set, returning false");
    return false;
  }
  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: form,
    });
    const text = await res.text();
    console.log("[turnstile-debug] cf_status=", res.status, "cf_body=", text);
    if (!res.ok) return false;
    let data: { success?: boolean; "error-codes"?: string[] };
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("[turnstile-debug] cf_json_parse_error=", e);
      return false;
    }
    console.log("[turnstile-debug] cf_success=", data.success, "cf_error_codes=", data["error-codes"]);
    return data.success === true;
  } catch (e) {
    console.log("[turnstile-debug] fetch_threw=", e);
    return false;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  const rl = await checkAdminRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      }
    );
  }

  let body: { email?: string; password?: string; captchaToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const captchaToken = (body.captchaToken ?? "").toString();
  if (!captchaToken) {
    return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
  }
  const captchaOk = await verifyTurnstile(captchaToken, ip);
  if (!captchaOk) {
    await recordAdminLoginAttempt(ip, false);
    return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
  }

  const email = (body.email ?? "").toString();
  const password = (body.password ?? "").toString();
  const emailOk = email.length > 0 && checkAdminEmail(email);
  const passwordOk = password.length > 0 && checkAdminPassword(password);
  if (!emailOk || !passwordOk) {
    await recordAdminLoginAttempt(ip, false);
    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 401 }
    );
  }

  await recordAdminLoginAttempt(ip, true);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: createAdminToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
