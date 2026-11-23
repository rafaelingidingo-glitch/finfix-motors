import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

type FinalCtaProps = {
  whatsappNumber: string;
  title?: string;
  description?: string;
};

/**
 * Dark call-to-action band reused at the bottom of public pages.
 * Server component (no interactivity beyond links).
 */
export function FinalCta({
  whatsappNumber,
  title = "Ready to Get Started?",
  description = "Reach us in Dar es Salaam or Dodoma, or send us a WhatsApp message — our team is ready to help you find or sell your next vehicle.",
}: FinalCtaProps) {
  return (
    <section className="py-14 sm:py-20" aria-label="Contact call to action">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-charcoal px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="h-11 bg-brand text-white hover:bg-brand/90"
            >
              <a
                href={generalWhatsAppUrl(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-4" aria-hidden="true" />
                WhatsApp Us
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
