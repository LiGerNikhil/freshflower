"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type {
  AdminUser,
  BlogPost,
  BusinessSettings,
  HomepageConfig,
  SeoRouteOverride,
} from "@/lib/types";
import {
  loadPhase16,
  mergePhase16,
  PHASE16_SEED,
  savePhase16,
  type Phase16State,
  type UserPasswords,
} from "@/lib/admin/phase16";
import { api } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Phase 16/17 site content store.
//
// A single provider mounted at the ROOT layout, so both the public site and
// the /admin tree read/write the same state. Phase 17 made MongoDB the source
// of truth: on mount it hydrates homepage controls, settings, blog posts, SEO
// overrides and users from the API, so admin edits survive a refresh and are
// reflected on the public pages. localStorage remains as an offline fallback
// and legacy mirror.
// ---------------------------------------------------------------------------

export interface SiteContentValue {
  hydrated: boolean;
  // business settings
  settings: BusinessSettings;
  setSettings: (value: BusinessSettings) => void;
  // homepage controls
  homepage: HomepageConfig;
  setHomepage: (value: HomepageConfig) => void;
  // blog CMS
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: string, patch: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  // SEO overrides
  seoOverrides: Record<string, SeoRouteOverride>;
  upsertSeoOverride: (path: string, patch: SeoRouteOverride) => void;
  clearSeoOverride: (path: string) => void;
  // admin users
  users: AdminUser[];
  addUser: (user: AdminUser) => void;
  updateUser: (id: string, patch: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  userPasswords: UserPasswords;
  setUserPassword: (email: string, password: string) => void;
}

interface ProviderState extends Phase16State {
  /** True once persisted values have been merged in (post-mount). */
  hydrated: boolean;
}

type Action =
  | { type: "hydrate"; payload: Partial<Phase16State> }
  | { type: "settings"; value: BusinessSettings }
  | { type: "homepage"; value: HomepageConfig }
  | { type: "addPost"; post: BlogPost }
  | { type: "updatePost"; id: string; patch: Partial<BlogPost> }
  | { type: "deletePost"; id: string }
  | { type: "upsertSeo"; path: string; patch: SeoRouteOverride }
  | { type: "clearSeo"; path: string }
  | { type: "addUser"; user: AdminUser }
  | { type: "updateUser"; id: string; patch: Partial<AdminUser> }
  | { type: "deleteUser"; id: string }
  | { type: "setPassword"; email: string; password: string };

function reducer(state: ProviderState, action: Action): ProviderState {
  switch (action.type) {
    case "hydrate":
      return { ...mergePhase16(action.payload), hydrated: true };
    case "settings":
      return { ...state, settings: action.value };
    case "homepage":
      return { ...state, homepage: action.value };
    case "addPost":
      return { ...state, blogPosts: [action.post, ...state.blogPosts] };
    case "updatePost":
      return {
        ...state,
        blogPosts: state.blogPosts.map((post) =>
          post.id === action.id ? { ...post, ...action.patch } : post,
        ),
      };
    case "deletePost":
      return {
        ...state,
        blogPosts: state.blogPosts.filter((post) => post.id !== action.id),
      };
    case "upsertSeo":
      return {
        ...state,
        seoOverrides: {
          ...state.seoOverrides,
          [action.path]: { ...state.seoOverrides[action.path], ...action.patch },
        },
      };
    case "clearSeo": {
      const next = { ...state.seoOverrides };
      delete next[action.path];
      return { ...state, seoOverrides: next };
    }
    case "addUser":
      return { ...state, users: [...state.users, action.user] };
    case "updateUser":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.id ? { ...user, ...action.patch } : user,
        ),
      };
    case "deleteUser":
      return { ...state, users: state.users.filter((user) => user.id !== action.id) };
    case "setPassword":
      return {
        ...state,
        userPasswords: { ...state.userPasswords, [action.email]: action.password },
      };
    default:
      return state;
  }
}

