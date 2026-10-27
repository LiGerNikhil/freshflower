"use client";

import { useEffect, useRef } from "react";
import { Check, Lock, Sparkles, Trophy } from "lucide-react";
import {
  formatDiscountINR,
  type TieredDiscountResult,
} from "@/lib/discounts";

function nextGap(result: TieredDiscountResult): number {
  return Math.max(0, Math.ceil(result.amountToNext));
}

function rewardHeadline(result: TieredDiscountResult): string {
  if (result.maxUnlocked) return "Maximum reward unlocked!";
  if (result.discount > 0) return `${formatDiscountINR(result.discount)} OFF unlocked!`;
  return `Unlock ${formatDiscountINR(result.nextTier?.amount ?? 0)} OFF`;
}

function rewardDetail(result: TieredDiscountResult): string {
  if (result.maxUnlocked) {
    return `Congratulations! You've unlocked the maximum ${formatDiscountINR(result.maxDiscount)} discount.`;
  }
  if (result.nextTier) {
    return `Add ${formatDiscountINR(nextGap(result))} worth more to unlock ${formatDiscountINR(result.nextTier.amount)} OFF.`;
  }
  return "Your reward is applied automatically at checkout.";
}

/**
 * Full four-checkpoint journey shown inside the cart and the Diwali summary.
 */
