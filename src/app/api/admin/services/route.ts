import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, assertSameOrigin, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { serviceSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/admin/services — all services (including inactive). */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const services = await db.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ services });
  } catch (error) {
    console.error("Failed to load services:", error);
    return jsonError(500, "Failed to load services.");
  }
}

/** POST /api/admin/services — create a service (SUPERADMIN only). */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req, "SUPERADMIN");
  if (!guard.ok) return guard.response;

  try {
    const body = await readJson<unknown>(req);
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const service = await db.service.create({ data: parsed.data });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return jsonError(500, "Failed to create service.");
  }
}
