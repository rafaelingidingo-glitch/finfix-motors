import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/** Dashboard overview statistics. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const [totalVehicles, available, sold, featured, newInquiries, recentRaw] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: "AVAILABLE" } }),
      db.vehicle.count({ where: { status: "SOLD" } }),
      db.vehicle.count({ where: { isFeatured: true } }),
      db.inquiry.count({ where: { status: "NEW" } }),
      db.vehicle.findMany({
        include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      stats: { totalVehicles, available, sold, featured, newInquiries },
      recentVehicles: recentRaw.map((v) => ({
        id: v.id,
        slug: v.slug,
        make: v.make,
        model: v.model,
        year: v.year,
        price: v.price,
        status: v.status,
        isFeatured: v.isFeatured,
        createdAt: v.createdAt,
        thumbnail: v.images[0]?.url ?? null,
      })),
    });
  } catch (error) {
    console.error("Failed to load stats:", error);
    return NextResponse.json({ error: "Failed to load statistics." }, { status: 500 });
  }
}
