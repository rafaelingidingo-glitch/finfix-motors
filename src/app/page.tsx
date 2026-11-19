import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Car as CarIcon,
  HandCoins,
  Phone,
  Ship,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { VehicleCard } from "@/components/site/vehicle-card";
import { SiteShell } from "@/components/site/site-shell";
import { HeroCarousel, type HeroVehicle } from "@/components/site/hero-carousel";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { JsonLd } from "@/components/site/json-ld";
import { getFeaturedVehicles, getLatestVehicles } from "@/lib/vehicles";
import { getActiveServices } from "@/lib/services-data";
import { getSiteSettings } from "@/lib/settings";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const SERVICE_ICONS = {
  car: CarIcon,
  ship: Ship,
  truck: Truck,
  "hand-coins": HandCoins,
} as const;

const WHY_CHOOSE = [
  {
    title: "Local Expertise in Mwanza",
    text: "Based in Pasiansi, Mwanza, we understand the local market and which vehicles suit Tanzanian roads and conditions.",
  },
  {
    title: "Import Made Simple",
    text: "Tell us the car you need and our team manages sourcing, shipping and delivery — keeping you updated at every step.",
  },
  {
    title: "Straightforward Process",
    text: "From first inquiry to ownership, we keep things clear, honest and pressure-free. Visit our yard and see the vehicles yourself.",
  },
  {
    title: "We Also Buy Your Car",
    text: "Skip the hassle of selling privately — get a direct, fair offer from Elly Magari for your current vehicle.",
  },
];

