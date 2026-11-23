import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, assertSameOrigin, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { vehicleCreateSchema } from "@/lib/validators";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

const LIST_PAGE_SIZE = 12;

/** GET /api/admin/vehicles — paginated admin vehicle list with search/status filter. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const params = req.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
    const search = params.get("search")?.trim() ?? "";
    const status = params.get("status")?.trim() ?? "";
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { year: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }
    if (status === "AVAILABLE" || status === "SOLD") {
      where.status = status;
    }

    const [total, vehicles] = await Promise.all([
      db.vehicle.count({ where }),
      db.vehicle.findMany({
        where,
        include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 1 } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * LIST_PAGE_SIZE,
        take: LIST_PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({
      vehicles,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / LIST_PAGE_SIZE)),
    });
  } catch (error) {
    console.error("Failed to list vehicles:", error);
    return jsonError(500, "Failed to load vehicles.");
  }
}

/** Create a unique slug from vehicle details. */
async function createUniqueSlug(make: string, model: string, year: number): Promise<string> {
  const base = slugify(`${make}-${model}-${year}`).slice(0, 60) || "vehicle";
  let candidate = base;
  for (let i = 0; i < 6; i++) {
    const exists = await db.vehicle.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now()}`;
}

/** POST /api/admin/vehicles — create a vehicle. */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const body = await readJson<unknown>(req);
    const parsed = vehicleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const data = parsed.data;
    const slug = await createUniqueSlug(data.make, data.model, data.year);

    const vehicle = await db.vehicle.create({
      data: {
        slug,
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        transmission: data.transmission,
        fuelType: data.fuelType,
        condition: data.condition,
        mileage: data.mileage ?? null,
        color: data.color ?? null,
        engine: data.engine ?? null,
        description: data.description ?? null,
        status: data.status,
        isFeatured: data.isFeatured,
        images: {
          create: data.images.map((img, index) => ({
            url: img.url,
            publicId: img.publicId ?? null,
            altText:
              img.altText ??
              `${data.year} ${data.make} ${data.model} available at Finfix Motors Tanzania`,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return jsonError(500, "Failed to create vehicle.");
  }
}
