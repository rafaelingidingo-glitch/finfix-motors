"use client";

import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons/whatsapp";

/**
 * Floating WhatsApp button shown on every public page.
 * Anchored bottom-right, always accessible.
 */
export function WhatsAppFloat({ number }: { number: string }) {
  return (
    <a
      href={generalWhatsAppUrl(number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Finfix Motors on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
