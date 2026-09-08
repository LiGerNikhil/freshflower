import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "sage" | "gold" | "blush" | "lavender" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneStyles: Record<Tone, string> = {
  sage: "bg-sage text-sage-ink",
  gold: "bg-gold-soft/40 text-ink",
  blush: "bg-blush text-ink",
  lavender: "bg-lavender text-lavender-ink",
  neutral: "bg-ink/5 text-ink-soft",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-3 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
