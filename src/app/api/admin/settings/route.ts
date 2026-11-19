import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, assertSameOrigin, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { settingsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/admin/settings — current site settings. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const settings = await db.siteSetting.findUnique({ where: { id: "main" } });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to load settings:", error);
    return jsonError(500, "Failed to load settings.");
  }
}

/** PUT /api/admin/settings — update site settings (SUPERADMIN only). */
export async function PUT(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req, "SUPERADMIN");
  if (!guard.ok) return guard.response;

  try {
    const body = await readJson<unknown>(req);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const settings = await db.siteSetting.upsert({
      where: { id: "main" },
      update: parsed.data,
      create: { id: "main", ...parsed.data },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return jsonError(500, "Failed to update settings.");
  }
}
