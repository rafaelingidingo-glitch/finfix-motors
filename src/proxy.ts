/**
 * Route protection proxy (Next.js 16 middleware convention).
 * - /admin/** pages (except /admin/login and /admin/setup): redirect to login.
 * - /api/admin/** (except login/logout/setup/setup-status): return 401 JSON.
 * Token verification uses `jose` (edge-safe). Defense in depth: every admin
 * API handler also re-checks the session server-side.
 */
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

const PUBLIC_ADMIN_PAGES = ["/admin/login", "/admin/setup"];
const PUBLIC_ADMIN_APIS = [
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/setup",
  "/api/admin/setup-status",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  // ---- Admin API routes ----
  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_APIS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return NextResponse.next();
    }
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ---- Admin pages ----
  if (pathname.startsWith("/admin")) {
    const isPublicPage = PUBLIC_ADMIN_PAGES.some((p) => pathname === p);
    if (isPublicPage) {
      // Already signed in? Skip auth pages.
      if (session && pathname === "/admin/login") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
