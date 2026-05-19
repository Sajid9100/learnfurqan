import { NextResponse } from "next/server";
import { sendSupportMessage } from "@/lib/email";

export const runtime = "nodejs";

const VALID_SUBJECTS = new Set([
  "General Query",
  "Technical Issue",
  "Teacher Support",
  "Student Support",
  "Billing",
]);

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const subject = clean(body.subject, 80);
  const message = clean(body.message, 5000);

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  if (!VALID_SUBJECTS.has(subject))
    return NextResponse.json({ error: "Please choose a valid subject." }, { status: 400 });
  if (!message)
    return NextResponse.json({ error: "Message is required." }, { status: 400 });

  try {
    await sendSupportMessage({ name, email, subject, message });
  } catch (err) {
    console.error("[support] failed to send message", err);
    return NextResponse.json(
      { error: "Could not send your message. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
