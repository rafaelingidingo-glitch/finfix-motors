import { Instagram, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/settings";

/**
 * Slim top contact bar shown above the main header on every public page.
 * It scrolls away naturally while the header below stays sticky.
 */
export function ContactBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="bg-charcoal text-white/80" role="region" aria-label="Quick contact">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-xs sm:justify-between sm:px-6 lg:px-8">
        {/* Location (desktop only) */}
        <p className="hidden items-center gap-1.5 sm:flex">
          <MapPin className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
          {settings.address} — {settings.landmark}
        </p>

        {/* Phone / WhatsApp / Instagram */}
        <div className="flex items-center gap-x-5 sm:gap-x-6">
          <a
            href={`tel:${settings.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-medium transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-label={`Call ${settings.businessName} at ${settings.phone}`}
          >
            <Phone className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            {settings.phone}
          </a>

          <a
            href={generalWhatsAppUrl(settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-label={`WhatsApp ${settings.businessName}`}
          >
            <WhatsAppIcon className="size-3.5 shrink-0 text-gold" />
            WhatsApp
          </a>

          {settings.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 font-medium transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:flex"
              aria-label={`${settings.businessName} on Instagram`}
            >
              <Instagram className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
