import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators";
import { assertSameOrigin, getClientIp, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Admin login. Rate-limited per IP to slow down brute-force attempts. */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError(
      429,
      `Too many login attempts. Try again in ${limit.retryAfterSeconds} seconds.`
    );
  }

  try {
    const body = await readJson<unknown>(req);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Invalid email or password.");
    }
    const { email, password } = parsed.data;

    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!admin) {
      return jsonError(401, "Invalid email or password.");
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return jsonError(401, "Invalid email or password.");
    }

    const response = NextResponse.json({
      ok: true,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
    await setSessionCookie(response, {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN",
    });
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return jsonError(500, "Login failed. Please try again.");
  }
}
