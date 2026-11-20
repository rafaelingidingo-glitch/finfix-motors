"use client";

import { useState } from "react";
import Image from "next/image";
import { CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  altText?: string | null;
};

type VehicleGalleryProps = {
  images: GalleryImage[];
  /** e.g. "2019 Toyota Corolla" — used for alt text fallbacks. */
  title: string;
};

/**
 * Large vehicle photo gallery with thumbnail switching.
 * Falls back to a friendly placeholder when no photos exist.
 */
export function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted text-muted-foreground"
        role="status"
      >
        <CarFront className="size-12 text-muted-foreground/60" aria-hidden="true" />
        <p className="text-sm">No photos available</p>
      </div>
    );
  }

  const safeIndex = Math.min(selected, images.length - 1);
  const main = images[safeIndex];
  const mainAlt = main.altText?.trim() || `${title} at Elly Magari, Mwanza`;

  return (
    <div>
      {/* Main image */}
      <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          key={main.id}
          src={main.url}
          alt={mainAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        {images.length > 1 && (
          <figcaption className="absolute bottom-3 right-3 rounded-md bg-charcoal/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {safeIndex + 1} / {images.length}
          </figcaption>
        )}
      </figure>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6"
          role="group"
          aria-label={`${title} photos`}
        >
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-pressed={index === safeIndex}
              aria-label={`View image ${index + 1} of ${images.length}`}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                index === safeIndex
                  ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.altText?.trim() || `${title} photo ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