export function DiscountJourney({
  result,
  className = "",
}: {
  result: TieredDiscountResult;
  className?: string;
}) {
  if (!result.enabled) return null;

  const progressPercent = Math.round(result.progress * 100);

  return (
    <section
      aria-labelledby="discount-journey-heading"
      className={`rounded-2xl border border-gold/35 bg-gradient-to-br from-white via-ivory to-gold/10 p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sage-ink">
            <Sparkles size={13} aria-hidden="true" /> Reward journey
          </p>
          <h2
            id="discount-journey-heading"
            className="mt-1.5 font-display text-2xl leading-tight sm:text-[1.7rem]"
          >
            {result.maxUnlocked ? (
              <span className="inline-flex items-center gap-2">
                <Trophy size={22} className="text-gold" aria-hidden="true" />
                {rewardHeadline(result)}
              </span>
            ) : (
              rewardHeadline(result)
            )}
          </h2>
          <p className="mt-1 min-h-10 text-sm leading-5 text-ink-soft">
            {rewardDetail(result)}
          </p>
        </div>
        <div className="rounded-xl border border-gold/30 bg-white/70 px-3 py-2 text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            Cart value
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">
            {formatDiscountINR(result.eligibleSubtotal)}
          </p>
          <p className="text-[10px] text-ink-soft">
            Max {formatDiscountINR(result.maxDiscount)} off
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Reward milestone progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
        aria-valuetext={`${progressPercent}% of the reward journey complete. ${rewardDetail(result)}`}
        className="relative mt-5 h-2.5 rounded-full bg-ink/10"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progressPercent}%` }}
        />
        {result.checkpoints.map((checkpoint) => {
          const left = Math.min(
            100,
            (checkpoint.threshold / (result.checkpoints.at(-1)?.threshold || 1)) * 100,
          );
          return (
            <span
              key={checkpoint.threshold}
              aria-hidden="true"
              className={`absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                checkpoint.unlocked ? "bg-gold" : "bg-ink/25"
              }`}
              style={{ left: `${left}%` }}
            />
          );
        })}
      </div>

      <ol className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
        {result.checkpoints.map((checkpoint) => {
          const state = checkpoint.unlocked
            ? "unlocked"
            : checkpoint.active
              ? "active"
              : "locked";
          return (
            <li
              key={checkpoint.threshold}
              aria-current={checkpoint.active ? "step" : undefined}
              className={`min-w-0 rounded-lg border px-1.5 py-2 text-center transition-colors sm:px-2 ${
                state === "unlocked"
                  ? "border-sage-ink/20 bg-sage/60 text-sage-ink"
                  : state === "active"
                    ? "border-gold/60 bg-gold/15 text-ink"
                    : "border-ink/10 bg-white/55 text-ink-soft"
              }`}
            >
              <span
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full ${
                  state === "unlocked"
                    ? "bg-sage-ink text-ivory"
                    : state === "active"
                      ? "bg-gold text-ink"
                      : "bg-ink/10 text-ink-soft"
                }`}
                aria-hidden="true"
              >
                {state === "unlocked" ? (
                  <Check size={12} strokeWidth={3} />
                ) : state === "active" ? (
                  <Sparkles size={11} />
                ) : (
                  <Lock size={10} />
                )}
              </span>
              <span className="mt-1 block truncate text-[10px] font-bold tabular-nums sm:text-[11px]">
                {formatDiscountINR(checkpoint.threshold)}
              </span>
              <span className="block truncate text-[9px] leading-4 sm:text-[10px]">
                {formatDiscountINR(checkpoint.amount)} off
              </span>
              <span className="sr-only">
                {state === "unlocked"
                  ? "Unlocked"
                  : state === "active"
                    ? "Next milestone"
                    : "Locked"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Compact non-fixed summary for the checkout sidebar, Diwali sidebar and
 * order summaries.
 */
export function DiscountJourneySummary({
  result,
  tone = "light",
  className = "",
}: {
  result: TieredDiscountResult;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (!result.enabled) return null;
  const dark = tone === "dark";
  const progressPercent = Math.round(result.progress * 100);

  return (
    <div
      className={`rounded-xl border px-3.5 py-3 ${
        dark
          ? "border-ivory/15 bg-ivory/5 text-ivory"
          : "border-gold/35 bg-gold/10 text-ink"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-bold">
          {result.maxUnlocked ? (
            <Trophy size={14} className="shrink-0 text-gold" aria-hidden="true" />
          ) : (
            <Sparkles size={14} className="shrink-0 text-gold" aria-hidden="true" />
          )}
          <span className="truncate">{rewardHeadline(result)}</span>
        </p>
        <p
          className={`shrink-0 text-[10px] font-semibold tabular-nums ${
            dark ? "text-ivory/65" : "text-ink-soft"
          }`}
        >
          {result.maxUnlocked
            ? "Max reward"
            : `${formatDiscountINR(nextGap(result))} to go`}
        </p>
      </div>
      <div className={`mt-2 h-1.5 rounded-full ${dark ? "bg-ivory/15" : "bg-ink/10"}`}>
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p
        className={`mt-1.5 text-[11px] leading-4 ${
          dark ? "text-ivory/65" : "text-ink-soft"
        }`}
      >
        {rewardDetail(result)}
      </p>
    </div>
  );
}

/**
 * Fixed compact bar for phones. It sits above the mobile bottom-nav slot and
 * publishes its measured height so the cart can reserve space instead of using
 * a hard-coded offset.
 */
export function DiscountJourneyBar({ result }: { result: TieredDiscountResult }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = barRef.current;
    if (!element || !result.enabled) return;
    const root = document.documentElement;
    const previousPadding = document.body.style.paddingBottom;
    const offset =
      "var(--ff-mobile-bottom-nav-height, env(safe-area-inset-bottom, 0px))";
    const publish = () => {
      root.style.setProperty(
        "--ff-cart-journey-height",
        `${element.getBoundingClientRect().height}px`,
      );
      // Reserve the bar's real height on the document so the footer and the
      // checkout action can never end up underneath it.
      document.body.style.paddingBottom = `calc(var(--ff-cart-journey-height, 0px) + ${offset})`;
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--ff-cart-journey-height");
      document.body.style.paddingBottom = previousPadding;
    };
  }, [result.enabled]);

  if (!result.enabled) return null;
  const progressPercent = Math.round(result.progress * 100);
  const headline =
    result.discount > 0
      ? `${formatDiscountINR(result.discount)} OFF applied`
      : `Unlock ${formatDiscountINR(result.nextTier?.amount ?? 0)} OFF`;
  const detail = result.maxUnlocked
    ? "Maximum reward unlocked"
    : `Add ${formatDiscountINR(nextGap(result))} more`;

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 z-30 border-t border-gold/40 bg-ivory/95 px-4 pb-2.5 pt-2 shadow-[0_-10px_28px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md lg:hidden"
      style={{ bottom: "var(--ff-mobile-bottom-nav-height, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-xs font-bold">
            {result.maxUnlocked ? (
              <Trophy size={14} className="shrink-0 text-gold" aria-hidden="true" />
            ) : (
              <Sparkles size={14} className="shrink-0 text-gold" aria-hidden="true" />
            )}
            <span className="truncate">{headline}</span>
          </p>
          <p className="shrink-0 text-[10px] font-semibold tabular-nums text-ink-soft">
            {detail}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Reward milestone progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          className="mt-1.5 h-1.5 rounded-full bg-ink/10"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

