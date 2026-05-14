"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { cn } from "@/lib/utils";
import type { Message, MessageSender } from "@/lib/types";

type Props = {
  // Base endpoint that responds to GET (thread) and POST (send).
  endpoint: string;
  viewerRole: MessageSender;
  headerTitle: string;
  headerSubtitle?: string;
  // Where to go when the user taps "back" on mobile.
  backHref: string;
};

const POLL_INTERVAL_MS = 5000;

export function ThreadView({
  endpoint,
  viewerRole,
  headerTitle,
  headerSubtitle,
  backHref,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastTs = useMemo(() => {
    return messages.length > 0
      ? messages[messages.length - 1].created_at
      : null;
  }, [messages]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not load messages");
      setMessages((data.messages ?? []) as Message[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const pollNew = useCallback(async () => {
    if (!lastTs) return;
    try {
      const sep = endpoint.includes("?") ? "&" : "?";
      const url = `${endpoint}${sep}after=${encodeURIComponent(lastTs)}&skip_read=1`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const incoming = (data.messages ?? []) as Message[];
      if (incoming.length === 0) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const fresh = incoming.filter((m) => !seen.has(m.id));
        if (fresh.length === 0) return prev;
        return [...prev, ...fresh];
      });
      // If we received messages from the OTHER side, refresh once with a
      // mark-read fetch so unread badges in the nav can update.
      const fromOther = incoming.some((m) => m.sender_role !== viewerRole);
      if (fromOther) {
        fetch(endpoint).catch(() => undefined);
        router.refresh();
      }
    } catch {
      // Polling is best-effort; transient failures shouldn't surface to user.
    }
  }, [endpoint, lastTs, router, viewerRole]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const id = setInterval(pollNew, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pollNew]);

  // Keep the view scrolled to the latest message as new ones arrive.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not send");
      setMessages((prev) => [...prev, data.message as Message]);
      setDraft("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <a
          href={backHref}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold text-foreground">
            {headerTitle}
          </p>
          {headerSubtitle && (
            <p className="truncate text-xs text-muted-foreground">
              {headerSubtitle}
            </p>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-muted/20 px-4 py-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Say Assalamu Alaikum!
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} mine={m.sender_role === viewerRole} />
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={onSend}
        className="flex items-end gap-2 border-t border-border bg-white px-4 py-3"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e as unknown as React.FormEvent);
            }
          }}
          rows={1}
          maxLength={5000}
          placeholder="Type a message…"
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-white hover:bg-primary-700 disabled:opacity-50"
          aria-label="Send"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-soft",
          mine
            ? "bg-primary text-white"
            : "bg-white text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            mine ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {formatTimestamp(message.created_at)}
        </p>
      </div>
    </li>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const isToday = new Date().toDateString() === d.toDateString();
    return new Intl.DateTimeFormat([], {
      hour: "numeric",
      minute: "2-digit",
      ...(isToday ? {} : { month: "short", day: "numeric" }),
    }).format(d);
  } catch {
    return "";
  }
}
