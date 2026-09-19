import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";

const PUBLIC_ADMIN_GET_PATHS = new Set([
  "/api/admin/homepage",
  "/api/admin/settings",
  "/api/admin/blog",
  "/api/admin/seo",
]);

function isPublicAdminRead(request: NextRequest): boolean {
  return request.method === "GET" && PUBLIC_ADMIN_GET_PATHS.has(request.nextUrl.pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/logout") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    if (isPublicAdminRead(request)) return NextResponse.next();
    if (await verifyAdminRequest(request)) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (await verifyAdminRequest(request)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
