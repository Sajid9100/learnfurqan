import {
  createServerSupabaseClient,
  isSupabaseAdminConfigured,
} from "./supabase";
import type {
  Message,
  MessageSender,
  MessageThreadSummary,
} from "./types";

export const MESSAGE_MAX_LEN = 5000;

// True when this teacher and student share a non-cancelled booking. Both sides
// of every conversation must have at least one such booking — students can't
// cold-DM a teacher and teachers can't reach out to non-students.
export async function teacherAndStudentShareBooking(
  teacherId: string,
  studentEmail: string
): Promise<boolean> {
  if (!isSupabaseAdminConfigured) return false;
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("bookings")
    .select("id")
    .eq("teacher_id", teacherId)
    .ilike("student_email", studentEmail)
    .neq("status", "cancelled")
    .limit(1);
  if (error) {
    console.warn("[messages] booking check failed:", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

// Returns a thread (oldest -> newest). When `after` is supplied, only messages
// created strictly after that timestamp are returned — used by the client
// poller to incrementally append rather than re-render.
export async function getThread(args: {
  teacherId: string;
  studentEmail: string;
  after?: string;
}): Promise<Message[]> {
  if (!isSupabaseAdminConfigured) return [];
  const admin = createServerSupabaseClient();
  let q = admin
    .from("messages")
    .select("*")
    .eq("teacher_id", args.teacherId)
    .ilike("student_email", args.studentEmail)
    .order("created_at", { ascending: true });
  if (args.after) q = q.gt("created_at", args.after);
  const { data, error } = await q;
  if (error) {
    console.warn("[messages] getThread failed:", error.message);
    return [];
  }
  return (data ?? []) as Message[];
}

// Best-effort: look up the student's display name from their most recent
// booking with this teacher. Used when the teacher sends a message and we need
// to denormalize the name onto the messages row.
export async function lookupStudentNameForThread(
  teacherId: string,
  studentEmail: string
): Promise<string> {
  if (!isSupabaseAdminConfigured) return "";
  const admin = createServerSupabaseClient();
  const { data } = await admin
    .from("bookings")
    .select("student_name")
    .eq("teacher_id", teacherId)
    .ilike("student_email", studentEmail)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as { student_name?: string } | undefined)?.student_name ?? "";
}

export async function insertMessage(args: {
  teacherId: string;
  studentEmail: string;
  studentName: string;
  senderRole: MessageSender;
  body: string;
}): Promise<Message> {
  if (!isSupabaseAdminConfigured) {
    throw new Error("Supabase service role is not configured.");
  }
  const admin = createServerSupabaseClient();
  const { data, error } = await admin
    .from("messages")
    .insert({
      teacher_id: args.teacherId,
      student_email: args.studentEmail.toLowerCase(),
      student_name: args.studentName,
      sender_role: args.senderRole,
      body: args.body,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Message;
}

// Mark every incoming message in a thread as read for the given viewer role.
// `viewerRole` is the side that's *viewing* — we flip the unread flag on rows
// sent by the OTHER side.
export async function markThreadRead(args: {
  teacherId: string;
  studentEmail: string;
  viewerRole: MessageSender;
}): Promise<void> {
  if (!isSupabaseAdminConfigured) return;
  const otherSide: MessageSender =
    args.viewerRole === "teacher" ? "student" : "teacher";
  const admin = createServerSupabaseClient();
  const { error } = await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("teacher_id", args.teacherId)
    .ilike("student_email", args.studentEmail)
    .eq("sender_role", otherSide)
    .is("read_at", null);
  if (error) console.warn("[messages] markThreadRead failed:", error.message);
}

// Aggregate threads for one teacher: one summary per unique student email,
// with the latest message and a count of student-originated unread.
export async function listTeacherThreads(
  teacherId: string,
  teacherName: string,
  teacherSlug: string
): Promise<MessageThreadSummary[]> {
  if (!isSupabaseAdminConfigured) return [];
  const admin = createServerSupabaseClient();
  // Pull everything for this teacher; aggregating in memory keeps the SQL
  // portable and is fine for our message volume.
  const { data, error } = await admin
    .from("messages")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[messages] listTeacherThreads failed:", error.message);
    return [];
  }
  return aggregateThreads({
    rows: (data ?? []) as Message[],
    groupBy: (m) => m.student_email.toLowerCase(),
    countUnreadFrom: "student",
    enrichWithTeacher: () => ({ teacher_name: teacherName, teacher_slug: teacherSlug }),
  });
}

// Aggregate threads for one student email: one summary per unique teacher,
// enriched with that teacher's display name + slug for routing.
export async function listStudentThreads(
  studentEmails: string[]
): Promise<MessageThreadSummary[]> {
  if (!isSupabaseAdminConfigured) return [];
  const unique = Array.from(
    new Set(studentEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  if (unique.length === 0) return [];

  const admin = createServerSupabaseClient();
  const { data: rows, error } = await admin
    .from("messages")
    .select("*")
    .in("student_email", unique)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[messages] listStudentThreads failed:", error.message);
    return [];
  }
  const msgs = (rows ?? []) as Message[];
  if (msgs.length === 0) return [];

  const teacherIds = Array.from(new Set(msgs.map((m) => m.teacher_id)));
  const { data: teachers } = await admin
    .from("teachers")
    .select("id, name, slug")
    .in("id", teacherIds);
  const byId = new Map<string, { name: string; slug: string }>();
  for (const t of (teachers ?? []) as {
    id: string;
    name: string;
    slug: string;
  }[]) {
    byId.set(t.id, { name: t.name, slug: t.slug });
  }

  return aggregateThreads({
    rows: msgs,
    groupBy: (m) => m.teacher_id,
    countUnreadFrom: "teacher",
    enrichWithTeacher: (m) => ({
      teacher_name: byId.get(m.teacher_id)?.name ?? "Teacher",
      teacher_slug: byId.get(m.teacher_id)?.slug ?? "",
    }),
  });
}

function aggregateThreads(args: {
  rows: Message[];
  groupBy: (m: Message) => string;
  countUnreadFrom: MessageSender;
  enrichWithTeacher: (m: Message) => { teacher_name: string; teacher_slug: string };
}): MessageThreadSummary[] {
  // Rows are sorted newest-first; first occurrence of each group is its last
  // message. Walk once and tally unread on the way.
  const seen = new Map<
    string,
    { last: Message; unread: number; latestName: string }
  >();
  for (const m of args.rows) {
    const key = args.groupBy(m);
    const entry = seen.get(key);
    const isUnread =
      m.sender_role === args.countUnreadFrom && m.read_at === null;
    if (!entry) {
      seen.set(key, {
        last: m,
        unread: isUnread ? 1 : 0,
        latestName: m.student_name || "",
      });
    } else {
      if (isUnread) entry.unread += 1;
      if (!entry.latestName && m.student_name) entry.latestName = m.student_name;
    }
  }
  const out: MessageThreadSummary[] = [];
  for (const { last, unread, latestName } of seen.values()) {
    const tinfo = args.enrichWithTeacher(last);
    out.push({
      teacher_id: last.teacher_id,
      teacher_name: tinfo.teacher_name,
      teacher_slug: tinfo.teacher_slug,
      student_email: last.student_email,
      student_name: latestName || last.student_email,
      last_message: last,
      unread_count: unread,
    });
  }
  return out.sort(
    (a, b) =>
      new Date(b.last_message.created_at).getTime() -
      new Date(a.last_message.created_at).getTime()
  );
}