export default async function HomePage() {
  const [settings, services, featuredRaw, latest] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
    getFeaturedVehicles(5),
    getLatestVehicles(4),
  ]);

  // Hero showcase: featured + available vehicles only (dynamic, no fake data).
  const heroVehicles: HeroVehicle[] = featuredRaw.map((vehicle) => ({
    id: vehicle.id,
    slug: vehicle.slug,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    mileage: vehicle.mileage,
    price: vehicle.price,
    status: vehicle.status,
    imageUrl: vehicle.images[0]?.url ?? null,
    imageAlt: vehicle.images[0]?.altText ?? null,
  }));

  let featured = featuredRaw.slice(0, 3);
  if (featured.length === 0) {
    featured = latest.slice(0, 3);
  }

  // LocalBusiness / AutoDealer structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.businessName,
    description:
      "Car dealership in Pasiansi, Mwanza, Tanzania. Buying and selling vehicles, vehicle importation on customer orders, vehicle transportation, and buying vehicles directly from customers.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    telephone: settings.phone,
    image: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/images/elly-magari-logo.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pasiansi",
      addressLocality: "Mwanza",
      addressCountry: "TZ",
    },
    areaServed: ["Mwanza", "Tanzania"],
    sameAs: settings.instagram ? [settings.instagram] : undefined,
  };

  return (
    <SiteShell>
      {/* ---------------------------------------------------------- HERO */}
      <section
        className="relative -mt-16 overflow-hidden bg-charcoal"
        aria-labelledby="hero-heading"
      >
        {/* Ambient depth */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 -top-32 size-[26rem] rounded-full bg-gold/10 blur-[110px]" />
          <div className="absolute -bottom-40 -right-28 size-[30rem] rounded-full bg-gold/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.08),transparent_55%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:grid-cols-[2fr_3fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-36">
          {/* Copy */}
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
              Elly Magari
            </p>
            <h1
              id="hero-heading"
              className="mt-4 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl"
            >
              {settings.heroTitle}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              {settings.heroSubtitle}
            </p>

            {/* Service highlights */}
            <ul
              className="mt-7 flex flex-wrap gap-2"
              aria-label="Our services"
            >
              {[
                { icon: CarIcon, label: "Buy" },
                { icon: HandCoins, label: "Sell" },
                { icon: Ship, label: "Import" },
                { icon: Truck, label: "Transport" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/85"
                >
                  <item.icon className="size-3.5 text-gold" aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Featured vehicle showcase */}
          <HeroCarousel
            vehicles={heroVehicles}
            whatsappNumber={settings.whatsappNumber}
          />
        </div>
      </section>

      {/* ----------------------------------------------------- TRUST BAR */}
      <section className="border-b border-border bg-card" aria-label="What we do">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: CarIcon, title: "Quality Vehicles", text: "Hand-picked cars ready for viewing" },
            { icon: Ship, title: "Import on Order", text: "We import vehicles on customer orders" },
            { icon: Truck, title: "Vehicle Transport", text: "Reliable delivery across Tanzania" },
            { icon: HandCoins, title: "We Buy Cars", text: "Sell your vehicle directly to us" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold-tint text-gold">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------- FEATURED VEHICLES */}
      <section className="py-14 sm:py-20" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Showroom"
            title="Featured Vehicles"
            description="A selection of vehicles currently highlighted by our team. Visit our Pasiansi yard to view them in person."
          />
          {featured.length > 0 ? (
            <>
              <div className="mt-10 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    whatsappNumber={settings.whatsappNumber}
                  />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 border-charcoal bg-transparent px-8 text-charcoal hover:bg-charcoal hover:text-white"
                >
                  <Link href="/inventory">
                    View All Vehicles
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                New vehicles arrive regularly. Contact us on WhatsApp for the latest available
                stock.
              </p>
              <Button asChild className="mt-4 bg-charcoal text-white hover:bg-charcoal/90">
                <a
                  href={generalWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-4" />
                  Ask About Available Cars
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ SERVICES */}
      <section className="bg-card py-14 sm:py-20" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Do"
            title="Our Services"
            description="From finding the right car to delivering it to your door — Elly Magari supports every step of your vehicle journey."
          />
          <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = SERVICE_ICONS[service.icon as keyof typeof SERVICE_ICONS] ?? CarIcon;
              return (
                <article
                  key={service.id}
                  className="group flex h-full flex-col rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-charcoal text-gold transition-colors group-hover:bg-gold group-hover:text-charcoal">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    Contact Us
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- WHY CHOOSE */}
      <section className="py-14 sm:py-20" aria-labelledby="why-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/images/about-showroom.jpg"
                alt="Inside the Elly Magari car dealership showroom in Mwanza"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-xl border border-gold/30 bg-charcoal px-5 py-4 text-white shadow-xl sm:left-8 sm:right-auto sm:max-w-xs">
              <p className="flex items-center gap-2 text-sm font-semibold text-gold">
                <BadgeCheck className="size-4" aria-hidden="true" />
                Your Journey Starts With Us
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                Visit our yard in Pasiansi, Mwanza — opposite Lenana Hotel.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="Why Elly Magari"
              title="Why Choose Elly Magari?"
              description="A trusted partner for buying, selling and importing vehicles in Mwanza and across Tanzania."
            />
            <ul className="mt-8 space-y-5">
              {WHY_CHOOSE.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-tint font-display text-sm font-bold text-gold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ RECENTLY ADDED */}
      {latest.length > 0 && (
        <section className="bg-card py-14 sm:py-20" aria-labelledby="recent-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                eyebrow="Fresh Stock"
                title="Recently Added Cars"
                description="The latest vehicles to arrive at our yard."
              />
              <Button
                asChild
                variant="ghost"
                className="shrink-0 text-gold hover:bg-gold-tint hover:text-gold"
              >
                <Link href="/inventory">
                  View Inventory
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  whatsappNumber={settings.whatsappNumber}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ CTA BAND */}
      <section className="relative overflow-hidden bg-charcoal py-16 sm:py-20" aria-labelledby="cta-heading">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-gold/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 id="cta-heading" className="font-display text-2xl font-bold uppercase text-white sm:text-3xl lg:text-4xl">
            Ready to Find Your Next Car?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
            Visit us at Pasiansi, Mwanza — opposite Lenana Hotel — or reach out directly. Our team
            is ready to help you buy, sell or import your next vehicle.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gold px-8 text-charcoal hover:bg-gold/90"
            >
              <a
                href={generalWhatsAppUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-5" />
                WhatsApp Us
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/40 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/contact">
                <Phone className="size-4" aria-hidden="true" />
                Contact Page
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* AutoDealer structured data for local SEO */}
      <JsonLd id="auto-dealer-jsonld" data={jsonLd} />
    </SiteShell>
  );
}
