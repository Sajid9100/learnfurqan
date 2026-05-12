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

// ---------------------------------------------------------------------------
// Zoom link email — sent when admin adds a Zoom link to a booking
// ---------------------------------------------------------------------------
export type ZoomLinkEmailPayload = {
  studentName: string;
  studentEmail: string;
  teacherName: string;
  selectedSlot: string;
  zoomLink: string;
};

export async function sendZoomLinkEmail(payload: ZoomLinkEmailPayload) {
  if (!isEmailConfigured) {
    console.warn("[email] RESEND_API_KEY not set — skipping zoom link email.");
    return { sent: false };
  }
  const resend = getResend();
  const result = await resend.emails.send({
    from: fromAddress,
    to: payload.studentEmail,
    subject: "Your QuranSphere Class is Confirmed — Zoom Link Inside",
    html: renderZoomLinkEmail(payload),
    text: renderZoomLinkEmailText(payload),
  });
  return { sent: !result.error };
}

function renderZoomLinkEmail(p: ZoomLinkEmailPayload): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px 32px 0">
        <h1 style="margin:0;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:24px;font-weight:700">QuranSphere</h1>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.studentName)},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Your trial class has been confirmed!</p>

        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:16px;overflow:hidden;background:#ECFDF5">
          ${row("Teacher", escapeHtml(p.teacherName))}
          ${row("Time", escapeHtml(p.selectedSlot))}
        </table>

        <p style="margin:24px 0;text-align:center">
          <a href="${escapeHtml(p.zoomLink)}" style="display:inline-block;background:#0F766E;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px">Join Zoom Class</a>
        </p>
        <p style="margin:0 0 16px;font-size:13px;color:#64748B;word-break:break-all">Or copy this link: ${escapeHtml(p.zoomLink)}</p>

        <p style="margin:24px 0 0;font-size:15px">See you in class!<br/><strong>The QuranSphere Team</strong></p>
      </td></tr>
    </table>
  </div>`;
}

function renderZoomLinkEmailText(p: ZoomLinkEmailPayload): string {
  return [
    `Assalamu Alaikum ${p.studentName},`,
    ``,
    `Your trial class has been confirmed!`,
    ``,
    `Teacher: ${p.teacherName}`,
    `Time: ${p.selectedSlot}`,
    ``,
    `Join Zoom: ${p.zoomLink}`,
    ``,
    `See you in class!`,
    `The QuranSphere Team`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Teacher application — approved / rejected
// ---------------------------------------------------------------------------
export type ApplicationEmailPayload = {
  name: string;
  email: string;
  subject: string;
};

export async function sendApplicationApprovedEmail(
  payload: ApplicationEmailPayload
) {
  if (!isEmailConfigured) {
    console.warn("[email] RESEND_API_KEY not set — skipping approval email.");
    return { sent: false };
  }
  const resend = getResend();
  const result = await resend.emails.send({
    from: fromAddress,
    to: payload.email,
    subject: "Welcome to QuranSphere — Your Application is Approved",
    html: renderApprovalEmail(payload),
    text: renderApprovalEmailText(payload),
  });
  return { sent: !result.error };
}

export async function sendApplicationRejectedEmail(
  payload: ApplicationEmailPayload
) {
  if (!isEmailConfigured) {
    console.warn("[email] RESEND_API_KEY not set — skipping rejection email.");
    return { sent: false };
  }
  const resend = getResend();
  const result = await resend.emails.send({
    from: fromAddress,
    to: payload.email,
    subject: "QuranSphere — Update on Your Teacher Application",
    html: renderRejectionEmail(payload),
    text: renderRejectionEmailText(payload),
  });
  return { sent: !result.error };
}

function renderApprovalEmail(p: ApplicationEmailPayload): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:24px;font-weight:700">Welcome to QuranSphere</h1>
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.name)},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Alhamdulillah — your application to teach <strong>${escapeHtml(p.subject)}</strong> on QuranSphere has been <strong style="color:#0F766E">approved</strong>!</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Our onboarding team will reach out within 48 hours with next steps: profile setup, availability calendar, and your first student matches.</p>
        <p style="margin:24px 0 0;font-size:15px">JazakAllah Khair,<br/><strong>The QuranSphere Team</strong></p>
      </td></tr>
    </table>
  </div>`;
}

