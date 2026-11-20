import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  HandCoins,
  Handshake,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Ship,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { FinalCta } from "@/components/public/final-cta";
import { getActiveServices } from "@/lib/services-data";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Elly Magari — a car dealership in Pasiansi, Mwanza, Tanzania offering vehicle sales, imports, transportation and instant car buying.",
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

type Commitment = {
  title: string;
  text: string;
  icon: LucideIcon;
};

const COMMITMENTS: Commitment[] = [
  {
    title: "Honest Guidance",
    text: "We give clear, straightforward advice so you can choose the right vehicle with confidence.",
    icon: ShieldCheck,
  },
  {
    title: "Clear Communication",
    text: "From inquiry to delivery, we keep you informed at every step.",
    icon: MessagesSquare,
  },
  {
    title: "Customer First",
    text: "Your needs come first — before, during and after the sale.",
    icon: Handshake,
  },
];

/** Public about page — who we are, what we do and our commitments. */
export default async function AboutPage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getActiveServices()]);

  return (
    <main id="main-content">
      {/* Compact dark hero band */}
      <section className="bg-charcoal py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Elly Magari
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            About Us
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            {settings.tagline}
          </p>
        </div>
      </section>

      {/* Intro: story + showroom photo */}
      <section className="py-14 sm:py-20" aria-label="Who we are">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Who We Are
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl lg:text-4xl">
                {settings.aboutTitle}
              </h2>
              <div className="mt-4 h-0.5 w-14 rounded-full bg-gold" aria-hidden="true" />
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {settings.aboutText}
              </p>
              <p className="mt-6 font-display text-sm font-semibold italic">
                — Elly Magari Team, Pasiansi, Mwanza
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src="/images/about-showroom.jpg"
                alt="Inside the Elly Magari car dealership showroom in Mwanza"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-14 sm:py-20" aria-label="What we do">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Work"
            title="What We Do"
            description="Four core services, one trusted team at your service in Mwanza."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = getServiceIcon(service.icon);
              return (
                <article
                  key={service.id}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-charcoal text-gold">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold">{service.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our commitment */}
      <section className="bg-card py-14 sm:py-20" aria-label="Our commitment">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Values"
            title="Our Commitment"
            description="What you can expect from us on every visit, call and delivery."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {COMMITMENTS.map((commitment) => (
              <article
                key={commitment.title}
                className="rounded-xl border border-border bg-background p-6"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-gold-tint text-gold">
                  <commitment.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{commitment.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {commitment.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Location strip */}
      <section className="py-14 sm:py-20" aria-label="Visit our yard">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-gold/30 bg-gold-tint px-6 py-8 text-center sm:flex-row sm:justify-between sm:gap-8 sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-charcoal text-gold">
                <MapPin className="size-6" aria-hidden="true" />
              </span>
              <p className="text-sm text-muted-foreground sm:text-base">
                <span className="font-semibold text-foreground">Visit our yard:</span>{" "}
                {settings.address} — {settings.landmark}
              </p>
            </div>
            <Button
              asChild
              className="h-11 shrink-0 bg-charcoal text-white hover:bg-charcoal/90"
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <FinalCta whatsappNumber={settings.whatsappNumber} />
    </main>
  );
}
