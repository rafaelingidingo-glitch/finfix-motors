/**
 * ELLY MAGARI — Database seed
 *
 * Seeds: site settings (real business info), the four real business services,
 * and SAMPLE inventory listings with placeholder prices so the site can be
 * demonstrated end-to-end. Sample vehicles are editable/deletable from the
 * admin dashboard — replace them with real inventory before going live.
 *
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEFAULT_ABOUT =
  "Elly Magari is a car dealership based in Pasiansi, Mwanza, Tanzania. We buy and sell quality vehicles, import cars on customer orders, provide reliable vehicle transportation across the country, and buy vehicles directly from owners. Visit our yard opposite Lenana Hotel — our team is ready to help you find your next car.";

async function main() {
  console.log("Seeding database...");

  // ------------------------------------------------------------------ settings
  await db.siteSetting.upsert({
    where: { id: "main" },
    update: {},
    create: {
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
      heroSubtitle: "Quality Cars. Trusted Service. Your Journey Starts With Us.",
      aboutTitle: "About Elly Magari",
      aboutText: DEFAULT_ABOUT,
      mapQuery: "Pasiansi, Mwanza, Tanzania",
    },
  });
  console.log("✔ Site settings");

  // ------------------------------------------------------------------ services
  const services = [
    {
      title: "Buying & Selling Cars",
      description:
        "Explore a rotating selection of quality vehicles at our Pasiansi yard in Mwanza. Browse, inspect, and drive away in your next car with a team that keeps the process simple and transparent.",
      icon: "car",
      sortOrder: 1,
    },
    {
      title: "Vehicle Importation",
      description:
        "Tell us the exact car you want and we handle the import process on your behalf — sourcing, shipping and delivery to Mwanza, with updates at every step until your vehicle arrives.",
      icon: "ship",
      sortOrder: 2,
    },
    {
      title: "Vehicle Transportation",
      description:
        "Safe and reliable vehicle transportation across Mwanza and throughout Tanzania. Your vehicle is handled with care and delivered where you need it.",
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
  const existingServices = await db.service.count();
  if (existingServices === 0) {
    await db.service.createMany({ data: services });
  }
  console.log("✔ Services");

  // ------------------------------------------------------------------ vehicles
  const sampleVehicles = [
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
        "Well-maintained Toyota Land Cruiser Prado TX-L available for viewing at our Pasiansi yard in Mwanza. Famous for its reliability and comfort on Tanzanian roads. Contact us on WhatsApp to confirm current availability and to arrange a visit.",
      status: "AVAILABLE",
      isFeatured: true,
      image: "/images/cars/prado.jpg",
      alt: "White Toyota Land Cruiser Prado TX-L 2018 SUV available at Elly Magari Mwanza",
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
        "Strong and dependable Toyota Hilux Double Cab — ideal for both business and family use. Available for inspection at our yard in Pasiansi, Mwanza. Message us on WhatsApp for the latest price and availability.",
      status: "AVAILABLE",
      isFeatured: true,
      image: "/images/cars/hilux.jpg",
      alt: "Silver Toyota Hilux Double Cab 2020 pickup available at Elly Magari Mwanza",
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
        "Fuel-efficient Toyota Corolla in clean condition — a perfect everyday sedan. View it at our Pasiansi yard in Mwanza or contact us on WhatsApp to learn more.",
      status: "AVAILABLE",
      isFeatured: true,
      image: "/images/cars/corolla.jpg",
      alt: "Silver Toyota Corolla 2019 sedan available at Elly Magari Mwanza",
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
        "Spacious family SUV with a comfortable interior and smooth automatic transmission. Available for viewing in Pasiansi, Mwanza. Contact us to confirm availability.",
      status: "AVAILABLE",
      isFeatured: false,
      image: "/images/cars/xtrail.jpg",
      alt: "Grey Nissan X-Trail 2017 SUV available at Elly Magari Mwanza",
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
        "Stylish Mazda CX-5 with a premium feel, smooth handling and modern features. Visit our yard opposite Lenana Hotel, Pasiansi, Mwanza to see it in person.",
      status: "AVAILABLE",
      isFeatured: false,
      image: "/images/cars/cx5.jpg",
      alt: "Red Mazda CX-5 2019 SUV available at Elly Magari Mwanza",
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
        "Executive luxury sedan with timeless styling and a refined cabin. Available at Elly Magari in Pasiansi, Mwanza — contact us on WhatsApp to arrange a viewing.",
      status: "AVAILABLE",
      isFeatured: false,
      image: "/images/cars/e200.jpg",
      alt: "Black Mercedes-Benz E200 2016 sedan available at Elly Magari Mwanza",
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
      alt: "Pearl white Toyota Harrier 2018 SUV sold at Elly Magari Mwanza",
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
      alt: "Silver Honda Fit 2017 hatchback sold at Elly Magari Mwanza",
    },
  ];

  const existingVehicles = await db.vehicle.count();
  if (existingVehicles === 0) {
    for (const v of sampleVehicles) {
      await db.vehicle.create({
        data: {
          slug: v.slug,
          make: v.make,
          model: v.model,
          year: v.year,
          price: v.price,
          transmission: v.transmission,
          fuelType: v.fuelType,
          condition: v.condition,
          mileage: v.mileage,
          color: v.color,
          engine: v.engine,
          description: v.description,
          status: v.status,
          isFeatured: v.isFeatured,
          images: {
            create: [{ url: v.image, altText: v.alt, sortOrder: 0 }],
          },
        },
      });
    }
  }
  console.log(`✔ Vehicles (${sampleVehicles.length} sample listings)`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
