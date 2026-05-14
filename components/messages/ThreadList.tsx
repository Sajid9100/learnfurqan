import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageThreadSummary } from "@/lib/types";

type Props = {
  threads: MessageThreadSummary[];
  // Which side is viewing — controls the label (counterpart name) and link target.
  viewerRole: "teacher" | "student";
  // /teacher/messages or /parent/messages — the active route prefix.
  basePath: string;
  // Active thread key when one is open. For teacher: lowercased student_email;
  // for student/parent: teacher_slug. Allows visual highlight.
  activeKey?: string;
  emptyMessage?: string;
};

export function ThreadList({
  threads,
  viewerRole,
  basePath,
  activeKey,
  emptyMessage,
}: Props) {
  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        <MessageSquare className="mx-auto mb-2 h-5 w-5 text-primary/60" />
        {emptyMessage ??
          "No conversations yet. Messages from your classes will show up here."}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {threads.map((t) => {
        const key =
          viewerRole === "teacher"
            ? t.student_email.toLowerCase()
            : t.teacher_slug;
        const href =
          viewerRole === "teacher"
            ? `${basePath}/${encodeURIComponent(t.student_email)}`
            : `${basePath}/${t.teacher_slug}`;
        const counterpart =
          viewerRole === "teacher" ? t.student_name || t.student_email : t.teacher_name;
        const active = activeKey && activeKey === key;
        return (
          <li key={`${t.teacher_id}-${t.student_email}`}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/40",
                active && "bg-primary/5"
              )}
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(counterpart)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-medium text-foreground">
                    {counterpart}
                  </p>
                  <span className="flex-none text-[10px] text-muted-foreground">
                    {timeAgo(t.last_message.created_at)}
                  </span>
                </div>
                <p
                  className={cn(
                    "truncate text-xs",
                    t.unread_count > 0
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {previewBody(t.last_message.body, viewerRole, t.last_message.sender_role)}
                </p>
              </div>
              {t.unread_count > 0 && (
                <span className="flex-none rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                  {t.unread_count}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "·";
}

function previewBody(
  body: string,
  viewerRole: "teacher" | "student",
  senderRole: "teacher" | "student"
): string {
  const prefix = senderRole === viewerRole ? "You: " : "";
  const trimmed = body.replace(/\s+/g, " ").trim();
  return prefix + (trimmed.length > 90 ? trimmed.slice(0, 90) + "…" : trimmed);
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat([], { month: "short", day: "numeric" }).format(d);
}
