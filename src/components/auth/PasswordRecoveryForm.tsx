"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function PasswordRecoveryForm() {
  const searchParams = useSearchParams();
  const accountType = searchParams.get("type") === "admin" ? "admin" : "customer";
  const loginHref = accountType === "admin" ? "/admin/login" : "/login";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accountType }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "We couldn't process your request.");
      }
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't process your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-ivory px-4 py-10 sm:px-6 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-ink/5 backdrop-blur md:p-9">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          {sent ? <CheckCircle2 size={26} /> : <Mail size={25} />}
        </div>
        {sent ? (
          <>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Check your inbox
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              Reset link requested
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              If an account matches that email, a secure password reset link
              will arrive shortly. Check your spam folder too. The link expires
              after 30 minutes.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-5 min-h-11 text-sm font-semibold text-sage-ink underline-offset-4 hover:text-ink hover:underline"
            >
              Try a different email
            </button>
          </>
        ) : (
          <>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              {accountType === "admin" ? "Administrator access" : "Customer account"}
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              Forgot your password?
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              Enter your account email and we&apos;ll send a secure link to
              choose a new password.
            </p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <label
                htmlFor="recovery-email"
                className="block text-sm font-semibold text-ink"
              >
                Email address
                <span className="mt-2 flex min-h-12 items-center rounded-xl border border-ink/10 bg-ivory/70 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15">
                  <Mail
                    size={17}
                    className="ml-3 shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none"
                  />
                </span>
              </label>
              {error && (
                <p role="alert" className="rounded-xl bg-blush p-3 text-sm text-ink">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory transition hover:bg-ink-soft disabled:cursor-wait disabled:opacity-65"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending secure link…
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        )}
        <Link
          href={loginHref}
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to {accountType === "admin" ? "admin sign in" : "sign in"}
        </Link>
      </section>
    </main>
  );
}
