import { Resend } from "resend";
import type { Teacher } from "./types";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress =
  process.env.EMAIL_FROM || "QuranSphere <onboarding@resend.dev>";
const adminAddress = process.env.ADMIN_EMAIL || "";

const isPlaceholder = (v: string | undefined) =>
  !v || v.includes("re_xxxxx") || v.includes("your_resend");

export const isEmailConfigured = !isPlaceholder(apiKey);
export const isAdminEmailConfigured = Boolean(
  adminAddress && !adminAddress.includes("admin@example")
);

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!isEmailConfigured) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!_resend) _resend = new Resend(apiKey!);
  return _resend;
}

export type BookingEmailPayload = {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCountry: string;
  ageGroup: string;
  currentLevel: string;
  selectedSlot: string;
  message: string;
  teacher: Teacher;
};

export async function sendBookingConfirmationEmails(
  payload: BookingEmailPayload
) {
  if (!isEmailConfigured) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation emails.");
    return { studentSent: false, adminSent: false };
  }
  const resend = getResend();

  const studentResult = await resend.emails.send({
    from: fromAddress,
    to: payload.studentEmail,
    subject: "Your Free Trial Class is Confirmed — QuranSphere",
    html: renderStudentEmail(payload),
    text: renderStudentEmailText(payload),
  });

  let adminResult: Awaited<ReturnType<typeof resend.emails.send>> | null = null;
  if (isAdminEmailConfigured) {
    adminResult = await resend.emails.send({
      from: fromAddress,
      to: adminAddress,
      subject: `New Trial Booking — ${payload.studentName} with ${payload.teacher.name}`,
      html: renderAdminEmail(payload),
      text: renderAdminEmailText(payload),
    });
  }

  return {
    studentSent: !studentResult.error,
    adminSent: Boolean(adminResult && !adminResult.error),
  };
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function renderStudentEmail(p: BookingEmailPayload): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px 32px 0">
        <h1 style="margin:0;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:24px;font-weight:700">QuranSphere</h1>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.studentName)},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Your free trial class has been booked successfully!</p>

        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:16px;overflow:hidden;background:#ECFDF5">
          ${row("Teacher", escapeHtml(p.teacher.name))}
          ${row("Subject", escapeHtml(p.teacher.subject))}
          ${row("Your selected slot", escapeHtml(p.selectedSlot))}
        </table>

        <p style="margin:0 0 8px;font-size:15px;line-height:1.6">We will send you the Zoom link within 2 hours. The teacher will also confirm your booking shortly.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">If you have any questions, reply to this email or WhatsApp us at: <strong>+1 (555) 000-0000</strong>.</p>

        <p style="margin:24px 0 0;font-size:15px">JazakAllah Khair,<br/><strong>The QuranSphere Team</strong></p>
      </td></tr>
    </table>
  </div>`;
}

function renderStudentEmailText(p: BookingEmailPayload): string {
  return [
    `Assalamu Alaikum ${p.studentName},`,
    ``,
    `Your free trial class has been booked successfully!`,
    ``,
    `Teacher: ${p.teacher.name}`,
    `Subject: ${p.teacher.subject}`,
    `Your selected slot: ${p.selectedSlot}`,
    ``,
    `We will send you the Zoom link within 2 hours. The teacher will also confirm your booking shortly.`,
    ``,
    `If you have any questions, reply to this email or WhatsApp us at: +1 (555) 000-0000`,
    ``,
    `JazakAllah Khair,`,
    `The QuranSphere Team`,
  ].join("\n");
}

function renderAdminEmail(p: BookingEmailPayload): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:24px">
        <h2 style="margin:0 0 16px;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:20px">New trial booking</h2>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
          ${row("Student", escapeHtml(p.studentName))}
          ${row("Email", escapeHtml(p.studentEmail))}
          ${row("Phone", escapeHtml(p.studentPhone))}
          ${row("Country", escapeHtml(p.studentCountry))}
          ${row("Age group", escapeHtml(p.ageGroup))}
          ${row("Level", escapeHtml(p.currentLevel))}
          ${row("Teacher", escapeHtml(p.teacher.name))}
          ${row("Subject", escapeHtml(p.teacher.subject))}
          ${row("Selected slot", escapeHtml(p.selectedSlot))}
          ${row("Message", escapeHtml(p.message || "—"))}
        </table>
      </td></tr>
    </table>
  </div>`;
}

function renderAdminEmailText(p: BookingEmailPayload): string {
  return [
    `New trial booking`,
    ``,
    `Student:       ${p.studentName}`,
    `Email:         ${p.studentEmail}`,
    `Phone:         ${p.studentPhone}`,
    `Country:       ${p.studentCountry}`,
    `Age group:     ${p.ageGroup}`,
    `Level:         ${p.currentLevel}`,
    `Teacher:       ${p.teacher.name}`,
    `Subject:       ${p.teacher.subject}`,
    `Selected slot: ${p.selectedSlot}`,
    `Message:       ${p.message || "—"}`,
  ].join("\n");
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 14px;font-size:13px;color:#64748B;border-bottom:1px solid #E2E8E5;width:40%">${label}</td>
    <td style="padding:10px 14px;font-size:14px;color:#0F172A;border-bottom:1px solid #E2E8E5;font-weight:500">${value}</td>
  </tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