function renderApprovalEmailText(p: ApplicationEmailPayload): string {
  return [
    `Assalamu Alaikum ${p.name},`,
    ``,
    `Your application to teach ${p.subject} on QuranSphere has been approved!`,
    ``,
    `Our onboarding team will reach out within 48 hours with next steps: profile setup, availability calendar, and your first student matches.`,
    ``,
    `JazakAllah Khair,`,
    `The QuranSphere Team`,
  ].join("\n");
}

function renderRejectionEmail(p: ApplicationEmailPayload): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:22px;font-weight:700">QuranSphere</h1>
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.name)},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Thank you for applying to teach on QuranSphere. After careful review of your application, we are unable to move forward at this time.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">We receive many qualified applications and this decision is not a reflection of your skills as a teacher. You are welcome to apply again in the future as our needs change.</p>
        <p style="margin:24px 0 0;font-size:15px">JazakAllah Khair for your interest,<br/><strong>The QuranSphere Team</strong></p>
      </td></tr>
    </table>
  </div>`;
}

function renderRejectionEmailText(p: ApplicationEmailPayload): string {
  return [
    `Assalamu Alaikum ${p.name},`,
    ``,
    `Thank you for applying to teach on QuranSphere. After careful review of your application, we are unable to move forward at this time.`,
    ``,
    `We receive many qualified applications and this decision is not a reflection of your skills as a teacher. You are welcome to apply again in the future as our needs change.`,
    ``,
    `JazakAllah Khair for your interest,`,
    `The QuranSphere Team`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Subscription emails — welcome / cancelled / payment failed
// ---------------------------------------------------------------------------
export type SubscriptionEmailPayload = {
  studentName: string;
  studentEmail: string;
  plan: "basic" | "premium";
};

export async function sendSubscriptionWelcomeEmail(
  payload: SubscriptionEmailPayload
) {
  if (!isEmailConfigured) {
    console.warn("[email] RESEND_API_KEY not set — skipping welcome email.");
    return { sent: false };
  }
  const planLabel = payload.plan === "premium" ? "Premium" : "Basic";
  const resend = getResend();
  const result = await resend.emails.send({
    from: fromAddress,
    to: payload.studentEmail,
    subject: `Welcome to LearnFurqan — Your ${planLabel} is Active!`,
    html: renderSubscriptionWelcomeEmail(payload, planLabel),
    text: renderSubscriptionWelcomeEmailText(payload, planLabel),
  });
  return { sent: !result.error };
}

export async function sendSubscriptionCancelledEmail(
  payload: Pick<SubscriptionEmailPayload, "studentName" | "studentEmail">
) {
  if (!isEmailConfigured) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping cancellation email."
    );
    return { sent: false };
  }
  const resend = getResend();
  const result = await resend.emails.send({
    from: fromAddress,
    to: payload.studentEmail,
    subject: "Your LearnFurqan Subscription has been Cancelled",
    html: renderSubscriptionCancelledEmail(payload),
    text: renderSubscriptionCancelledEmailText(payload),
  });
  return { sent: !result.error };
}

export async function sendSubscriptionPaymentFailedEmail(
  payload: Pick<SubscriptionEmailPayload, "studentName" | "studentEmail">
) {
  if (!isEmailConfigured) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping payment-failed email."
    );
    return { sent: false };
  }
  const resend = getResend();
  const result = await resend.emails.send({
    from: fromAddress,
    to: payload.studentEmail,
    subject: "Action Required — Payment Failed for LearnFurqan",
    html: renderSubscriptionPaymentFailedEmail(payload),
    text: renderSubscriptionPaymentFailedEmailText(payload),
  });
  return { sent: !result.error };
}

function renderSubscriptionWelcomeEmail(
  p: SubscriptionEmailPayload,
  planLabel: string
): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:24px;font-weight:700">Welcome to LearnFurqan</h1>
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.studentName || "")},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">JazakAllah Khair for subscribing to LearnFurqan!</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Your <strong>${escapeHtml(planLabel)} plan</strong> is now active.</p>
        <p style="margin:16px 0 8px;font-size:15px;font-weight:600">What's next:</p>
        <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7">
          <li>Browse our verified teachers</li>
          <li>Book your first class</li>
          <li>Start your Quran journey</li>
        </ul>
        <p style="margin:24px 0;text-align:center">
          <a href="https://learnfurqan.com/dashboard" style="display:inline-block;background:#0F766E;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px">Go to your dashboard</a>
        </p>
        <p style="margin:24px 0 0;font-size:15px">The LearnFurqan Team</p>
      </td></tr>
    </table>
  </div>`;
}

