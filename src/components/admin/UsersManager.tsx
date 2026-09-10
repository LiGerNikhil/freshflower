"use client";

import { useMemo, useState } from "react";
import {
  Check,
  KeyRound,
  Plus,
  Search,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { useAdminAuth } from "@/components/providers/AdminAuthContext";
import { ADMIN_ROLE_LABELS, ALL_NON_SUPER_ADMIN_ROLES } from "@/lib/admin/navigation";
import { passwordFor } from "@/lib/admin/phase16";
import { AdminRole, type AdminUser } from "@/lib/types";

const ROLE_OPTIONS: AdminRole[] = [
  AdminRole.SuperAdmin,
  ...ALL_NON_SUPER_ADMIN_ROLES,
];

function roleLabel(role: AdminRole): string {
  return ADMIN_ROLE_LABELS[role] ?? role;
}

export function UsersManager() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    userPasswords,
    setUserPassword,
  } = useSiteContent();
  const { user: currentUser } = useAdminAuth();

  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingPasswordFor, setEditingPasswordFor] = useState<string | null>(null);
  const [passwordDraft, setPasswordDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: AdminRole.ContentManager as AdminRole,
    password: "demo123",
    active: true,
  });
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const canDeactivate = (target: AdminUser) =>
    target.id !== currentUser?.id && !(target.role === AdminRole.SuperAdmin && activeSuperAdminCount(users) === 1);

  const handleCreate = () => {
    const email = form.email.trim().toLowerCase();
    if (!form.name.trim() || !email) {
      setFormError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === email)) {
      setFormError("A user with this email already exists.");
      return;
    }
    const next: AdminUser = {
      id: `admin-${Date.now().toString(36)}`,
      name: form.name.trim(),
      email,
      role: form.role,
      active: form.active,
      createdAt: new Date().toISOString(),
    };
    addUser(next);
    setUserPassword(email, form.password || "demo123");
    setShowAdd(false);
    setForm({ name: "", email: "", role: AdminRole.ContentManager, password: "demo123", active: true });
    setFormError("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <UserCog size={13} /> Users & Roles
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Admin users</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {users.length} users · role changes apply on the user&apos;s next
            sign-in · the sidebar shows only sections a role can access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          {showAdd ? <Check size={15} /> : <Plus size={15} />}
          {showAdd ? "Close form" : "Add user"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl">New admin user</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                placeholder="Ananya Verma"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                placeholder="ananya@freshflower.zone"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Role
              </label>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value as AdminRole })
                }
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Initial password
              </label>
              <input
                type="text"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
                className="h-4 w-4 accent-[#9C7B1E]"
              />
              Active (can sign in)
            </label>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
          >
            <Plus size={15} /> Create user
          </button>
        </div>
      )}

      {saved && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-sage px-3 py-2 text-sm text-sage-ink">
          <Check size={14} /> Saved.
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
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUser?.id}
                  isPasswordEditing={editingPasswordFor === user.id}
                  password={passwordFor(user.email, userPasswords)}
                  onStartPasswordEdit={() => {
                    setEditingPasswordFor(user.id);
                    setPasswordDraft(passwordFor(user.email, userPasswords));
                  }}
                  passwordDraft={passwordDraft}
                  onPasswordDraftChange={setPasswordDraft}
                  onSavePassword={() => {
                    setUserPassword(user.email, passwordDraft || "demo123");
                    setEditingPasswordFor(null);
                  }}
                  onCancelPasswordEdit={() => setEditingPasswordFor(null)}
                  onToggleActive={() => {
                    if (!canDeactivate(user)) return;
                    updateUser(user.id, { active: !user.active });
                  }}
                  onRoleChange={(role) => updateUser(user.id, { role })}
                  onDelete={() => {
                    if (user.id === currentUser?.id) return;
                    if (
                      window.confirm(
                        `Delete ${user.name}? Their sign-in and role are removed.`,
                      )
                    ) {
                      deleteUser(user.id);
                    }
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm text-ink-soft">
                    <Users size={20} className="mx-auto mb-2 text-ink-soft/50" />
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function activeSuperAdminCount(users: AdminUser[]): number {
  return users.filter(
    (user) => user.role === AdminRole.SuperAdmin && user.active,
  ).length;
}

function UserRow({
  user,
  currentUserId,
  isPasswordEditing,
  password,
  onStartPasswordEdit,
  passwordDraft,
  onPasswordDraftChange,
  onSavePassword,
  onCancelPasswordEdit,
  onToggleActive,
  onRoleChange,
  onDelete,
}: {
  user: AdminUser;
  currentUserId?: string;
  isPasswordEditing: boolean;
  password: string;
  onStartPasswordEdit: () => void;
  passwordDraft: string;
  onPasswordDraftChange: (value: string) => void;
  onSavePassword: () => void;
  onCancelPasswordEdit: () => void;
  onToggleActive: () => void;
  onRoleChange: (role: AdminRole) => void;
  onDelete: () => void;
}) {
  const isSelf = user.id === currentUserId;
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
          <select
            value={user.role}
            disabled={isSelf}
            aria-label={`Role for ${user.name}`}
            onChange={(event) => onRoleChange(event.target.value as AdminRole)}
            className="rounded-md border border-ink/10 bg-white px-2 py-1.5 text-xs font-semibold text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none disabled:opacity-50"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          {isPasswordEditing ? (
            <div>
              <input
                type="text"
                value={passwordDraft}
                onChange={(event) => onPasswordDraftChange(event.target.value)}
                className="w-full rounded-md border border-ink/10 bg-white px-2 py-1.5 text-xs text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSavePassword}
                  className="text-xs font-bold text-sage-ink hover:underline"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onCancelPasswordEdit}
                  className="text-xs font-semibold text-ink-soft hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <span className="font-mono text-xs text-ink-soft">{password}</span>
          )}
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
              user.active ? "bg-sage" : "bg-ink/20"
            }`}
          >
            <span
              className={`h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
                user.active ? "translate-x-5" : ""
              }`}
            />
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onStartPasswordEdit}
              aria-label={`Reset password for ${user.name}`}
              className="rounded-md p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            >
              <KeyRound size={16} />
            </button>
            <button
              type="button"
              disabled={isSelf}
              onClick={onDelete}
              aria-label={`Delete ${user.name}`}
              className="rounded-md p-2 text-ink-soft transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}