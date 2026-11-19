import type { Metadata } from "next";
import Link from "next/link";
import { Instagram, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { ContactForm } from "@/components/public/contact-form";
import { getSiteSettings } from "@/lib/settings";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Elly Magari in Pasiansi, Mwanza, Tanzania — call, WhatsApp, visit our yard opposite Lenana Hotel, or send us a message online.",
};

type ContactCard = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Primary link target; when set the value becomes a link. */
  href?: string;
  external?: boolean;
  linkText?: string;
  value: string;
  sub?: string;
};

/** Public contact page — info cards, message form and location map. */
export default async function ContactPage() {
  const settings = await getSiteSettings();

  const instagramHandle = settings.instagram
    ? settings.instagram.replace(/\/+$/, "").split("/").pop()
    : null;

  const cards: ContactCard[] = [
    {
      key: "phone",
      label: "Call Us",
      icon: Phone,
      href: `tel:${settings.phone}`,
      linkText: settings.phone,
      value: settings.phone,
      sub: "Talk directly with our team during business visits.",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: WhatsAppIcon,
      href: generalWhatsAppUrl(settings.whatsappNumber),
      external: true,
      linkText: "Chat with us now",
      value: settings.whatsappNumber,
      sub: "Fastest way to reach us — send us a message anytime.",
    },
    {
      key: "location",
      label: "Visit Our Yard",
      icon: MapPin,
      value: settings.address,
      sub: settings.landmark,
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: Instagram,
      href: settings.instagram || undefined,
      external: true,
      linkText: instagramHandle ? `@${instagramHandle}` : "Follow us on Instagram",
      value: settings.instagram,
      sub: "See our latest arrivals and updates.",
    },
  ];

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.mapQuery)}`;

  return (
    <main id="main-content">
      {/* Compact dark hero band */}
      <section className="bg-charcoal py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Elly Magari
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Contact Us
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            Visit our yard or reach out — we are ready to help.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-10 sm:py-14" aria-label="Contact options">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {cards.map((card) => (
              <article key={card.key} className="h-full">
                <Card className="h-full p-5 transition-shadow hover:shadow-lg sm:p-6">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-gold text-charcoal">
                    <card.icon className="size-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 font-display text-base font-bold uppercase tracking-tight">
                    {card.label}
                  </h2>
                  {card.href ? (
                    <a
                      href={card.href}
                      {...(card.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline-offset-2 hover:underline"
                    >
                      {card.linkText}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-sm font-semibold">{card.value}</p>
                  )}
                  {card.sub && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {card.sub}
                    </p>
                  )}
                </Card>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Form + location map */}
      <section className="pb-14 sm:pb-20" aria-label="Send a message and find our yard">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Message form */}
            <div className="lg:col-span-3">
              <SectionHeading
                align="left"
                eyebrow="Get in Touch"
                title="Send Us a Message"
                description="Fill in the form below and our team will get back to you as soon as possible."
              />
              <Card className="mt-8 p-5 sm:p-6">
                <ContactForm whatsappNumber={settings.whatsappNumber} />
              </Card>
            </div>

            {/* Location + map */}
            <div className="lg:col-span-2">
              <SectionHeading
                align="left"
                eyebrow="Find Us"
                title="Visit Our Yard"
                description="Drop by for a viewing, inspection or a friendly chat about vehicles."
              />
              <Card className="mt-8 overflow-hidden p-0">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&z=14&output=embed`}
                  className="h-72 w-full border-0"
                  title="Map — Elly Magari location, Pasiansi Mwanza"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-gold"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {settings.address} — {settings.landmark}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="h-11 w-full bg-charcoal text-white hover:bg-charcoal/90"
                    aria-label="Open directions to Elly Magari in Google Maps"
                  >
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="size-4" aria-hidden="true" />
                      Get Directions
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full border-[#25D366]/50 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 hover:text-[#0f7a6b]"
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
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
