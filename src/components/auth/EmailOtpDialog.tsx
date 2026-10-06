"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MailCheck, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";

interface EmailOtpDialogProps {
  email: string;
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  initialNote?: string;
}

export default function EmailOtpDialog({
  email,
  open,
  onClose,
  onVerified,
  initialNote,
}: EmailOtpDialogProps) {
  const otpInput = useRef<HTMLInputElement>(null);
  const { refresh } = useCustomerAuth();
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(initialNote ?? null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => otpInput.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!open) return null;

  async function verify() {
    if (!/^\d{6}$/.test(otp)) {
      setStatus("error");
      setMessage("Enter the 6-digit code from your email.");
      return;
    }
    setStatus("verifying");
    setMessage(null);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.ok) {
        setStatus("success");
        setMessage("Email verified.");
        await refresh();
        setTimeout(onVerified, 450);
        return;
      }
      setStatus("error");
      setMessage(body?.error ?? "We could not verify that code. Please try again.");
      setOtp("");
      otpInput.current?.focus();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  async function resend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.ok) {
        setMessage("A fresh code was sent to your email.");
        setCooldown(60);
        setStatus("idle");
        setOtp("");
        otpInput.current?.focus();
      } else if (response.status === 429) {
        const seconds = Number(String(body?.error ?? "").match(/(\d+)s/)?.[1] ?? 60);
        setCooldown(seconds);
        setMessage(body?.error ?? "Please wait before requesting a new code.");
      } else {
        setStatus("error");
        setMessage(body?.error ?? "We could not send the code right now. Please try again shortly.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-ivory/95 p-7 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage">
          <MailCheck size={30} className="text-sage-ink" />
        </div>
        <h2 className="mt-5 font-display text-3xl text-ink">Verify your email</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          Enter the 6-digit code we emailed to
          <span className="mx-1 font-semibold text-ink">{email}</span>.
          Check Gmail (and your spam folder) for the code.
        </p>

        <div className="mt-6 rounded-2xl bg-white/70 p-4">
          <label htmlFor="email-otp" className="block text-left text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
            Verification code
          </label>
          <input
            ref={otpInput}
            id="email-otp"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(event) => {
              if (event.key === "Enter") void verify();
              if (event.key === "Escape") onClose();
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-center text-3xl font-black tracking-[0.5em] text-ink outline-none focus:border-gold"
          />
          {status === "verifying" && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-soft">
              <LoaderCircle size={16} className="animate-spin" /> Verifying…
            </p>
          )}
          {status === "success" && <p className="mt-3 text-sm font-semibold text-sage-ink">Email verified — welcome!</p>}
          {message && status !== "success" && status !== "verifying" && (
            <p className="mt-3 rounded-lg bg-blush/70 px-3 py-2 text-sm font-medium text-ink">{message}</p>
          )}
        </div>

        <Button type="button" variant="gold" className="mt-5 w-full" disabled={status === "verifying"} onClick={() => void verify()}>
          {status === "verifying" ? "Verifying…" : "Verify email"}
        </Button>

        <button
          type="button"
          disabled={resending || cooldown > 0}
          onClick={() => void resend()}
          className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:text-ink-soft disabled:opacity-40"
        >
          <RotateCcw size={15} />
          {resending ? "Sending…" : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          <X size={15} /> I&apos;ll do this later
        </button>
      </div>
    </div>
  );
}