import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, assertSameOrigin, jsonError } from "@/lib/api-utils";
import { deleteStoredImage, isCloudinaryConfigured, storeImage, validateImageFile, type StoredImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_FILES_PER_REQUEST = 6;

/**
 * POST /api/admin/upload — secure server-side image upload.
 * Accepts multipart form-data with one or more `files`.
 * Storage: Cloudinary when configured, otherwise local public/uploads.
 */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return jsonError(400, "No image files were provided.");
    }
    if (files.length > MAX_FILES_PER_REQUEST) {
      return jsonError(400, `Maximum ${MAX_FILES_PER_REQUEST} images per upload.`);
    }

    const stored: StoredImage[] = [];
    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        return jsonError(400, validationError);
      }
    }
    for (const file of files) {
      stored.push(await storeImage(file));
    }

    return NextResponse.json({ images: stored }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return jsonError(500, "Image upload failed. Please try again.");
  }
}

/**
 * DELETE /api/admin/upload — delete a stored image by publicId (Cloudinary)
 * or by local /uploads URL.
 */
export async function DELETE(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const body = (await req.json()) as { publicId?: string; url?: string };
    if (!body.publicId && !body.url) {
      return jsonError(400, "Provide publicId or url of the image to delete.");
    }
    if (body.publicId && !isCloudinaryConfigured()) {
      return jsonError(400, "Cloudinary is not configured.");
    }
    await deleteStoredImage({ publicId: body.publicId, url: body.url });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Image delete failed:", error);
    return jsonError(500, "Failed to delete image.");
  }
}
