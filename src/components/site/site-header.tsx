"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

type HeaderProps = {
  businessName: string;
  phone: string;
  whatsappNumber: string;
};

/**
 * Sticky site header. On the homepage it starts transparent over the dark
 * hero and turns solid on scroll; on all other pages it is always solid.
 */
export function SiteHeader({ businessName, phone, whatsappNumber }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        transparent
          ? "border-transparent bg-transparent"
          : "border-border/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label={`${businessName} — home`}
        >
          <Image
            src="/images/elly-magari-logo.jpg"
            alt={`${businessName} logo`}
            width={44}
            height={44}
            className="size-11 rounded-lg object-cover"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span
              className={cn(
                "font-display text-base font-bold tracking-wide transition-colors sm:text-lg",
                transparent ? "text-white" : "text-foreground"
              )}
            >
              {businessName.toUpperCase()}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.2em] transition-colors",
                transparent ? "text-gold-soft" : "text-gold"
              )}
            >
              Mwanza · Tanzania
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  transparent
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  active && (transparent ? "text-gold" : "text-gold")
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className={cn(
              "hidden size-10 items-center justify-center rounded-full border transition-colors md:flex",
              transparent
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-border text-foreground hover:bg-muted",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            )}
            aria-label={`Call ${businessName} at ${phone}`}
          >
            <Phone className="size-4" />
          </a>
          <Button
            asChild
            className="hidden bg-charcoal text-white hover:bg-charcoal/90 sm:inline-flex"
          >
            <a
              href={generalWhatsAppUrl(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </Button>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "size-10 rounded-full lg:hidden",
                  transparent && "border-white/30 bg-transparent text-white hover:bg-white/10"
                )}
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <Image
                    src="/images/elly-magari-logo.jpg"
                    alt={`${businessName} logo`}
                    width={40}
                    height={40}
                    className="size-10 rounded-lg object-cover"
                  />
                  <SheetTitle className="font-display text-base font-bold">
                    {businessName}
                  </SheetTitle>
                </div>
                <nav className="flex flex-col gap-1 p-3" aria-label="Mobile navigation">
                  {NAV_LINKS.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-gold-tint text-gold"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-auto space-y-2 border-t border-border p-4">
                  <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90">
                    <a
                      href={generalWhatsAppUrl(whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon />
                      WhatsApp Us
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href={`tel:${phone.replace(/\s/g, "")}`}>
                      <Phone className="size-4" />
                      {phone}
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
