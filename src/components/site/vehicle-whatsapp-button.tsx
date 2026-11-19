"use client";

import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, vehicleInquiryMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type VehicleWhatsAppButtonProps = {
  number: string;
  vehicle: { make: string; model: string; year: number; price: number; status: string; slug: string };
  variant?: "icon" | "full";
  className?: string;
  label?: string;
};

/**
 * WhatsApp inquiry button for a specific vehicle. The rendered href works
 * without JavaScript; on click we rebuild the link with the absolute vehicle
 * URL (requires window) so the message always includes a correct deep link.
 */
export function VehicleWhatsAppButton({
  number,
  vehicle,
  variant = "full",
  className,
  label = "WhatsApp Inquiry",
}: VehicleWhatsAppButtonProps) {
  const fallbackHref = buildWhatsAppUrl(number, vehicleInquiryMessage(vehicle));

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return; // let the fallback href work
    event.preventDefault();
    const message = vehicleInquiryMessage({
      ...vehicle,
      url: `${window.location.origin}/vehicles/${vehicle.slug}`,
    });
    window.open(buildWhatsAppUrl(number, message), "_blank", "noopener,noreferrer");
  };

  if (variant === "icon") {
    return (
      <Button
        asChild
        variant="outline"
        size="icon"
        className={cn(
          "size-10 shrink-0 border-[#25D366]/40 text-[#1aaf53] hover:bg-[#25D366]/10 hover:text-[#128C7E]",
          className
        )}
        aria-label={`Inquire about ${vehicle.year} ${vehicle.make} ${vehicle.model} on WhatsApp`}
      >
        <a href={fallbackHref} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
          <WhatsAppIcon className="size-4" />
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "w-full border-[#25D366]/50 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 hover:text-[#0f7a6b]",
        className
      )}
    >
      <a href={fallbackHref} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        <WhatsAppIcon className="size-4" />
        {label}
      </a>
    </Button>
  );
}
