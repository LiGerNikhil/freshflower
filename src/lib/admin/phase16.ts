import { loadJSON, saveJSON } from "./overrides";
import { blogs } from "@/lib/data/blogs";
import { adminUsers, adminPasswords } from "@/lib/data/admin";
import { DEFAULT_HOMEPAGE } from "@/lib/data/homepage";
import { DEFAULT_SETTINGS } from "@/lib/data/settings";
import type {
  AdminUser,
  BlogPost,
  BusinessSettings,
  HomepageConfig,
  SeoRouteOverride,
} from "@/lib/types";

/** Password overrides map used by /admin/auth; password overrides live here too. */
export type UserPasswords = Record<string, string>;

export interface Phase16State {
  blogPosts: BlogPost[];
  homepage: HomepageConfig;
  seoOverrides: Record<string, SeoRouteOverride>;
  users: AdminUser[];
  userPasswords: UserPasswords;
  settings: BusinessSettings;
}

export const PHASE16_KEY = "ff-phase16-v1";

export const PHASE16_SEED: Phase16State = {
  blogPosts: blogs,
  homepage: DEFAULT_HOMEPAGE,
  seoOverrides: {},
  users: adminUsers,
  userPasswords: adminPasswords,
  settings: DEFAULT_SETTINGS,
};

export function loadPhase16(): Partial<Phase16State> {
  const loaded = loadJSON<Partial<Phase16State>>(PHASE16_KEY, {}) as
    | Partial<Phase16State>
    | null;
  return loaded ?? {};
}

export function savePhase16(state: Phase16State): void {
  saveJSON(PHASE16_KEY, JSON.parse(JSON.stringify(state)));
}

/** Merge a shallow-load back over the seed defaults (defensive against
 * partial writes / schema drift across sessions). */
export function mergePhase16(over: Partial<Phase16State>): Phase16State {
  return {
    blogPosts: over.blogPosts ?? PHASE16_SEED.blogPosts,
    homepage: { ...PHASE16_SEED.homepage, ...(over.homepage ?? {}) },
    seoOverrides: over.seoOverrides ?? {},
    users: over.users ?? PHASE16_SEED.users,
    userPasswords: over.userPasswords ?? PHASE16_SEED.userPasswords,
    settings: { ...PHASE16_SEED.settings, ...(over.settings ?? {}) },
  };
}

export function passwordFor(email: string, passwords: UserPasswords): string | undefined {
  return passwords[email];
}