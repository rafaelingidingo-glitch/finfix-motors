import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, assertSameOrigin, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { inquiryStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** PUT /api/admin/inquiries/:id — mark inquiry as NEW/READ. */
export async function PUT(req: NextRequest, { params }: Params) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    const body = await readJson<unknown>(req);
    const parsed = inquiryStatusSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Failed to update inquiry:", error);
    return jsonError(500, "Failed to update inquiry.");
  }
}

/** DELETE /api/admin/inquiries/:id — delete an inquiry. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    await db.inquiry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete inquiry:", error);
    return jsonError(500, "Failed to delete inquiry.");
  }
}
