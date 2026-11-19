import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, getClientIp, jsonError, readJson, zodErrorMessage } from "@/lib/api-utils";
import { inquirySchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/inquiries — public contact/vehicle inquiry form.
 * Validated and rate-limited per IP.
 */
export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limit = rateLimit(`inquiry:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return jsonError(
      429,
      `Too many messages sent. Please try again in ${limit.retryAfterSeconds} seconds, or contact us directly on WhatsApp.`
    );
  }

  try {
    const body = await readJson<unknown>(req);
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, zodErrorMessage(parsed.error));
    }
    const { name, phone, email, message, vehicleId } = parsed.data;

    // Ignore vehicleId if the vehicle does not exist
    let validVehicleId: string | null = null;
    if (vehicleId) {
      const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
      if (vehicle) validVehicleId = vehicle.id;
    }

    await db.inquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        message,
        vehicleId: validVehicleId,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save inquiry:", error);
    return jsonError(500, "Failed to send your message. Please contact us on WhatsApp.");
  }
}
