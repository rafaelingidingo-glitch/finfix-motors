import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, assertSameOrigin, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { serviceUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** PUT /api/admin/services/:id — update a service (SUPERADMIN only). */
export async function PUT(req: NextRequest, { params }: Params) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req, "SUPERADMIN");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    const body = await readJson<unknown>(req);
    const parsed = serviceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const service = await db.service.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ service });
  } catch (error) {
    console.error("Failed to update service:", error);
    return jsonError(500, "Failed to update service.");
  }
}

/** DELETE /api/admin/services/:id — delete a service (SUPERADMIN only). */
export async function DELETE(req: NextRequest, { params }: Params) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req, "SUPERADMIN");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    await db.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return jsonError(500, "Failed to delete service.");
  }
}
