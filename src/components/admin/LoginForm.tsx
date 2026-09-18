"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/components/providers/AdminAuthContext";

export function LoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    // Simulate a network round-trip before resolving the dummy session.
    await new Promise((resolve) => setTimeout(resolve, 450));
    const result = login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-xl shadow-ink/5">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          FreshFlower.zone
        </p>
        <h1 className="mt-2 font-display text-3xl">Admin access</h1>
        <div className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-[11px] font-semibold text-ink-soft">
          <ShieldAlert size={13} className="text-gold" />
          Client-side auth only
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="yourname@email.com"
            className="w-full rounded-lg border border-ink/10 bg-ivory px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-gold"
          />
        </div>
        <div>
          <label
            htmlFor="admin-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-ink/10 bg-ivory px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-gold"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-blush px-3 py-2 text-xs font-medium text-ink"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory/30 border-t-ivory" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn size={15} /> Sign in
            </>
          )}
        </button>
      </form>
    </div>
  );
}