function renderSubscriptionWelcomeEmailText(
  p: SubscriptionEmailPayload,
  planLabel: string
): string {
  return [
    `Assalamu Alaikum ${p.studentName || ""},`,
    ``,
    `JazakAllah Khair for subscribing to LearnFurqan!`,
    ``,
    `Your ${planLabel} plan is now active.`,
    ``,
    `What's next:`,
    `- Browse our verified teachers`,
    `- Book your first class`,
    `- Start your Quran journey`,
    ``,
    `Go to your dashboard: https://learnfurqan.com/dashboard`,
    ``,
    `The LearnFurqan Team`,
  ].join("\n");
}

function renderSubscriptionCancelledEmail(
  p: Pick<SubscriptionEmailPayload, "studentName" | "studentEmail">
): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-family:Poppins,system-ui,sans-serif;color:#0F766E;font-size:22px;font-weight:700">LearnFurqan</h1>
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.studentName || "")},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Your subscription has been cancelled.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">You can resubscribe anytime at <a href="https://learnfurqan.com/pricing" style="color:#0F766E">learnfurqan.com/pricing</a>.</p>
        <p style="margin:24px 0 0;font-size:15px">We hope to see you back soon!<br/>The LearnFurqan Team</p>
      </td></tr>
    </table>
  </div>`;
}

function renderSubscriptionCancelledEmailText(
  p: Pick<SubscriptionEmailPayload, "studentName" | "studentEmail">
): string {
  return [
    `Assalamu Alaikum ${p.studentName || ""},`,
    ``,
    `Your subscription has been cancelled.`,
    `You can resubscribe anytime at learnfurqan.com/pricing`,
    ``,
    `We hope to see you back soon!`,
    `The LearnFurqan Team`,
  ].join("\n");
}

function renderSubscriptionPaymentFailedEmail(
  p: Pick<SubscriptionEmailPayload, "studentName" | "studentEmail">
): string {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#F8FAF9;padding:32px;color:#0F172A">
    <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E2E8E5">
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-family:Poppins,system-ui,sans-serif;color:#B45309;font-size:22px;font-weight:700">Action Required</h1>
        <p style="margin:0 0 16px;font-size:16px"><strong>Assalamu Alaikum ${escapeHtml(p.studentName || "")},</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Your payment failed. Please update your payment method to keep your LearnFurqan subscription active.</p>
        <p style="margin:24px 0;text-align:center">
          <a href="https://learnfurqan.com/pricing" style="display:inline-block;background:#0F766E;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px">Update payment method</a>
        </p>
        <p style="margin:24px 0 0;font-size:15px">The LearnFurqan Team</p>
      </td></tr>
    </table>
  </div>`;
}

function renderSubscriptionPaymentFailedEmailText(
  p: Pick<SubscriptionEmailPayload, "studentName" | "studentEmail">
): string {
  return [
    `Assalamu Alaikum ${p.studentName || ""},`,
    ``,
    `Your payment failed. Please update your payment method:`,
    `https://learnfurqan.com/pricing`,
    ``,
    `The LearnFurqan Team`,
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
