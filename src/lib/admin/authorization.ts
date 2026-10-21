import { getAdminSession, ADMIN_EMAIL } from "@/lib/admin/session";
import { getAdminUserByEmail } from "@/lib/db/repositories";
import { adminUsers } from "@/lib/data/admin";
import { AdminRole, type AdminUser } from "@/lib/types";
import { ApiError } from "@/lib/api/helpers";

export async function getRequestAdmin(request: Request): Promise<AdminUser | null> {
  const session = await getAdminSession(request);
  if (!session) return null;
  // Preserve the existing bootstrap identity only when no persisted user exists.
  // Database failures do not fall back to super-admin privileges.
  const stored = await getAdminUserByEmail(session.email);
  const user = stored ?? (session.email === ADMIN_EMAIL ? adminUsers[0] : null);
  return user?.active ? user : null;
}

export async function requireAdminRole(request: Request, roles: readonly AdminRole[]): Promise<AdminUser> {
  const user = await getRequestAdmin(request);
  if (!user) throw new ApiError("Unauthorized.", 401);
  if (user.role !== AdminRole.SuperAdmin && !roles.includes(user.role)) {
    throw new ApiError("You do not have permission to manage this resource.", 403);
  }
  return user;
}

export const CATALOG_READ_ROLES = [AdminRole.InventoryManager, AdminRole.ContentManager, AdminRole.OrderManager, AdminRole.SupportManager];
export const CATALOG_WRITE_ROLES = [AdminRole.InventoryManager];
export const CONTENT_WRITE_ROLES = [AdminRole.ContentManager];
