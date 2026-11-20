/**
 * Authentication utilities.
 *
 * - Session tokens: JWT (HS256) via `jose` — edge compatible (used in middleware)
 * - Session transport: httpOnly cookie `elly_session`
 *
 * The JWT secret comes from SESSION_SECRET. A dev fallback keeps the sandbox
 * running, but production deployments MUST set a strong random secret.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "elly_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUPERADMIN";
};

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

/** Sign a session JWT for an admin user. */
export async function signSessionToken(session: AdminSession): Promise<string> {
  return await new SignJWT({ email: session.email, name: session.name, role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify a session JWT; returns null when invalid/expired. Edge-safe. */
export async function verifySessionToken(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "Admin",
      role: payload.role === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN",
    };
  } catch {
    return null;
  }
}