const SiteContentContext = createContext<SiteContentValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ...PHASE16_SEED,
    hydrated: false,
  } satisfies ProviderState);

  // Hydrate persisted values once on mount. MongoDB is the source of truth —
  // merge the DB payload over the legacy localStorage blob (used as fallback
  // when the API is unreachable, e.g. a static preview).
  useEffect(() => {
    const saved = loadPhase16();
    const apply = (payload: Partial<Phase16State>) => {
      if (Object.keys(payload).some((key) => key !== "hydrated")) {
        dispatch({ type: "hydrate", payload });
      } else if (saved && Object.keys(saved).length > 0) {
        dispatch({ type: "hydrate", payload: saved });
      }
    };
    (async () => {
      try {
        const [homepage, settings, blogPosts, seoOverrides] = await Promise.all([
          api("/api/admin/homepage"),
          api("/api/admin/settings"),
          api("/api/admin/blog"),
          api("/api/admin/seo"),
        ]);
        apply({
          homepage,
          settings,
          blogPosts,
          seoOverrides,
        });
      } catch {
        apply(saved ?? {});
      }
    })();
  }, []);

  // Persist every committed change to the shared blob (mirror only — DB is the
  // source of truth). Keeps the legacy localStorage snapshot coherent.
  useEffect(() => {
    if (!state.hydrated) return;
    savePhase16({
      blogPosts: state.blogPosts,
      homepage: state.homepage,
      seoOverrides: state.seoOverrides,
      users: state.users,
      userPasswords: state.userPasswords,
      settings: state.settings,
    });
  }, [state]);

  const value = useMemo<SiteContentValue>(
    () => ({
      hydrated: state.hydrated,
      settings: state.settings,
      setSettings: (value) => {
        api("/api/admin/settings", { method: "PUT", body: JSON.stringify(value) }).catch(
          () => undefined,
        );
        dispatch({ type: "settings", value });
      },
      homepage: state.homepage,
      setHomepage: (value) => {
        api("/api/admin/homepage", { method: "PUT", body: JSON.stringify(value) }).catch(
          () => undefined,
        );
        dispatch({ type: "homepage", value });
      },
      blogPosts: state.blogPosts,
      addBlogPost: (post) => {
        api("/api/admin/blog", { method: "POST", body: JSON.stringify(post) }).catch(
          () => undefined,
        );
        dispatch({ type: "addPost", post });
      },
      updateBlogPost: (id, patch) => {
        api(`/api/admin/blog/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        }).catch(() => undefined);
        dispatch({ type: "updatePost", id, patch });
      },
      deleteBlogPost: (id) => {
        api(`/api/admin/blog/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
          () => undefined,
        );
        dispatch({ type: "deletePost", id });
      },
      seoOverrides: state.seoOverrides,
      upsertSeoOverride: (path, patch) => {
        api("/api/admin/seo", {
          method: "PUT",
          body: JSON.stringify({ path, ...patch }),
        }).catch(() => undefined);
        dispatch({ type: "upsertSeo", path, patch });
      },
      clearSeoOverride: (path) => {
        api(`/api/admin/seo/${encodeURIComponent(path)}`, { method: "DELETE" }).catch(
          () => undefined,
        );
        dispatch({ type: "clearSeo", path });
      },
      users: state.users,
      addUser: (user) => {
        api("/api/admin/users", { method: "POST", body: JSON.stringify(user) }).catch(
          () => undefined,
        );
        dispatch({ type: "addUser", user });
      },
      updateUser: (id, patch) => {
        api(`/api/admin/users/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        }).catch(() => undefined);
        dispatch({ type: "updateUser", id, patch });
      },
      deleteUser: (id) => {
        api(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
          () => undefined,
        );
        dispatch({ type: "deleteUser", id });
      },
      userPasswords: state.userPasswords,
      setUserPassword: (email, password) => {
        // Legacy local preview mirror only. Real password changes go through
        // /api/admin/auth/password and are stored server-side.
        dispatch({ type: "setPassword", email, password });
      },
    }),
    [state],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentValue {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a SiteContentProvider");
  }
  return context;
}
