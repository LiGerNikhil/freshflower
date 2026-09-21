"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, LockKeyhole, Menu, Package, ShoppingBag, UserRound, X } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { useCustomerAuth } from "@/components/providers/CustomerAuthContext";

const NAV_LINKS = [
  { label: "Shop", href: "/flowers" },
  { label: "Bouquets", href: "/bouquets" },
  // Hidden from the main navbar for now; routes remain available directly.
  // { label: "Occasions", href: "/occasions" },
  // { label: "Wholesale", href: "/wholesale" },
  // { label: "Wedding & Events", href: "/wedding-events" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const ACCOUNT_LINKS = [
  { label: "Dashboard", href: "/account", icon: UserRound },
  { label: "Profile", href: "/account/profile", icon: UserRound },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Password", href: "/account/change-password", icon: LockKeyhole },
];

export function SiteNav() {
  const { itemCount } = useCart();
  const { user } = useCustomerAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-5 py-3 md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/60 bg-ivory/80 px-5 py-3 shadow-sm backdrop-blur-xl">
        <Link href="/" aria-label="FreshFlower.zone home" className="block shrink-0">
          <Image
            src="/assets/images/logo.png"
            alt="FreshFlower.zone"
            width={224}
            height={56}
            priority
            className="h-11 w-auto md:h-14"
          />
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
          <Link
            href="/account"
            aria-label="Open customer dashboard"
            className="hidden items-center gap-2 rounded-full border border-gold/35 bg-white/70 px-4 py-2 text-xs font-bold text-ink transition hover:border-gold hover:bg-white md:inline-flex"
          >
            <UserRound size={15} className="text-gold" />
            {user ? "My Profile" : "Login"}
          </Link>
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
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mb-2 flex items-center justify-between rounded-2xl border border-gold/30 bg-white/75 px-4 py-3 shadow-sm"
            >
              <span className="inline-flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <UserRound size={18} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">
                    {user ? "My Dashboard" : "Login / Register"}
                  </span>
                  <span className="text-xs text-ink-soft">
                    Profile, orders and wishlist
                  </span>
                </span>
              </span>
              <span className="text-xs font-bold text-gold">Open</span>
            </Link>
            <div className="mb-3 rounded-2xl bg-white/55 p-2">
              <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                Account pages
              </p>
              <div className="grid grid-cols-2 gap-1">
                {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft transition hover:bg-ivory hover:text-ink"
                  >
                    <Icon size={14} /> {label}
                  </Link>
                ))}
              </div>
            </div>
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
