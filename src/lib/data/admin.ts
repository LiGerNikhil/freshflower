import { AdminRole, type AdminUser } from "@/lib/types";

export const adminUsers: AdminUser[] = [
  {
    id: "admin-6",
    name: "Ayush Parmar",
    email: "ayush.parmar@freshflower.zone",
    role: AdminRole.SuperAdmin,
    active: true,
    createdAt: "2026-09-10T09:00:00.000Z",
  },
];

export const adminPasswords: Record<string, string> = {
  "ayush.parmar@freshflower.zone": "ayush@2026",
};