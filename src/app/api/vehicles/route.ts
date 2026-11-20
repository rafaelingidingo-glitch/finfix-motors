import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

/**
 * GET /api/vehicles — public inventory listing.
 * Supports: search, make, minPrice, maxPrice, year, transmission, fuelType,
 * status, sort (newest | price_asc | price_desc), page.
 */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;

    const search = params.get("search")?.trim() ?? "";
    const make = params.get("make")?.trim() ?? "";
    const minPrice = Number(params.get("minPrice") ?? "");
    const maxPrice = Number(params.get("maxPrice") ?? "");
    const year = Number(params.get("year") ?? "");
    const transmission = params.get("transmission")?.trim() ?? "";
    const fuelType = params.get("fuelType")?.trim() ?? "";
    const status = params.get("status")?.trim() ?? "";
    const sort = params.get("sort") ?? "newest";
    const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { year: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }
    if (make) where.make = make;
    if (!isNaN(minPrice) && params.get("minPrice")) where.price = { ...((where.price as object) ?? {}), gte: minPrice };
    if (!isNaN(maxPrice) && params.get("maxPrice")) where.price = { ...((where.price as object) ?? {}), lte: maxPrice };
    if (!isNaN(year) && params.get("year")) where.year = year;
    if (transmission === "Automatic" || transmission === "Manual") where.transmission = transmission;
    if (["Petrol", "Diesel", "Hybrid", "Electric"].includes(fuelType)) where.fuelType = fuelType;
    if (status === "AVAILABLE" || status === "SOLD") where.status = status;

    const orderBy =
      sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const [total, vehicles, makes] = await Promise.all([
      db.vehicle.count({ where }),
      db.vehicle.findMany({
        where,
        include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 1 } },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      db.vehicle.findMany({ select: { make: true }, distinct: ["make"], orderBy: { make: "asc" } }),
    ]);

    return NextResponse.json({
      vehicles: vehicles.map((v) => ({ ...v, images: v.images })),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      facets: {
        makes: makes.map((m) => m.make),
      },
    });
  } catch (error) {
    console.error("Failed to load vehicles:", error);
    return jsonError(500, "Failed to load vehicles.");
  }
}
