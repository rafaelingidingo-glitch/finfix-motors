/**
 * FINFIX MOTORS LIMITED — one-off database rebrand script.
 *
 * Updates an EXISTING database (previous branding) to Finfix Motors Limited:
 *  1. Syncs SiteSetting column defaults with prisma/schema.prisma
 *  2. Site settings row (business info, hero copy, about text)
 *  3. Services descriptions (locations)
 *  4. Sample vehicle descriptions + image alt texts
 *  5. Any image alt / description still mentioning the old brand
 *  6. Admin account email/password (rebranded credentials)
 *
 * Uses the Neon HTTP SQL driver, so it works from any environment that can
 * reach Neon over HTTPS (no direct TCP required).
 *
 * Run: bun scripts/rebrand-finfix.ts     (reads DATABASE_URL from .env)
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.startsWith("file:")) {
  console.error(
    "Set a valid Neon DATABASE_URL (postgresql://...) in .env before running this script."
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL.replace(/channel_binding=[^&]*&?/, ""));

const ABOUT_TEXT =
  "Finfix Motors Limited is a trusted car dealership serving Dar es Salaam and Dodoma, Tanzania. We deal in all types of vehicles — buying and selling quality cars, importing vehicles on customer orders, providing reliable vehicle transportation across the country, and buying vehicles directly from owners. Find us on 0650 090 909 or 0650 050 505 — our team is ready to help you find your next car.";

const SERVICE_UPDATES: Record<string, string> = {
  "Buying & Selling Cars":
    "Explore a rotating selection of quality vehicles at our yards in Dar es Salaam and Dodoma. Browse, inspect, and drive away in your next car with a team that keeps the process simple and transparent.",
  "Vehicle Importation":
    "Tell us the exact car you want and we handle the import process on your behalf — sourcing, shipping and delivery to Dar es Salaam or Dodoma, with updates at every step until your vehicle arrives.",
  "Vehicle Transportation":
    "Safe and reliable vehicle transportation across Dar es Salaam, Dodoma and throughout Tanzania. Your vehicle is handled with care and delivered where you need it.",
};

const VEHICLE_DESCRIPTIONS: Record<string, string> = {
  "toyota-land-cruiser-prado-2018-txl":
    "Well-maintained Toyota Land Cruiser Prado TX-L available for viewing at our yards in Dar es Salaam and Dodoma. Famous for its reliability and comfort on Tanzanian roads. Contact us on WhatsApp to confirm current availability and to arrange a visit.",
  "toyota-hilux-2020-double-cab":
    "Strong and dependable Toyota Hilux Double Cab — ideal for both business and family use. Available for inspection at our yards in Dar es Salaam and Dodoma. Message us on WhatsApp for the latest price and availability.",
  "toyota-corolla-2019-sedan":
    "Fuel-efficient Toyota Corolla in clean condition — a perfect everyday sedan. View it at our yards in Dar es Salaam and Dodoma or contact us on WhatsApp to learn more.",
  "nissan-x-trail-2017-suv":
    "Spacious family SUV with a comfortable interior and smooth automatic transmission. Available for viewing in Dar es Salaam and Dodoma. Contact us to confirm availability.",
  "mazda-cx5-2019-suv":
    "Stylish Mazda CX-5 with a premium feel, smooth handling and modern features. Visit us in Dar es Salaam or Dodoma to see it in person.",
  "mercedes-benz-e200-2016-sedan":
    "Executive luxury sedan with timeless styling and a refined cabin. Available at Finfix Motors — contact us on WhatsApp to arrange a viewing.",
  "toyota-harrier-2018-suv":
    "Elegant Toyota Harrier Hybrid — economical, comfortable and beautifully finished. This unit has been sold, but similar vehicles arrive regularly. Message us and we will source one for you.",
  "honda-fit-2017-hatchback":
    "Compact, reliable and very economical — a great first car or city runabout. This unit has been sold. Contact us for similar vehicles currently in stock or on order.",
};

const VEHICLE_ALTS: Record<string, string> = {
  "toyota-land-cruiser-prado-2018-txl":
    "White Toyota Land Cruiser Prado TX-L 2018 SUV available at Finfix Motors Tanzania",
  "toyota-hilux-2020-double-cab":
    "Silver Toyota Hilux Double Cab 2020 pickup available at Finfix Motors Tanzania",
  "toyota-corolla-2019-sedan":
    "Silver Toyota Corolla 2019 sedan available at Finfix Motors Tanzania",
  "nissan-x-trail-2017-suv":
    "Grey Nissan X-Trail 2017 SUV available at Finfix Motors Tanzania",
  "mazda-cx5-2019-suv":
    "Red Mazda CX-5 2019 SUV available at Finfix Motors Tanzania",
  "mercedes-benz-e200-2016-sedan":
    "Black Mercedes-Benz E200 2016 sedan available at Finfix Motors Tanzania",
  "toyota-harrier-2018-suv":
    "Pearl white Toyota Harrier 2018 SUV sold at Finfix Motors Tanzania",
  "honda-fit-2017-hatchback":
    "Silver Honda Fit 2017 hatchback sold at Finfix Motors Tanzania",
};

type VehicleRow = {
  id: string;
  slug: string;
  description: string | null;
  images: { id: string; altText: string | null }[];
};

function cleanBrandText(input: string): string {
  return input
    .replace(/Elly Magari/gi, "Finfix Motors")
    .replace(/Pasiansi,?\s*Mwanza,?\s*Tanzania/gi, "Dar es Salaam or Dodoma, Tanzania")
    .replace(/Pasiansi/gi, "our yard")
    .replace(/Mwanza/gi, "Dar es Salaam or Dodoma")
    .replace(/opposite Lenana Hotel/gi, "")
    .replace(/Lenana Hotel/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,—])/g, "$1")
    .trim();
}

function cleanAltText(input: string): string {
  return input
    .replace(/Elly Magari Mwanza/gi, "Finfix Motors Tanzania")
    .replace(/Elly Magari/gi, "Finfix Motors")
    .replace(/Mwanza/gi, "Tanzania")
    .replace(/Pasiansi/gi, "Tanzania")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function main() {
  console.log("Rebranding database to FINFIX MOTORS LIMITED...");

  // 1. Sync SiteSetting column defaults with prisma/schema.prisma
  await sql`
    ALTER TABLE "SiteSetting"
      ALTER COLUMN "businessName" SET DEFAULT 'Finfix Motors Limited',
      ALTER COLUMN "tagline" SET DEFAULT 'Exceptional Service, Extraordinary Vehicle.',
      ALTER COLUMN "phone" SET DEFAULT '+255650090909',
      ALTER COLUMN "whatsappNumber" SET DEFAULT '+255650090909',
      ALTER COLUMN "address" SET DEFAULT 'Dar es Salaam & Dodoma, Tanzania',
      ALTER COLUMN "landmark" SET DEFAULT 'Waagizaji wa Magari Aina Yote',
      ALTER COLUMN "instagram" SET DEFAULT '',
      ALTER COLUMN "aboutTitle" SET DEFAULT 'About Finfix Motors Limited',
      ALTER COLUMN "heroSubtitle" SET DEFAULT 'Waagizaji wa Magari Aina Yote — Dar es Salaam & Dodoma.',
      ALTER COLUMN "mapQuery" SET DEFAULT 'Dar es Salaam, Tanzania'
  `;
  console.log("OK SiteSetting column defaults synced");

  // 2. Site settings row
  await sql`
    INSERT INTO "SiteSetting" (
      "id", "businessName", "tagline", "phone", "whatsappNumber", "email",
      "address", "landmark", "instagram", "heroTitle", "heroSubtitle",
      "aboutTitle", "aboutText", "mapQuery"
    ) VALUES (
      'main', 'Finfix Motors Limited', 'Exceptional Service, Extraordinary Vehicle.',
      '+255650090909', '+255650090909', '',
      'Dar es Salaam & Dodoma, Tanzania', 'Waagizaji wa Magari Aina Yote', '',
      'FIND YOUR NEXT DREAM CAR.', 'Waagizaji wa Magari Aina Yote — Dar es Salaam & Dodoma.',
      'About Finfix Motors Limited', ${ABOUT_TEXT}, 'Dar es Salaam, Tanzania'
    )
    ON CONFLICT ("id") DO UPDATE SET
      "businessName" = 'Finfix Motors Limited',
      "tagline" = 'Exceptional Service, Extraordinary Vehicle.',
      "phone" = '+255650090909',
      "whatsappNumber" = '+255650090909',
      "address" = 'Dar es Salaam & Dodoma, Tanzania',
      "landmark" = 'Waagizaji wa Magari Aina Yote',
      "instagram" = '',
      "heroSubtitle" = 'Waagizaji wa Magari Aina Yote — Dar es Salaam & Dodoma.',
      "aboutTitle" = 'About Finfix Motors Limited',
      "aboutText" = ${ABOUT_TEXT},
      "mapQuery" = 'Dar es Salaam, Tanzania',
      "updatedAt" = now()
  `;
  console.log("OK Site settings -> Finfix Motors Limited");

  // 3. Services
  for (const [title, description] of Object.entries(SERVICE_UPDATES)) {
    const result = await sql`
      UPDATE "Service" SET "description" = ${description}, "updatedAt" = now()
      WHERE "title" = ${title}
      RETURNING "id"
    `;
    console.log(`OK Service "${title}" (${result.length} updated)`);
  }

  // 4. Sample vehicle descriptions + image alt texts
  for (const [slug, description] of Object.entries(VEHICLE_DESCRIPTIONS)) {
    const result = await sql`
      UPDATE "Vehicle" SET "description" = ${description}, "updatedAt" = now()
      WHERE "slug" = ${slug}
      RETURNING "id"
    `;
    if (result.length > 0) console.log(`OK Vehicle "${slug}" description`);
  }
  for (const [slug, alt] of Object.entries(VEHICLE_ALTS)) {
    const result = await sql`
      UPDATE "VehicleImage" vi SET "altText" = ${alt}
      FROM "Vehicle" v
      WHERE vi."vehicleId" = v."id" AND v."slug" = ${slug}
      RETURNING vi."id"
    `;
    if (result.length > 0) console.log(`OK Vehicle "${slug}" image alt (${result.length})`);
  }

  // 5. Any remaining old-brand strings in descriptions / alt texts
  const vehicles = (await sql`
    SELECT v."id", v."slug", v."description",
           json_agg(json_build_object('id', vi."id", 'altText', vi."altText")) AS images
    FROM "Vehicle" v
    LEFT JOIN "VehicleImage" vi ON vi."vehicleId" = v."id"
    GROUP BY v."id", v."slug", v."description"
  `) as unknown as VehicleRow[];

  for (const v of vehicles) {
    if (v.description && /Elly Magari|Pasiansi|Mwanza|Lenana/i.test(v.description)) {
      await sql`
        UPDATE "Vehicle" SET "description" = ${cleanBrandText(v.description)}, "updatedAt" = now()
        WHERE "id" = ${v.id}
      `;
      console.log(`OK Cleaned description of "${v.slug}"`);
    }
    for (const img of v.images ?? []) {
      if (!img?.id) continue;
      if (img.altText && /Elly Magari|Mwanza|Pasiansi/i.test(img.altText)) {
        await sql`
          UPDATE "VehicleImage" SET "altText" = ${cleanAltText(img.altText)}
          WHERE "id" = ${img.id}
        `;
        console.log(`OK Cleaned alt text of image ${img.id} (${v.slug})`);
      }
    }
  }

  // 6. Admin account — rebranded credentials
  const passwordHash = await bcrypt.hash("Finfix2025#Motors", 12);
  const admins = (await sql`
    SELECT "id", "email", "name" FROM "AdminUser" ORDER BY "createdAt" ASC
  `) as unknown as { id: string; email: string; name: string }[];

  if (admins.length > 0) {
    const primary = admins[0];
    await sql`
      UPDATE "AdminUser"
      SET "email" = 'admin@finfixmotors.co.tz',
          "passwordHash" = ${passwordHash},
          "name" = CASE WHEN "name" = 'Elly Magari' THEN 'Finfix Motors' ELSE "name" END,
          "updatedAt" = now()
      WHERE "id" = ${primary.id}
    `;
    for (const extra of admins.slice(1)) {
      if (extra.email.endsWith("@ellymagari.co.tz")) {
        await sql`DELETE FROM "AdminUser" WHERE "id" = ${extra.id}`;
        console.log(`OK Removed stale admin ${extra.email}`);
      }
    }
    console.log("OK Admin -> admin@finfixmotors.co.tz / Finfix2025#Motors (SUPERADMIN)");
  } else {
    await sql`
      INSERT INTO "AdminUser" ("email", "passwordHash", "name", "role")
      VALUES ('admin@finfixmotors.co.tz', ${passwordHash}, 'Finfix Motors', 'SUPERADMIN')
    `;
    console.log("OK Created admin admin@finfixmotors.co.tz (SUPERADMIN)");
  }

  console.log("\nRebrand complete. Verification:");
  const [settings] = await sql`SELECT "businessName", "phone", "address" FROM "SiteSetting" WHERE "id" = 'main'`;
  const [counts] = await sql`SELECT
      (SELECT count(*) FROM "Service") AS services,
      (SELECT count(*) FROM "Vehicle") AS vehicles,
      (SELECT count(*) FROM "AdminUser") AS admins`;
  console.log(`  settings: ${JSON.stringify(settings)}`);
  console.log(`  counts: ${JSON.stringify(counts)}`);
}

main().catch((e) => {
  console.error("Rebrand failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
