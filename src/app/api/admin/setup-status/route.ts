import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public: reports whether an admin account already exists (for setup flow). */
export async function GET() {
  try {
    const count = await db.adminUser.count();
    return NextResponse.json({ hasAdmin: count > 0 });
  } catch (error) {
    console.error("Setup status check failed:", error);
    return NextResponse.json({ error: "Unable to check setup status." }, { status: 500 });
  }
}
