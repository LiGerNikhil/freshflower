"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Menu,
  Package,
  Star,
  UserRound,
  X,
} from "lucide-react";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/change-password", label: "Password", icon: LockKeyhole },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/reviews", label: "Reviews", icon: Star },
];
export function AccountShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const active =
    links
      .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? links[0];
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-8 flex items-start justify-between gap-4 md:mb-10">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
              {eyebrow ?? "Customer dashboard"}
            </p>
            <h1 className="text-5xl md:text-6xl">{title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="glass-deep inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold lg:hidden"
          >
            <Menu size={16} /> {active.label}
          </button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav className="glass-deep sticky top-24 hidden h-fit rounded-2xl p-2 shadow-sm lg:block lg:space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                  className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active.href === href ? "bg-ink text-ivory shadow-md" : "text-ink-soft hover:bg-white/70 hover:text-ink"}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div>{children}</div>
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close account menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-white/60 bg-ivory/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-ink">
                  Account menu
                </p>
                <p className="mt-1 font-display text-2xl">{active.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-white/70 p-2"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${active.href === href ? "bg-ink text-ivory" : "bg-white/65 text-ink-soft"}`}
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </main>
  );
}
