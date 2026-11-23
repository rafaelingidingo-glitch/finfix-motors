/**
 * FINFIX MOTORS LIMITED — full Neon database setup.
 *
 * Designed for a NEW/EMPTY Neon PostgreSQL database:
 *  1. Creates the schema (tables + indexes) from scripts/schema.sql
 *     (generated offline with `prisma migrate diff --from-empty`)
 *  2. Seeds site settings (real business info)
 *  3. Seeds the four real business services
 *  4. Seeds 8 sample vehicle listings with photos (/images/cars/*)
 *  5. Creates the SUPERADMIN admin account
 *
 * Uses the Neon HTTP SQL driver — works from any environment that can
 * reach Neon over HTTPS (no direct TCP needed).
 *
 * Run: env -u DATABASE_URL bun scripts/setup-neon-db.ts
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.startsWith("postgresql")) {
  console.error(
    "Set a valid Neon DATABASE_URL (postgresql://...) in .env before running this script."
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL.replace(/channel_binding=[^&]*&?/, ""));

// ---------------------------------------------------------------- settings
const SETTINGS = {
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
};

// ---------------------------------------------------------------- services
const SERVICES = [
  {
    title: "Buying & Selling Cars",
    description:
      "Explore a rotating selection of quality vehicles at our yards in Dar es Salaam and Dodoma. Browse, inspect, and drive away in your next car with a team that keeps the process simple and transparent.",
    icon: "car",
    sortOrder: 1,
  },
  {
    title: "Vehicle Importation",
    description:
      "Tell us the exact car you want and we handle the import process on your behalf — sourcing, shipping and delivery to Dar es Salaam or Dodoma, with updates at every step until your vehicle arrives.",
    icon: "ship",
    sortOrder: 2,
  },
  {
    title: "Vehicle Transportation",
    description:
      "Safe and reliable vehicle transportation across Dar es Salaam, Dodoma and throughout Tanzania. Your vehicle is handled with care and delivered where you need it.",
    icon: "truck",
    sortOrder: 3,
  },
  {
    title: "We Buy Your Car",
    description:
      "Looking to sell? We buy vehicles directly from owners for a quick, fair and straightforward deal — no listing hassle, no waiting for buyers.",
    icon: "hand-coins",
    sortOrder: 4,
  },
];

// ---------------------------------------------------------------- vehicles
const VEHICLES = [
  {
    slug: "toyota-land-cruiser-prado-2018-txl",
    make: "Toyota",
    model: "Land Cruiser Prado TX-L",
    year: 2018,
    price: 89500000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Foreign Used",
    mileage: 68000,
    color: "White",
    engine: "2800cc",
    description:
      "Well-maintained Toyota Land Cruiser Prado TX-L available for viewing at our yards in Dar es Salaam and Dodoma. Famous for its reliability and comfort on Tanzanian roads. Contact us on WhatsApp to confirm current availability and to arrange a visit.",
    status: "AVAILABLE",
    isFeatured: true,
    image: "/images/cars/prado.jpg",
    alt: "White Toyota Land Cruiser Prado TX-L 2018 SUV available at Finfix Motors Tanzania",
  },
  {
    slug: "toyota-hilux-2020-double-cab",
    make: "Toyota",
    model: "Hilux Double Cab",
    year: 2020,
    price: 65000000,
    transmission: "Manual",
    fuelType: "Diesel",
    condition: "Foreign Used",
    mileage: 45000,
    color: "Silver",
    engine: "2400cc",
    description:
      "Strong and dependable Toyota Hilux Double Cab — ideal for both business and family use. Available for inspection at our yards in Dar es Salaam and Dodoma. Message us on WhatsApp for the latest price and availability.",
    status: "AVAILABLE",
    isFeatured: true,
    image: "/images/cars/hilux.jpg",
    alt: "Silver Toyota Hilux Double Cab 2020 pickup available at Finfix Motors Tanzania",
  },
  {
    slug: "toyota-corolla-2019-sedan",
    make: "Toyota",
    model: "Corolla",
    year: 2019,
    price: 32000000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Foreign Used",
    mileage: 52000,
    color: "Silver",
    engine: "1500cc",
    description:
      "Fuel-efficient Toyota Corolla in clean condition — a perfect everyday sedan. View it at our yards in Dar es Salaam and Dodoma or contact us on WhatsApp to learn more.",
    status: "AVAILABLE",
    isFeatured: true,
    image: "/images/cars/corolla.jpg",
    alt: "Silver Toyota Corolla 2019 sedan available at Finfix Motors Tanzania",
  },
  {
    slug: "nissan-x-trail-2017-suv",
    make: "Nissan",
    model: "X-Trail",
    year: 2017,
    price: 28500000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Foreign Used",
    mileage: 85000,
    color: "Grey",
    engine: "2000cc",
    description:
      "Spacious family SUV with a comfortable interior and smooth automatic transmission. Available for viewing in Dar es Salaam and Dodoma. Contact us to confirm availability.",
    status: "AVAILABLE",
    isFeatured: false,
    image: "/images/cars/xtrail.jpg",
    alt: "Grey Nissan X-Trail 2017 SUV available at Finfix Motors Tanzania",
  },
  {
    slug: "mazda-cx5-2019-suv",
    make: "Mazda",
    model: "CX-5",
    year: 2019,
    price: 36000000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Foreign Used",
    mileage: 61000,
    color: "Red",
    engine: "2200cc",
    description:
      "Stylish Mazda CX-5 with a premium feel, smooth handling and modern features. Visit us in Dar es Salaam or Dodoma to see it in person.",
    status: "AVAILABLE",
    isFeatured: false,
    image: "/images/cars/cx5.jpg",
    alt: "Red Mazda CX-5 2019 SUV available at Finfix Motors Tanzania",
  },
  {
    slug: "mercedes-benz-e200-2016-sedan",
    make: "Mercedes-Benz",
    model: "E200",
    year: 2016,
    price: 45000000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Foreign Used",
    mileage: 92000,
    color: "Black",
    engine: "2000cc",
    description:
      "Executive luxury sedan with timeless styling and a refined cabin. Available at Finfix Motors — contact us on WhatsApp to arrange a viewing.",
    status: "AVAILABLE",
    isFeatured: false,
    image: "/images/cars/e200.jpg",
    alt: "Black Mercedes-Benz E200 2016 sedan available at Finfix Motors Tanzania",
  },
  {
    slug: "toyota-harrier-2018-suv",
    make: "Toyota",
    model: "Harrier",
    year: 2018,
    price: 41000000,
    transmission: "Automatic",
    fuelType: "Hybrid",
    condition: "Foreign Used",
    mileage: 74000,
    color: "Pearl White",
    engine: "2500cc",
    description:
      "Elegant Toyota Harrier Hybrid — economical, comfortable and beautifully finished. This unit has been sold, but similar vehicles arrive regularly. Message us and we will source one for you.",
    status: "SOLD",
    isFeatured: false,
    image: "/images/cars/harrier.jpg",
    alt: "Pearl white Toyota Harrier 2018 SUV sold at Finfix Motors Tanzania",
  },
  {
    slug: "honda-fit-2017-hatchback",
    make: "Honda",
    model: "Fit",
    year: 2017,
    price: 14500000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Locally Used",
    mileage: 96000,
    color: "Grey",
    engine: "1300cc",
    description:
      "Compact, reliable and very economical — a great first car or city runabout. This unit has been sold. Contact us for similar vehicles currently in stock or on order.",
    status: "SOLD",
    isFeatured: false,
    image: "/images/cars/fit.jpg",
    alt: "Silver Honda Fit 2017 hatchback sold at Finfix Motors Tanzania",
  },
];

const ADMIN = {
  email: "admin@finfixmotors.co.tz",
  password: "Finfix2025#Motors",
  name: "Finfix Motors",
};

// ---------------------------------------------------------- DDL execution
function splitSqlStatements(raw: string): string[] {
  return raw
    .split("\n")
    .filter((line) => !line.trim().startsWith("--")) // strip comment-only lines
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function createSchema() {
  const ddlPath = path.join(process.cwd(), "scripts", "schema.sql");
  const ddl = fs.readFileSync(ddlPath, "utf8");
  const statements = splitSqlStatements(ddl);
  console.log(`Creating schema (${statements.length} statements)...`);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log("OK Schema created");
}

async function tableExists(name: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name}
  `;
  return rows.length > 0;
}

async function seed() {
  // ------------------------------------------------------------- settings
  await sql`
    INSERT INTO "SiteSetting" (
      "id", "businessName", "tagline", "phone", "whatsappNumber", "email",
      "address", "landmark", "instagram", "heroTitle", "heroSubtitle",
      "aboutTitle", "aboutText", "mapQuery", "updatedAt"
    ) VALUES (
      'main', ${SETTINGS.businessName}, ${SETTINGS.tagline},
      ${SETTINGS.phone}, ${SETTINGS.whatsappNumber}, ${SETTINGS.email},
      ${SETTINGS.address}, ${SETTINGS.landmark}, ${SETTINGS.instagram},
      ${SETTINGS.heroTitle}, ${SETTINGS.heroSubtitle},
      ${SETTINGS.aboutTitle}, ${SETTINGS.aboutText}, ${SETTINGS.mapQuery}, now()
    )
    ON CONFLICT ("id") DO UPDATE SET
      "businessName" = ${SETTINGS.businessName},
      "tagline" = ${SETTINGS.tagline},
      "phone" = ${SETTINGS.phone},
      "whatsappNumber" = ${SETTINGS.whatsappNumber},
      "address" = ${SETTINGS.address},
      "landmark" = ${SETTINGS.landmark},
      "heroTitle" = ${SETTINGS.heroTitle},
      "heroSubtitle" = ${SETTINGS.heroSubtitle},
      "aboutTitle" = ${SETTINGS.aboutTitle},
      "aboutText" = ${SETTINGS.aboutText},
      "mapQuery" = ${SETTINGS.mapQuery},
      "updatedAt" = now()
  `;
  console.log("OK Site settings (Finfix Motors Limited)");

  // ------------------------------------------------------------- services
  const [serviceRow] = (await sql`SELECT count(*)::int AS n FROM "Service"`) as { n: number }[];
  if (serviceRow.n === 0) {
    for (const s of SERVICES) {
      await sql`
        INSERT INTO "Service" ("id", "title", "description", "icon", "sortOrder", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${s.title}, ${s.description}, ${s.icon}, ${s.sortOrder}, true, now(), now())
      `;
    }
    console.log(`OK Services (${SERVICES.length})`);
  } else {
    console.log(`SKIP Services (${serviceRow.n} already exist)`);
  }

  // ------------------------------------------------------------- vehicles
  const [vehicleRow] = (await sql`SELECT count(*)::int AS n FROM "Vehicle"`) as { n: number }[];
  if (vehicleRow.n === 0) {
    for (const v of VEHICLES) {
      const [inserted] = (await sql`
        INSERT INTO "Vehicle" (
          "id", "slug", "make", "model", "year", "price", "transmission",
          "fuelType", "condition", "mileage", "color", "engine", "description",
          "status", "isFeatured", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, ${v.slug}, ${v.make}, ${v.model}, ${v.year},
          ${v.price}, ${v.transmission}, ${v.fuelType}, ${v.condition},
          ${v.mileage}, ${v.color}, ${v.engine}, ${v.description},
          ${v.status}, ${v.isFeatured}, now(), now()
        )
        RETURNING "id"
      `) as { id: string }[];
      const vehicleId = inserted.id;
      await sql`
        INSERT INTO "VehicleImage" ("id", "vehicleId", "url", "altText", "sortOrder")
        VALUES (gen_random_uuid()::text, ${vehicleId}, ${v.image}, ${v.alt}, 0)
      `;
    }
    console.log(`OK Vehicles (${VEHICLES.length} sample listings with photos)`);
  } else {
    console.log(`SKIP Vehicles (${vehicleRow.n} already exist)`);
  }

  // --------------------------------------------------------------- admin
  const [adminRow] = (await sql`SELECT count(*)::int AS n FROM "AdminUser"`) as { n: number }[];
  if (adminRow.n === 0) {
    const passwordHash = await bcrypt.hash(ADMIN.password, 12);
    await sql`
      INSERT INTO "AdminUser" ("id", "email", "passwordHash", "name", "role", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${ADMIN.email}, ${passwordHash}, ${ADMIN.name}, 'SUPERADMIN', now(), now())
    `;
    console.log(`OK Admin created: ${ADMIN.email} / ${ADMIN.password} (SUPERADMIN)`);
  } else {
    console.log(`SKIP Admin (${adminRow.n} already exist)`);
  }
}

async function verify() {
  const [counts] = (await sql`SELECT
      (SELECT count(*)::int FROM "Vehicle") AS vehicles,
      (SELECT count(*)::int FROM "VehicleImage") AS images,
      (SELECT count(*)::int FROM "Service") AS services,
      (SELECT count(*)::int FROM "SiteSetting") AS settings,
      (SELECT count(*)::int FROM "AdminUser") AS admins`) as Record<string, number>[];
  const [settings] = await sql`SELECT "businessName", "phone", "address", "heroSubtitle" FROM "SiteSetting" WHERE "id" = 'main'`;
  console.log("\nVerification:");
  console.log(`  ${JSON.stringify(counts)}`);
  console.log(`  settings: ${JSON.stringify(settings)}`);
}

async function main() {
  console.log("FINFIX MOTORS — Neon database setup");

  if (!(await tableExists("Vehicle"))) {
    await createSchema();
  } else {
    console.log("Schema already exists — skipping DDL");
  }

  await seed();
  await verify();
  console.log("\nSetup complete.");
}

main().catch((e) => {
  console.error("Setup failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
