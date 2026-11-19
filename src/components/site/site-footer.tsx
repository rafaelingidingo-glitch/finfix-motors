import Image from "next/image";
import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/settings";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Vehicle Inventory" },
  { href: "/services", label: "Our Services" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const SERVICE_LINKS = [
  { href: "/services", label: "Buying & Selling Cars" },
  { href: "/services", label: "Vehicle Importation" },
  { href: "/services", label: "Vehicle Transportation" },
  { href: "/services", label: "We Buy Your Car" },
];

/** Site footer — sticks to the bottom via flex layout in the shell. */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-charcoal text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/elly-magari-logo.jpg"
                alt={`${settings.businessName} logo`}
                width={48}
                height={48}
                className="size-12 rounded-lg object-cover"
              />
              <span className="font-display text-lg font-bold tracking-wide text-white">
                {settings.businessName.toUpperCase()}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {settings.address} — {settings.landmark}. Buying and selling quality vehicles,
              importing cars on customer orders, and reliable vehicle transportation across
              Tanzania.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Our Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 transition-colors hover:text-gold"
                >
                  <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  href={generalWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-gold"
                >
                  <WhatsAppIcon className="size-4 shrink-0 text-gold" />
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  {settings.address}
                  <br />
                  <span className="text-white/60">{settings.landmark}</span>
                </span>
              </li>
              {settings.instagram && (
                <li>
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 transition-colors hover:text-gold"
                  >
                    <Instagram className="size-4 shrink-0 text-gold" aria-hidden="true" />
                    Instagram: Elly Magari
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {settings.businessName}. All rights reserved.
          </p>
          <p>
            Car dealership in {settings.address} — {settings.landmark}.
          </p>
        </div>
      </div>
    </footer>
  );
}
