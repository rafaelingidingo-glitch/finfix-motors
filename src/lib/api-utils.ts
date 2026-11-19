/**
 * Shared API helpers: same-origin protection, client IP extraction,
 * auth guards for admin endpoints, and consistent JSON errors.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "@/lib/auth/session";

export type ApiError = { error: string; details?: unknown };

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error, details }, { status });
}

/**
 * CSRF/origin protection: mutating requests must originate from the same host.
 * When Origin is absent (e.g. server-to-server or curl) we allow it — the
 * SameSite=Lax session cookie already prevents cross-site browser sends.
 */
export function assertSameOrigin(req: NextRequest): NextResponse | null {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return null;
  const origin = req.headers.get("origin");
  if (!origin) return null;
  try {
    const originHost = new URL(origin).host;
    const host = req.headers.get("host");
    if (host && originHost !== host) {
      return jsonError(403, "Cross-origin request blocked.");
    }
  } catch {
    return jsonError(403, "Invalid Origin header.");
  }
  return null;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export type AdminGuard =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

/**
 * Require a valid admin session. Optionally enforce a minimum role.
 *
 * Usage:
 *   const guard = await requireAdmin(req, "SUPERADMIN");
 *   if (!guard.ok) return guard.response;
 *   // guard.session is the AdminSession
 */
export async function requireAdmin(req: NextRequest, minRole?: "SUPERADMIN"): Promise<AdminGuard> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, response: jsonError(401, "Authentication required.") };
  }
  if (minRole === "SUPERADMIN" && session.role !== "SUPERADMIN") {
    return {
      ok: false,
      response: jsonError(403, "You do not have permission to perform this action."),
    };
  }
  return { ok: true, session };
}

/** Parse JSON body safely. */
export async function readJson<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** Format zod validation errors into a readable message. */
export function zodErrorMessage(error: {
  issues: { path: (string | number | symbol)[]; message: string }[];
}): string {
  return error.issues
    .map((issue) => `${issue.path.length ? `${issue.path.join(".")}: ` : ""}${issue.message}`)
    .join("; ");
}
