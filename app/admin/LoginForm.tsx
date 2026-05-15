"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Login failed");
        setCaptchaToken(null);
        turnstileRef.current?.reset();
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="admin-email"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="••••••••"
        />
      </div>

      {SITE_KEY ? (
        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={SITE_KEY}
            options={{ theme: "light" }}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Turnstile is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={
          loading ||
          email.length === 0 ||
          password.length === 0 ||
          (SITE_KEY ? !captchaToken : false)
        }
      >
        {loading ? "Logging in…" : "Login"}
      </Button>
    </form>
  );
}
