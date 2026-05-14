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

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
