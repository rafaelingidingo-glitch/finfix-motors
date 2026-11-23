/**
 * Site settings data access with safe defaults.
 * All public pages read business info through these helpers.
 */
import { cache } from "react";
import { db } from "@/lib/db";
import type { SiteSetting } from "@prisma/client";

export const DEFAULT_SETTINGS = {
  id: "main",
  businessName: "Finfix Motors Limited",
  tagline: "Exceptional Service, Extraordinary Vehicle.",
  phone: "+255650090909",
  whatsappNumber: "+255650090909",
  email: "",
  address: "Dar es Salaam & Dodoma, Tanzania",
  landmark: "Waagizaji wa Magari Aina Yote",
  instagram: "",
  heroTitle: "FIND YOUR NEXT DREAM CAR.",
  heroSubtitle: "Waagizaji wa Magari Aina Yote — Dar es Salaam & Dodoma.",
  aboutTitle: "About Finfix Motors Limited",
  aboutText:
    "Finfix Motors Limited is a trusted car dealership serving Dar es Salaam and Dodoma, Tanzania. We deal in all types of vehicles — buying and selling quality cars, importing vehicles on customer orders, providing reliable vehicle transportation across the country, and buying vehicles directly from owners. Find us on 0650 090 909 or 0650 050 505 — our team is ready to help you find your next car.",
  mapQuery: "Dar es Salaam, Tanzania",
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
