import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

/** GET /api/admin/inquiries — paginated inquiry list with status filter. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const params = req.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
    const status = params.get("status")?.trim() ?? "";

    const where: Record<string, unknown> = {};
    if (status === "NEW" || status === "READ") where.status = status;

    const [total, inquiries] = await Promise.all([
      db.inquiry.count({ where }),
      db.inquiry.findMany({
        where,
        include: { vehicle: { select: { id: true, make: true, model: true, year: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({
      inquiries,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    console.error("Failed to load inquiries:", error);
    return jsonError(500, "Failed to load inquiries.");
  }
}
