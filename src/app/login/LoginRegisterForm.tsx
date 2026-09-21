"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, MailCheck, Phone, UserRound } from "lucide-react";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";
import { Button } from "@/components/ui/Button";

type Mode = "login" | "register";

export default function LoginRegisterForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyPopup, setVerifyPopup] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useCustomerAuth();
  const returnUrl = searchParams.get("returnUrl") || "/account";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          }
        : {
            name: String(form.get("name") ?? ""),
            phone: String(form.get("phone") ?? ""),
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          };
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    setSubmitting(false);
    if (!response.ok) {
      setError(body?.error ?? "Could not sign you in. Please try again.");
      return;
    }
    if (mode === "register") {
      await refresh();
      const email = String(form.get("email") ?? "");
      setVerifyPopup(email);
      return;
    }
    void refresh();
    router.push("/cart");
  }

  return (
    <main className="bg-ivory py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-[0.9fr_1.1fr] md:px-6">
        <section className="glass-deep rounded-3xl p-6 shadow-xl md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
            Customer account
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            Sign in before saving flowers or placing orders.
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            Your cart, wishlist, checkout, and order history are connected to your FreshFlower.zone account.
          </p>
          <div className="mt-6 rounded-2xl bg-white/60 p-4 text-sm text-ink-soft">
            After a successful login, we&apos;ll take you straight to your
            <span className="font-semibold text-ink"> cart</span> so you can
            continue where you left off.
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur md:p-7">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-ivory-deep p-1">
            {(["login", "register"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError(null);
                }}
                className={`rounded-xl px-4 py-3 text-sm font-bold capitalize transition ${
                  mode === item ? "bg-ink text-ivory shadow" : "text-ink-soft hover:text-ink"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <label className="block text-sm font-semibold">
                  Full name
                  <span className="mt-2 flex rounded-xl border border-ink/10 bg-white focus-within:border-gold">
                    <UserRound className="ml-3 mt-3.5 text-ink-soft" size={17} />
                    <input name="name" required minLength={2} className="min-w-0 flex-1 bg-transparent p-3 outline-none" />
                  </span>
                </label>
                <label className="block text-sm font-semibold">
                  Mobile number
                  <span className="mt-2 flex rounded-xl border border-ink/10 bg-white focus-within:border-gold">
                    <Phone className="ml-3 mt-3.5 text-ink-soft" size={17} />
                    <input name="phone" required pattern="\d{10}" className="min-w-0 flex-1 bg-transparent p-3 outline-none" />
                  </span>
                </label>
              </>
            )}
            <label className="block text-sm font-semibold">
              Email
              <span className="mt-2 flex rounded-xl border border-ink/10 bg-white focus-within:border-gold">
                <Mail className="ml-3 mt-3.5 text-ink-soft" size={17} />
                <input name="email" type="email" required className="min-w-0 flex-1 bg-transparent p-3 outline-none" />
              </span>
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input name="password" type="password" required minLength={8} className="mt-2 w-full rounded-xl border border-ink/10 bg-white p-3 outline-none focus:border-gold" />
            </label>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-ink-soft">
            Back to <Link href="/flowers" className="font-semibold text-ink underline">shopping flowers</Link>
          </p>
        </section>
      </div>
      {verifyPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-ivory/95 p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage">
              <MailCheck size={30} className="text-sage-ink" />
            </div>
            <h2 className="mt-5 font-display text-3xl text-ink">Verification email sent</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              We&apos;ve sent a verification link to
              <span className="mx-1 font-semibold text-ink">{verifyPopup}</span>.
              Check your Gmail inbox (and spam folder) and click the link to verify
              your email before placing an order.
            </p>
            <div className="mt-6 rounded-2xl bg-white/70 p-4 text-left text-sm text-ink-soft">
              <p className="font-semibold text-ink">Next steps:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Open Gmail and find the verification mail.</li>
                <li>Tap the <span className="font-semibold text-ink">Verify email</span> button.</li>
                <li>Come back and use your account normally.</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => router.push(returnUrl.startsWith("/") ? returnUrl : "/account")}
              className="mt-7 w-full rounded-full bg-ink px-6 py-3 text-sm font-bold text-ivory transition hover:bg-ink-soft"
            >
              Got it, go to my account
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
