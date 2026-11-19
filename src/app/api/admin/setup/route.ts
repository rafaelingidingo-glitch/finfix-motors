import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth/session";
import { setupSchema } from "@/lib/validators";
import { assertSameOrigin, getClientIp, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * One-time first-admin creation. Only succeeds when NO admin exists yet.
 * The first account is created with the SUPERADMIN role.
 */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limit = rateLimit(`setup:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError(429, "Too many attempts. Please try again later.");
  }

  try {
    const existingAdmins = await db.adminUser.count();
    if (existingAdmins > 0) {
      return jsonError(409, "Setup is already complete. Please sign in instead.");
    }

    const body = await readJson<unknown>(req);
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const passwordHash = await hashPassword(password);
    const admin = await db.adminUser.create({
      data: { name, email: normalizedEmail, passwordHash, role: "SUPERADMIN" },
    });

    const response = NextResponse.json({
      ok: true,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
    await setSessionCookie(response, {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: "SUPERADMIN",
    });
    return response;
  } catch (error) {
    console.error("Admin setup failed:", error);
    return jsonError(500, "Setup failed. Please try again.");
  }
}
