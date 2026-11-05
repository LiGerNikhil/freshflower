"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const accountType = searchParams.get("type") === "admin" ? "admin" : "customer";
  const loginHref = accountType === "admin" ? "/admin/login" : "/login";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, token, password }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "We couldn't reset your password.");
      }
      setComplete(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't reset your password. Request a new link and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-ivory px-4 py-10 sm:px-6 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-ink/5 backdrop-blur md:p-9">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          {complete ? <CheckCircle2 size={26} /> : <KeyRound size={25} />}
        </div>
        {complete ? (
          <>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              Password updated
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              You&apos;re all set.
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              Your new password is ready. Sign in with it to continue.
            </p>
            <Link
              href={loginHref}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ivory transition hover:bg-ink-soft"
            >
              Continue to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
              {accountType === "admin" ? "Administrator access" : "Customer account"}
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">
              Create a new password
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              Use at least 8 characters. This secure link can only be used
              once.
            </p>
            {token ? (
              <form onSubmit={submit} className="mt-7 space-y-4">
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold text-ink"
                >
                  New password
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 min-h-12 w-full rounded-xl border border-ink/10 bg-ivory/70 px-4 py-3 text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
                  />
                </label>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold text-ink"
                >
                  Confirm new password
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-2 min-h-12 w-full rounded-xl border border-ink/10 bg-ivory/70 px-4 py-3 text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
                  />
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
                      Updating password…
                    </>
                  ) : (
                    "Save new password"
                  )}
                </button>
              </form>
            ) : (
              <div className="mt-7 rounded-xl bg-blush/70 p-4 text-sm leading-6 text-ink">
                This reset link is incomplete. Request a new password reset
                link to continue.
              </div>
            )}
          </>
        )}
        {!complete && (
          <Link
            href={loginHref}
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to sign in
          </Link>
        )}
      </section>
    </main>
  );
}
