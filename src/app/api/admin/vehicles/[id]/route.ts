import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, assertSameOrigin, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { vehicleUpdateSchema } from "@/lib/validators";
import { deleteStoredImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/vehicles/:id — full vehicle record for editing. */
export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    });
    if (!vehicle) return jsonError(404, "Vehicle not found.");
    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Failed to load vehicle:", error);
    return jsonError(500, "Failed to load vehicle.");
  }
}

/** PUT /api/admin/vehicles/:id — update vehicle (partial allowed). */
export async function PUT(req: NextRequest, { params }: Params) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    const existing = await db.vehicle.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) return jsonError(404, "Vehicle not found.");

    const body = await readJson<unknown>(req);
    const parsed = vehicleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const data = parsed.data;

    // --- Image diff: remove storage objects for images no longer present ---
    if (Array.isArray(data.images)) {
      const keepUrls = new Set(data.images.map((img) => img.url));
      const removedImages = existing.images.filter((img) => !keepUrls.has(img.url));
      await Promise.all(
        removedImages.map((img) => deleteStoredImage({ publicId: img.publicId, url: img.url }))
      );
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
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
        ...(Array.isArray(data.images)
          ? {
              images: {
                deleteMany: {},
                create: data.images.map((img, index) => ({
                  url: img.url,
                  publicId: img.publicId ?? null,
                  altText:
                    img.altText ?? `${existing.year} ${existing.make} ${existing.model} at Finfix Motors Tanzania`,
                  sortOrder: index,
                })),
              },
            }
          : {}),
      },
      include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    return jsonError(500, "Failed to update vehicle.");
  }
}

/** DELETE /api/admin/vehicles/:id — delete vehicle and its stored images. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  try {
    const existing = await db.vehicle.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) return jsonError(404, "Vehicle not found.");

    // Best-effort removal of stored images, then delete the record (cascades images)
    await Promise.all(
      existing.images.map((img) => deleteStoredImage({ publicId: img.publicId, url: img.url }))
    );
    await db.vehicle.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete vehicle:", error);
    return jsonError(500, "Failed to delete vehicle.");
  }
}
