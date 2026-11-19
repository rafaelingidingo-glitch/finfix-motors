/**
 * Cloudinary integration for vehicle image storage.
 *
 * If CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET are configured, uploads go
 * to Cloudinary. Otherwise uploads fall back to local `public/uploads`
 * storage (development convenience — on Vercel, Cloudinary must be used).
 */
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const LOCAL_UPLOAD_URL_PREFIX = "/uploads/";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type StoredImage = {
  url: string;
  publicId: string | null;
};

/** Upload a buffer to Cloudinary. */
async function uploadToCloudinary(buffer: Buffer): Promise<StoredImage> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "elly-magari/vehicles",
        resource_type: "image",
        // Keep originals reasonable for web usage
        transformation: [{ width: 1600, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/** Save a buffer to the local public/uploads folder (dev fallback). */
async function saveLocally(buffer: Buffer, extension: string): Promise<StoredImage> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return { url: `${LOCAL_UPLOAD_URL_PREFIX}${filename}`, publicId: null };
}

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME[file.type]) {
    return "Unsupported file type. Use JPG, PNG or WebP images.";
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "Image is too large. Maximum size is 5 MB.";
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

/** Store an image buffer (Cloudinary when configured, else local disk). */
export async function storeImage(file: File): Promise<StoredImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = ALLOWED_MIME[file.type] ?? "jpg";
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer);
  }
  return saveLocally(buffer, extension);
}

/**
 * Delete a previously stored image.
 * - Cloudinary images are destroyed via publicId.
 * - Local images are removed from public/uploads (path-traversal safe).
 */
export async function deleteStoredImage(image: { publicId?: string | null; url?: string | null }) {
  try {
    if (image.publicId && isCloudinaryConfigured()) {
      ensureConfigured();
      await cloudinary.uploader.destroy(image.publicId);
      return;
    }
    if (image.url && image.url.startsWith(LOCAL_UPLOAD_URL_PREFIX)) {
      const filename = path.basename(image.url); // strip any path traversal
      const target = path.join(UPLOAD_DIR, filename);
      if (target.startsWith(UPLOAD_DIR) && filename) {
        await fs.unlink(target).catch(() => undefined);
      }
    }
  } catch (error) {
    // Never fail the main operation because an old image could not be removed
    console.error("Failed to delete stored image:", error);
  }
}
