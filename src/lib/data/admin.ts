import { AdminRole, type AdminUser } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
// Dummy admin directory for the preview-only admin shell. Real credentials will
// be hashed and stored server-side; never shipped as plain text.
export const adminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Aditi Sharma",
    email: "admin@freshflower.zone",
    role: AdminRole.SuperAdmin,
    active: true,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "admin-2",
    name: "Kabir Verma",
    email: "orders@freshflower.zone",
    role: AdminRole.OrderManager,
    active: true,
    createdAt: "2025-10-12T11:30:00.000Z",
  },
  {
    id: "admin-3",
    name: "Meera Rao",
    email: "inventory@freshflower.zone",
    role: AdminRole.InventoryManager,
    active: true,
    createdAt: "2025-11-03T08:20:00.000Z",
  },
  {
    id: "admin-4",
    name: "Rahul Menon",
    email: "content@freshflower.zone",
    role: AdminRole.ContentManager,
    active: true,
    createdAt: "2025-11-18T10:40:00.000Z",
  },
  {
    id: "admin-5",
    name: "Sana Khan",
    email: "support@freshflower.zone",
    role: AdminRole.SupportManager,
    active: true,
    createdAt: "2026-01-05T14:10:00.000Z",
  },
  {
    id: "admin-6",
    name: "Ayush Parmar",
    email: "ayush.parmar@freshflower.zone",
    role: AdminRole.SuperAdmin,
    active: true,
    createdAt: "2026-09-10T09:00:00.000Z",
  },
];

// Plain-text passwords are PREVIEW-ONLY. TODO Phase 13: real authentication
// (e.g. NextAuth / server-side session) with hashed credentials.
export const adminPasswords: Record<string, string> = {
  "ayush.parmar@freshflower.zone": "ayush@2026",
};