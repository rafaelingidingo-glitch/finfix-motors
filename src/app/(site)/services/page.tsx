import type { Metadata } from "next";
import Link from "next/link";
import { Car, HandCoins, Ship, Truck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { FinalCta } from "@/components/public/final-cta";
import { getActiveServices } from "@/lib/services-data";
import { getSiteSettings } from "@/lib/settings";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Vehicle buying and selling, importation on order, reliable transportation across Tanzania and instant car buying — Elly Magari, Pasiansi, Mwanza.",
};

const SERVICE_ICONS: Record<string, LucideIcon> = {
  car: Car,
  ship: Ship,
  truck: Truck,
  "hand-coins": HandCoins,
};

function getServiceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key] ?? Car;
}

/** Public services page — alternating rows for each active service. */
export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getActiveServices(), getSiteSettings()]);

  return (
    <main id="main-content">
      {/* Compact dark hero band */}
      <section className="bg-charcoal py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="text-white/70 hover:text-white">
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[&>svg]:text-white/50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gold">Our Services</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Our Services
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            Buying, selling, importing and transporting vehicles across Tanzania.
          </p>
        </div>
      </section>

      {/* Alternating service rows */}
      {services.map((service, index) => {
        const Icon = getServiceIcon(service.icon);
        const isEvenRow = index % 2 === 0;
        const content = (
          <div>
            <span className="flex size-16 items-center justify-center rounded-2xl bg-charcoal text-gold">
              <Icon className="size-8" aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              {service.title}
            </h2>
            <div className="mt-4 h-0.5 w-14 rounded-full bg-gold" aria-hidden="true" />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {service.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 bg-gold text-charcoal hover:bg-gold/90">
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11"
                aria-label={`WhatsApp us about ${service.title}`}
              >
                <a
                  href={generalWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-4" aria-hidden="true" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        );
        const decorative = (
          <div
            className="relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl border border-gold/30 bg-gold-tint p-8"
            aria-hidden="true"
          >
            <span className="font-display text-6xl font-extrabold leading-none text-gold sm:text-7xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-8 flex size-20 items-center justify-center rounded-2xl bg-charcoal text-gold shadow-lg">
              <Icon className="size-10" />
            </span>
            <span className="absolute -right-10 -top-10 size-40 rounded-full border border-gold/25" />
            <span className="absolute -bottom-12 -left-8 size-32 rounded-full border border-gold/25" />
          </div>
        );

        return (
          <section
            key={service.id}
            className={isEvenRow ? "bg-card" : "bg-background"}
            aria-label={service.title}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16">
                {isEvenRow ? (
                  <>
                    {content}
                    {decorative}
                  </>
                ) : (
                  <>
                    <div className="lg:order-2">{decorative}</div>
                    <div className="lg:order-1">{content}</div>
                  </>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Final CTA band */}
      <FinalCta whatsappNumber={settings.whatsappNumber} />
    </main>
  );
}
