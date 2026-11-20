import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/** Admin logout — clears the session cookie. */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
