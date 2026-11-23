import Image from "next/image";
import Link from "next/link";
import { Calendar, Fuel, Gauge, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleWhatsAppButton } from "@/components/site/vehicle-whatsapp-button";
import { formatTZSShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VehicleWithImages } from "@/lib/vehicles";

type VehicleCardProps = {
  vehicle: VehicleWithImages;
  whatsappNumber: string;
  className?: string;
};

/** Elegant vehicle card used on the homepage and inventory grid. */
export function VehicleCard({ vehicle, whatsappNumber, className }: VehicleCardProps) {
  const mainImage = vehicle.images[0]?.url;
  const altText =
    vehicle.images[0]?.altText ??
    `${vehicle.year} ${vehicle.make} ${vehicle.model} at Finfix Motors Tanzania`;
  const isSold = vehicle.status === "SOLD";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      {/* Image */}
      <Link
        href={`/vehicles/${vehicle.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label={`View details of ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      >
        {mainImage ? (
          <Image
            src={mainImage}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              isSold && "opacity-80 grayscale-[35%]"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-sm">No image available</span>
          </div>
        )}

        {/* Status badge */}
        <Badge
          className={cn(
            "absolute left-3 top-3 border-none px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            isSold ? "bg-charcoal text-white" : "bg-brand text-white"
          )}
        >
          {isSold ? "Sold" : "Available"}
        </Badge>

        {/* Featured */}
        {vehicle.isFeatured && !isSold && (
          <Badge className="absolute right-3 top-3 border-none bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-charcoal backdrop-blur">
            Featured
          </Badge>
        )}

        {isSold && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-charcoal/85 px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
              Sold
            </span>
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <h3 className="font-display text-base font-bold leading-snug text-foreground sm:text-lg">
            <Link
              href={`/vehicles/${vehicle.slug}`}
              className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Link>
          </h3>
          <p className="mt-1.5 font-display text-lg font-bold text-brand sm:text-xl">
            {formatTZSShort(vehicle.price)}
          </p>
        </div>

        {/* Quick specs */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-brand" aria-hidden="true" />
            {vehicle.year}
          </span>
          <span className="flex items-center gap-1.5">
            <Settings2 className="size-3.5 text-brand" aria-hidden="true" />
            {vehicle.transmission}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel className="size-3.5 text-brand" aria-hidden="true" />
            {vehicle.fuelType}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-brand" aria-hidden="true" />
            {vehicle.mileage != null ? `${new Intl.NumberFormat("en-US").format(vehicle.mileage)} km` : "—"}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            asChild
            className="h-10 flex-1 bg-charcoal text-white hover:bg-charcoal/90"
          >
            <Link href={`/vehicles/${vehicle.slug}`}>View Details</Link>
          </Button>
          <VehicleWhatsAppButton number={whatsappNumber} vehicle={vehicle} variant="icon" />
        </div>
      </div>
    </article>
  );
}
