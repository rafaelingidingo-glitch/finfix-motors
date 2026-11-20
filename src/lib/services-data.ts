/**
 * Services data access with sensible fallback to the real business services.
 */
import { cache } from "react";
import { db } from "@/lib/db";
import type { Service } from "@prisma/client";

export type ServiceContent = Pick<
  Service,
  "id" | "title" | "description" | "icon" | "sortOrder" | "isActive"
>;

export const DEFAULT_SERVICES: ServiceContent[] = [
  {
    id: "default-1",
    title: "Buying & Selling Cars",
    description:
      "Explore a rotating selection of quality vehicles at our Pasiansi yard in Mwanza. Browse, inspect, and drive away in your next car with a team that keeps the process simple and transparent.",
    icon: "car",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "default-2",
    title: "Vehicle Importation",
    description:
      "Tell us the exact car you want and we handle the import process on your behalf — sourcing, shipping and delivery to Mwanza, with updates at every step until your vehicle arrives.",
    icon: "ship",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "default-3",
    title: "Vehicle Transportation",
    description:
      "Safe and reliable vehicle transportation across Mwanza and throughout Tanzania. Your vehicle is handled with care and delivered where you need it.",
    icon: "truck",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "default-4",
    title: "We Buy Your Car",
    description:
      "Looking to sell? We buy vehicles directly from owners for a quick, fair and straightforward deal — no listing hassle, no waiting for buyers.",
    icon: "hand-coins",
    sortOrder: 4,
    isActive: true,
  },
];

/** Active services ordered for display; falls back to defaults. */
export const getActiveServices = cache(async (): Promise<ServiceContent[]> => {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return services.length > 0 ? services : DEFAULT_SERVICES;
  } catch (error) {
    console.error("Failed to load services:", error);
    return DEFAULT_SERVICES;
  }
});
