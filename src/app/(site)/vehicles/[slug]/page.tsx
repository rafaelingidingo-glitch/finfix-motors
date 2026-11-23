import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Calendar,
  Cog,
  Fuel,
  Gauge,
  Palette,
  Phone,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VehicleCard } from "@/components/site/vehicle-card";
import { VehicleWhatsAppButton } from "@/components/site/vehicle-whatsapp-button";
import { SectionHeading } from "@/components/site/section-heading";
import { VehicleGallery } from "@/components/public/vehicle-gallery";
import { formatMileage, formatTZS } from "@/lib/format";
import { getRelatedVehicles, getVehicleBySlug } from "@/lib/vehicles";
import { getSiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/site/json-ld";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: "Vehicle Not Found",
      description: "The vehicle you are looking for could not be found.",
    };
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const raw = vehicle.description?.trim() ?? "";
  const description =
    raw.length > 0
      ? raw.length > 160
        ? `${raw.slice(0, 157)}...`
        : raw
      : "View this vehicle at Finfix Motors, Tanzania.";

  const mainImage = vehicle.images[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: mainImage
        ? [{ url: mainImage.url, alt: mainImage.altText ?? title }]
        : undefined,
    },
  };
}

/* ------------------------------------------------------------------ */

type SpecRow = { icon: LucideIcon; label: string; value: string };

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    getRelatedVehicles(vehicle, 3),
  ]);

  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const isSold = vehicle.status === "SOLD";
  const mainImage = vehicle.images[0];

  /* Quick specs for the info panel (null rows skipped) */
  const quickSpecs: SpecRow[] = [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    ...(vehicle.mileage != null
      ? [{ icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) }]
      : []),
    { icon: BadgeCheck, label: "Condition", value: vehicle.condition },
    ...(vehicle.color ? [{ icon: Palette, label: "Color", value: vehicle.color }] : []),
    ...(vehicle.engine ? [{ icon: Cog, label: "Engine", value: vehicle.engine }] : []),
  ];

  /* Full specification table (only non-null rows) */
  const specRows: { label: string; value: string }[] = [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Year", value: String(vehicle.year) },
    { label: "Price", value: formatTZS(vehicle.price) },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Fuel Type", value: vehicle.fuelType },
    { label: "Condition", value: vehicle.condition },
    ...(vehicle.mileage != null
      ? [{ label: "Mileage", value: formatMileage(vehicle.mileage) }]
      : []),
    ...(vehicle.color ? [{ label: "Color", value: vehicle.color }] : []),
    ...(vehicle.engine ? [{ label: "Engine", value: vehicle.engine }] : []),
  ];

  /* Vehicle structured data (schema.org) */
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: vehicleTitle,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    ...(vehicle.mileage != null
      ? { mileageFromOdometer: `${vehicle.mileage} km` }
      : {}),
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "TZS",
      availability: isSold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    ...(mainImage ? { image: mainImage.url } : {}),
    url: `${SITE_URL}/vehicles/${vehicle.slug}`,
  };

  return (
    <main id="main-content">

      {/* Compact dark band with breadcrumb */}
      <section className="bg-charcoal py-6 text-white sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-white/70 hover:text-white"
                >
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:text-white/50" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-white/70 hover:text-white"
                >
                  <Link href="/inventory">Inventory</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:text-white/50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-brand-soft">{vehicleTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Gallery + info panel */}
      <section className="py-10 sm:py-14" aria-label="Vehicle details">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              <VehicleGallery
                images={vehicle.images.map((img) => ({
                  id: img.id,
                  url: img.url,
                  altText: img.altText,
                }))}
                title={vehicleTitle}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {vehicleTitle}
                  </h1>
                  <Badge
                    className={cn(
                      "mt-1 shrink-0 border-none px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      isSold ? "bg-charcoal text-white" : "bg-brand text-white"
                    )}
                  >
                    {isSold ? "Sold" : "Available"}
                  </Badge>
                </div>

                <p className="mt-2 font-display text-2xl font-bold text-brand sm:text-3xl">
                  {formatTZS(vehicle.price)}
                </p>

                {/* Quick specs */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {quickSpecs.map((spec) => (
                    <div key={spec.label} className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                        <spec.icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {spec.label}
                        </p>
                        <p className="truncate text-sm font-semibold">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {vehicle.description?.trim() && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {vehicle.description.trim()}
                  </p>
                )}

                {isSold && (
                  <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                    This vehicle has been sold. Contact us for similar vehicles.
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  <VehicleWhatsAppButton
                    number={settings.whatsappNumber}
                    vehicle={{
                      make: vehicle.make,
                      model: vehicle.model,
                      year: vehicle.year,
                      price: vehicle.price,
                      status: vehicle.status,
                      slug: vehicle.slug,
                    }}
                    variant="full"
                    className="h-11"
                  />
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full"
                    aria-label={`Call Finfix Motors at ${settings.phone}`}
                  >
                    <a href={`tel:${settings.phone}`}>
                      <Phone className="size-4" aria-hidden="true" />
                      Call Us — {settings.phone}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full specifications */}
      <section className="pb-14 sm:pb-20" aria-label="Vehicle specifications">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Details"
            title="Vehicle Specifications"
          />
          <Card className="mt-8 p-5 sm:p-6">
            <dl className="grid gap-x-10 sm:grid-cols-2">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-b-0 sm:last:border-b"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="text-right text-sm font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </section>

      {/* Related vehicles */}
      {related.length > 0 && (
        <section className="pb-16 sm:pb-24" aria-label="Related vehicles">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              align="left"
              eyebrow="Continue Browsing"
              title="You May Also Like"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {related.map((relatedVehicle) => (
                <VehicleCard
                  key={relatedVehicle.id}
                  vehicle={relatedVehicle}
                  whatsappNumber={settings.whatsappNumber}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd id="vehicle-jsonld" data={jsonLd} />
    </main>
  );
}
