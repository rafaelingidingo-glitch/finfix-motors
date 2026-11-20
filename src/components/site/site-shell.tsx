import { ContactBar } from "@/components/site/contact-bar";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getSiteSettings } from "@/lib/settings";

/**
 * Shared public-site shell: top contact bar, sticky header, main content area,
 * sticky footer (min-h-screen flex + flex-1 main keeps the footer at the bottom
 * on short pages and pushed down naturally on long pages) and the floating
 * WhatsApp button.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <ContactBar settings={settings} />
      <SiteHeader
        businessName={settings.businessName}
        phone={settings.phone}
        whatsappNumber={settings.whatsappNumber}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloat number={settings.whatsappNumber} />
    </div>
  );
}
