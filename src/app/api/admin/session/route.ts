import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/** Returns the current admin session info (used by the dashboard shell). */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  return NextResponse.json({
    admin: {
      id: guard.session.sub,
      name: guard.session.name,
      email: guard.session.email,
      role: guard.session.role,
    },
  });
}
