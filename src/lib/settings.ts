/**
 * Site settings data access with safe defaults.
 * All public pages read business info through these helpers.
 */
import { cache } from "react";
import { db } from "@/lib/db";
import type { SiteSetting } from "@prisma/client";

export const DEFAULT_SETTINGS = {
  id: "main",
  businessName: "Elly Magari",
  tagline: "Quality Cars. Trusted Service.",
  phone: "+255786068760",
  whatsappNumber: "+255786068760",
  email: "",
  address: "Pasiansi, Mwanza, Tanzania",
  landmark: "Opposite Lenana Hotel",
  instagram: "https://www.instagram.com/ellymagari",
  heroTitle: "FIND YOUR NEXT DREAM CAR.",
  heroSubtitle: "Discover quality vehicles.",
  aboutTitle: "About Elly Magari",
  aboutText:
    "Elly Magari is a car dealership based in Pasiansi, Mwanza, Tanzania. We buy and sell quality vehicles, import cars on customer orders, provide reliable vehicle transportation across the country, and buy vehicles directly from owners. Visit our yard opposite Lenana Hotel — our team is ready to help you find your next car.",
  mapQuery: "Pasiansi, Mwanza, Tanzania",
  updatedAt: new Date(),
} satisfies SiteSetting;

export type SiteSettings = SiteSetting;

/** Read site settings; falls back to defaults when the row is missing. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const settings = await db.siteSetting.findUnique({ where: { id: "main" } });
    return settings ?? DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to load site settings:", error);
    return DEFAULT_SETTINGS;
  }
});
