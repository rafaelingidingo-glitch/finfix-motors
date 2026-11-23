import Image from "next/image";
import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";
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

/** Real branch contacts — Finfix Motors serves two regions. */
const BRANCHES = [
  { city: "Dar es Salaam", phoneDisplay: "0650 090 909", tel: "+255650090909" },
  { city: "Dodoma", phoneDisplay: "0650 050 505", tel: "+255650050505" },
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
                src="/images/finfix-logo.jpg"
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
              Waagizaji wa Magari Aina Yote — {settings.address}. Buying and selling quality
              vehicles, importing cars on customer orders, and reliable vehicle transportation
              across Tanzania. Exceptional Service, Extraordinary Vehicle.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-soft">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-soft">
              Our Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-soft">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={generalWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-brand-soft"
                >
                  <WhatsAppIcon className="size-4 shrink-0 text-brand-soft" />
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </li>
              {BRANCHES.map((branch) => (
                <li key={branch.city}>
                  <a
                    href={`tel:${branch.tel}`}
                    className="flex items-center gap-3 transition-colors hover:text-brand-soft"
                  >
                    <MapPin className="size-4 shrink-0 text-brand-soft" aria-hidden="true" />
                    <span>
                      {branch.city}
                      <br />
                      <span className="text-white/80">{branch.phoneDisplay}</span>
                    </span>
                  </a>
                </li>
              ))}
              {settings.instagram && (
                <li>
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 transition-colors hover:text-brand-soft"
                  >
                    <Instagram className="size-4 shrink-0 text-brand-soft" aria-hidden="true" />
                    Instagram
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
            Waagizaji wa Magari Aina Yote — {settings.address}.
          </p>
        </div>
      </div>
    </footer>
  );
}
