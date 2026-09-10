import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Home,
  Inbox,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { AdminRole } from "@/lib/types";

export interface AdminSection {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles that may see this section. super_admin (implied, never listed) sees everything. */
  roles: AdminRole[];
  group: string;
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  [AdminRole.SuperAdmin]: "Super Admin",
  [AdminRole.OrderManager]: "Order Manager",
  [AdminRole.InventoryManager]: "Inventory Manager",
  [AdminRole.ContentManager]: "Content Manager",
  [AdminRole.SupportManager]: "Support Manager",
};

export const ALL_NON_SUPER_ADMIN_ROLES: AdminRole[] = [
  AdminRole.OrderManager,
  AdminRole.InventoryManager,
  AdminRole.ContentManager,
  AdminRole.SupportManager,
];

export const ADMIN_SECTIONS: AdminSection[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ALL_NON_SUPER_ADMIN_ROLES, group: "Overview" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: [AdminRole.OrderManager], group: "Overview" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, roles: [AdminRole.OrderManager], group: "Operations" },
  { label: "Delivery", href: "/admin/delivery", icon: Truck, roles: [AdminRole.OrderManager], group: "Operations" },
  { label: "Customers", href: "/admin/customers", icon: Users, roles: [AdminRole.OrderManager, AdminRole.SupportManager], group: "Operations" },
  { label: "Products", href: "/admin/products", icon: Package, roles: [AdminRole.InventoryManager], group: "Catalogue" },
  { label: "Categories", href: "/admin/categories", icon: FolderKanban, roles: [AdminRole.InventoryManager], group: "Catalogue" },
  { label: "Inventory", href: "/admin/inventory", icon: ClipboardList, roles: [AdminRole.InventoryManager], group: "Catalogue" },
  { label: "Coupons", href: "/admin/coupons", icon: Wallet, roles: [AdminRole.ContentManager, AdminRole.OrderManager], group: "Catalogue" },
  { label: "Blog / CMS", href: "/admin/blog", icon: BookOpen, roles: [AdminRole.ContentManager], group: "Content" },
  { label: "Homepage Management", href: "/admin/homepage", icon: Home, roles: [AdminRole.ContentManager], group: "Content" },
  { label: "SEO Manager", href: "/admin/seo", icon: Search, roles: [AdminRole.ContentManager], group: "Content" },
  { label: "Reviews", href: "/admin/reviews", icon: Star, roles: [AdminRole.ContentManager, AdminRole.SupportManager], group: "Content" },
  { label: "Enquiries", href: "/admin/enquiries", icon: Inbox, roles: [AdminRole.SupportManager], group: "Content" },
  { label: "Users & Roles", href: "/admin/users", icon: UserCog, roles: [], group: "Admin" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, roles: [], group: "Admin" },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: [], group: "Admin" },
];

/** super_admin sees everything; every other role sees only its listed sections. */
export function visibleSections(role: AdminRole | null): AdminSection[] {
  if (!role) return [];
  if (role === AdminRole.SuperAdmin) return ADMIN_SECTIONS;
  return ADMIN_SECTIONS.filter((section) => section.roles.includes(role));
}

export function sectionGroups(
  role: AdminRole | null,
): { group: string; sections: AdminSection[] }[] {
  const visible = visibleSections(role);
  const groups = visible.reduce<Record<string, AdminSection[]>>(
    (acc, section) => {
      (acc[section.group] ??= []).push(section);
      return acc;
    },
    {},
  );
  const order = ["Overview", "Operations", "Catalogue", "Content", "Admin"];
  return Object.entries(groups)
    .map(([group, sections]) => ({ group, sections }))
    .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}