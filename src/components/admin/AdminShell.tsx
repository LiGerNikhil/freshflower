"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  PanelLeft,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/components/providers/AdminAuthContext";
import {
  ADMIN_ROLE_LABELS,
  sectionGroups,
} from "@/lib/admin/navigation";

const COLLAPSE_STORAGE_KEY = "ff-admin-sidebar-collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAdminAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        collapsed ? "1" : "0",
      );
    } catch {
      /* noop */
    }
  }, [collapsed]);

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const groups = sectionGroups(role);

  const SidebarNav = (
    <nav
      className={`flex h-full flex-col gap-1 overflow-y-auto ${
        collapsed ? "px-2" : "px-3"
      }`}
    >
      {groups.map(({ group, sections }) => (
        <div key={group} className="mb-3 last:mb-0">
          {!collapsed && (
            <p
              className={`px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory/35 ${
                collapsed ? "sr-only" : ""
              }`}
            >
              {group}
            </p>
          )}
          <div className="grid gap-0.5">
            {sections.map((section) => {
              const active =
                section.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(section.href);
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  title={collapsed ? section.label : undefined}
                  aria-label={collapsed ? section.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    collapsed ? "justify-center" : ""
                  } ${
                    active
                      ? "bg-gold/15 font-semibold text-gold"
                      : "text-ivory/60 hover:bg-white/5 hover:text-ivory"
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {!collapsed && <span>{section.label}</span>}
                  {active && !collapsed && (
                    <span className="absolute right-0 h-5 w-1 rounded-l-full bg-gold" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Sidebar =
    <div className="flex h-16 shrink-0 items-center justify-center border-b border-ivory/10 px-4">
      <Link href="/admin" className="flex items-center gap-0.5 font-display text-lg">
        freshflower
        <span className="block h-2 w-2 rounded-full bg-gold" />
        <span className="text-gold">admin</span>
      </Link>
    </div>;

  return (
    <div className="min-h-screen bg-ivory-deep text-ink">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-ink transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {Sidebar}
        <div className="flex-1 overflow-hidden">{SidebarNav}</div>
        {user && (
          <div
            className={`flex items-center gap-3 border-t border-ivory/10 px-3 py-3 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ivory">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-gold">
                  {ADMIN_ROLE_LABELS[user.role]}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="rounded-lg p-2 text-ivory/60 transition hover:bg-white/10 hover:text-ivory"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center gap-2 border-t border-ivory/10 py-2.5 text-xs text-ivory/50 transition hover:text-ivory"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && "Collapse"}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink">
            <div className="flex h-16 items-center justify-between border-b border-ivory/10 px-4">
              <Link href="/admin" className="font-display text-lg">
                freshflower<span className="text-gold">.admin</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-ivory/70 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">{SidebarNav}</div>
            {user && (
              <div className="flex items-center gap-3 border-t border-ivory/10 p-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ivory">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-gold">
                    {ADMIN_ROLE_LABELS[user.role]}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Log out"
                  className="rounded-lg p-2 text-ivory/60 hover:bg-white/10 hover:text-ivory"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div
        className={`transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-ink/10 bg-ivory/85 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label="Toggle sidebar"
              className="hidden rounded-lg p-2 text-ink-soft hover:bg-ink/5 lg:inline-flex"
            >
              <PanelLeft size={18} />
            </button>
            <span className="rounded-md bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
              Preview only
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink md:inline-flex"
            >
              <ExternalLink size={13} /> View site
            </Link>
            {user && (
              <>
                <div className="hidden items-center gap-2.5 md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage font-display text-sm text-sage-ink">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-[11px] text-gold">
                      {ADMIN_ROLE_LABELS[user.role]}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-gold"
                >
                  <LogOut size={13} /> Logout
                </button>
              </>
            )}
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}