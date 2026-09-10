"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { telHref } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Shop", href: "/flowers" },
  { label: "Bouquets", href: "/bouquets" },
  { label: "Occasions", href: "/occasions" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Wedding & Events", href: "/wedding-events" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function SiteNav() {
  const { itemCount } = useCart();
  const { settings } = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-5 py-3 md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/60 bg-ivory/80 px-5 py-3 shadow-sm backdrop-blur-xl">
        <Link href="/" className="font-display text-2xl text-ink">
          freshflower<span className="text-gold">.zone</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-ink-soft lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref(settings.phoneNumber)}
            className="hidden items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-2 text-xs font-semibold text-ink transition hover:border-gold md:inline-flex"
          >
            <Phone size={14} className="text-gold" /> {settings.phoneNumber}
          </a>
          <Link
            href="/cart"
            aria-label="Open cart"
            className="relative rounded-full p-2 text-ink transition hover:bg-white/60"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold leading-none text-ivory">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="rounded-full p-2 text-ink transition hover:bg-white/60 lg:hidden"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-2xl bg-ivory/95 p-5 shadow-lg lg:hidden">
          <nav className="grid gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 transition hover:bg-white/70"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 transition hover:bg-white/70"
            >
              FAQ
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 transition hover:bg-white/70"
            >
              Reviews
            </Link>
            <Link
              href="/delivery"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-ink px-3 py-2.5 font-semibold text-ivory transition hover:bg-ink-soft"
            >
              Delivery info
            </Link>
            <div className="mt-2 border-t border-ink/10 pt-2">
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                Local delivery
              </p>
              <div className="grid gap-1">
                {[
                  { label: "Delhi", href: "/flower-delivery-delhi" },
                  { label: "Gurgaon", href: "/flower-delivery-gurgaon" },
                  { label: "Noida", href: "/flower-delivery-noida" },
                  { label: "Birthday flowers", href: "/birthday-flowers" },
                  { label: "Anniversary flowers", href: "/anniversary-flowers" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-ink-soft transition hover:bg-white/70 hover:text-ink"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
