"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  Bell,
  Star,
} from "lucide-react";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
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
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
            {eyebrow ?? "Demo customer account"}
          </p>
          <h1 className="text-5xl md:text-6xl">{title}</h1>
        </div>
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex min-w-fit items-center gap-3 rounded-md px-4 py-3 text-sm ${pathname === href ? "bg-ink text-ivory" : "text-ink-soft hover:bg-ink/5"}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
