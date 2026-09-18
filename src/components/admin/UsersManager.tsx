"use client";

import { useMemo, useState } from "react";
import {
  Check,
  KeyRound,
  Search,
  UserCog,
  Users,
} from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { useAdminAuth } from "@/components/providers/AdminAuthContext";
import { passwordFor } from "@/lib/admin/phase16";
import { type AdminUser } from "@/lib/types";

export function UsersManager() {
  const {
    users,
    userPasswords,
    setUserPassword,
    updateUser,
  } = useSiteContent();
  const { user: currentUser } = useAdminAuth();

  const [query, setQuery] = useState("");
  const [editingPasswordFor, setEditingPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [saved, setSaved] = useState(false);

  const adminUser = users[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleSavePassword = () => {
    if (!newPassword.trim()) {
      setPasswordError("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setUserPassword(adminUser.email, newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setEditingPasswordFor(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <UserCog size={13} /> Admin Account
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Admin settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Only one admin account is configured. Sign-in is locked to
            {adminUser.email}. Change your password below.
          </p>
        </div>
      </div>

      {saved && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-sage px-3 py-2 text-sm text-sage-ink">
          <Check size={14} /> Password updated.
        </p>
      )}

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email…"
            aria-label="Search admin users"
            className="w-full rounded-md border border-ink/10 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-deep/60 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isEditingPassword={editingPasswordFor === user.id}
                  onStartPasswordEdit={() => {
                    setEditingPasswordFor(user.id);
                  }}
                  onCancelPasswordEdit={() => setEditingPasswordFor(null)}
                  onToggleActive={() => {
                    if (user.id === currentUser?.id) return;
                    updateUser(user.id, { active: !user.active });
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-sm text-ink-soft">
                    <Users size={20} className="mx-auto mb-2 text-ink-soft/50" />
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingPasswordFor && (
        <div className="mt-6 rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl">Change password</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          {passwordError && (
            <p className="mt-2 text-xs text-red-600">{passwordError}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSavePassword}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
            >
              <Check size={15} /> Save password
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingPasswordFor(null);
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
              className="rounded-md border border-ink/10 px-4 py-2 text-sm text-ink-soft transition hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  isEditingPassword,
  onStartPasswordEdit,
  onCancelPasswordEdit,
  onToggleActive,
}: {
  user: AdminUser;
  isEditingPassword: boolean;
  onStartPasswordEdit: () => void;
  onCancelPasswordEdit: () => void;
  onToggleActive: () => void;
}) {
  const isActive = user.active;
  const isSelf = user.id === useAdminAuth().user?.id;
  return (
    <>
      <tr className="border-b border-ink/5 last:border-0 hover:bg-ivory-deep/30">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-xs font-bold text-sage-ink">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-ink">
                {user.name}
                {isSelf && (
                  <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                    You
                  </span>
                )}
              </p>
              <p className="text-xs text-ink-soft">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs font-semibold text-gold">Super Admin</span>
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            role="switch"
            aria-checked={user.active}
            aria-label={`${user.active ? "Deactivate" : "Activate"} ${user.name}`}
            onClick={onToggleActive}
            disabled={isSelf}
            className={`flex h-6 w-11 items-center rounded-full px-1 transition disabled:opacity-40 ${
              isActive ? "bg-sage" : "bg-ink/20"
            }`}
          >
            <span
              className={`h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
                isActive ? "translate-x-5" : ""
              }`}
            />
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onStartPasswordEdit}
              aria-label={`Change password for ${user.name}`}
              className="rounded-md p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            >
              <KeyRound size={16} />
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
