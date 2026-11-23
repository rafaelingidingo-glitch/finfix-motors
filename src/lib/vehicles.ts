/**
 * Public vehicle query helpers (used by server components).
 */
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type VehicleWithImages = Prisma.VehicleGetPayload<{ include: { images: true } }>;

const vehicleInclude = {
  images: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] },
} satisfies Prisma.VehicleInclude;

/**
 * Runs a DB query and falls back to a safe default on failure.
 * Keeps public pages rendering during transient outages (e.g. Neon compute
 * waking from auto-suspend) instead of returning a 500.
 */
async function safeQuery<T>(label: string, fallback: T, query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`DB query failed (${label}):`, error);
    return fallback;
  }
}

/** Featured, available vehicles for the homepage. */
export async function getFeaturedVehicles(limit = 6): Promise<VehicleWithImages[]> {
  return safeQuery("getFeaturedVehicles", [], () =>
    db.vehicle.findMany({
      where: { isFeatured: true, status: "AVAILABLE" },
      include: vehicleInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  );
}

/** Most recently added available vehicles. */
export async function getLatestVehicles(limit = 4): Promise<VehicleWithImages[]> {
  return safeQuery("getLatestVehicles", [], () =>
    db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      include: vehicleInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  );
}

export async function getVehicleBySlug(slug: string): Promise<VehicleWithImages | null> {
  return safeQuery("getVehicleBySlug", null, () =>
    db.vehicle.findUnique({ where: { slug }, include: vehicleInclude })
  );
}

/** Related vehicles: same make first, padded with the newest available. */
export async function getRelatedVehicles(
  vehicle: VehicleWithImages,
  limit = 3
): Promise<VehicleWithImages[]> {
  return safeQuery("getRelatedVehicles", [], async () => {
    const sameMake = await db.vehicle.findMany({
      where: { make: vehicle.make, status: "AVAILABLE", id: { not: vehicle.id } },
      include: vehicleInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    if (sameMake.length >= limit) return sameMake.slice(0, limit);

    const excludeIds = [vehicle.id, ...sameMake.map((v) => v.id)];
    const filler = await db.vehicle.findMany({
      where: { status: "AVAILABLE", id: { notIn: excludeIds } },
      include: vehicleInclude,
      orderBy: { createdAt: "desc" },
      take: limit - sameMake.length,
    });
    return [...sameMake, ...filler];
  });
}

/** Distinct makes present in inventory (for filter UI). */
export async function getVehicleMakes(): Promise<string[]> {
  return safeQuery("getVehicleMakes", [] as string[], async () => {
    const rows = await db.vehicle.findMany({
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });
    return rows.map((r) => r.make);
  });
}
