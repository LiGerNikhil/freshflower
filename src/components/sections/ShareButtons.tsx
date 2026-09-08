"use client";

import { useState } from "react";
import { Check, Link2, Mail, MessageCircle, X } from "lucide-react";

const SHARE_LINKS = [
  { label: "Share on WhatsApp", icon: MessageCircle, href: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}` },
  { label: "Share on X", icon: X, href: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
  { label: "Share by email", icon: Mail, href: (text: string) => `mailto:?subject=${encodeURIComponent("FreshFlower.zone article")}&body=${encodeURIComponent(text)}` },
] as const;

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copiedPrompt, setCopied] = useState(false);
  const text = `${title} — ${url}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
        Share
      </span>
      {SHARE_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href(text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="rounded-full border border-ink/10 bg-white/70 p-2.5 text-ink-soft transition hover:border-gold hover:text-ink"
        >
          <link.icon size={15} aria-hidden="true" />
        </a>
      ))}
      <button
        type="button"
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            setCopied(false);
          }
        }}
        className="rounded-full border border-ink/10 bg-white/70 p-2.5 text-ink-soft transition hover:border-gold hover:text-ink"
      >
        {copiedPrompt ? (
          <Check size={15} className="text-gold" aria-hidden="true" />
        ) : (
          <Link2 size={15} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}