"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Car as CarIcon,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleWhatsAppButton } from "@/components/site/vehicle-whatsapp-button";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { formatTZSShort } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Serializable vehicle DTO rendered inside the hero showcase. */
export type HeroVehicle = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuelType: string;
  mileage: number | null;
  price: number;
  status: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

type HeroCarouselProps = {
  vehicles: HeroVehicle[];
  whatsappNumber: string;
};

const SLIDE_MS = 5500;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SWIPE_THRESHOLD = 70;

/**
 * Premium featured-vehicle showcase for the homepage hero.
 * - Auto-advances every 5.5s via the animated progress indicator itself
 *   (pause on hover / focus / drag is perfectly in sync with autoplay).
 * - Slide transitions: fade + horizontal slide, subtle image scale-in.
 * - Touch/swipe drag on mobile, arrows and clickable pagination pills.
 * - Respects prefers-reduced-motion: crossfade only, no autoplay, no drag.
 */
export function HeroCarousel({ vehicles, whatsappNumber }: HeroCarouselProps) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [hovering, setHovering] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const count = vehicles.length;
  const current = vehicles[index];

  const goNext = useCallback(() => {
    if (count < 2) return;
    setDirection(1);
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    if (count < 2) return;
    setDirection(-1);
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const goTo = useCallback(
    (i: number) => {
      if (i === index || i < 0 || i >= count) return;
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index, count]
  );

  if (!current) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal-soft shadow-2xl shadow-black/50">
        <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
            <CarIcon className="size-7" aria-hidden="true" />
          </span>
          <h2 className="font-display text-lg font-bold text-white sm:text-xl">
            Featured vehicles coming soon
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            New arrivals land regularly. Ask us on WhatsApp for the latest available stock in
            our yard.
          </p>
        </div>
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:p-5">
          <Button
            asChild
            className="h-11 flex-1 bg-gold text-charcoal hover:bg-gold/90"
          >
            <a
              href={generalWhatsAppUrl(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-4" />
              Ask About Available Cars
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 flex-1 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/inventory">Browse Inventory</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isSold = current.status === "SOLD";
  const showImage = Boolean(current.imageUrl) && !failed[current.id];
  const paused = hovering || interacting;

  const slideVariants: Variants = {
    enter: (dir: 1 | -1) =>
      reduce
        ? { opacity: 0 }
        : { x: dir > 0 ? 88 : -88, opacity: 0, scale: 0.97 },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: EASE },
    },
    exit: (dir: 1 | -1) =>
      reduce
        ? { opacity: 0, transition: { duration: 0.3 } }
        : {
            x: dir > 0 ? -88 : 88,
            opacity: 0,
            scale: 0.97,
            transition: { duration: 0.4, ease: EASE },
          },
  };

  const imageVariants: Variants = {
    enter: reduce ? { opacity: 0 } : { scale: 1.07, opacity: 0.8 },
    center: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const textVariants: Variants = {
    enter: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.12, ease: EASE },
    },
  };

  const progressStyle = {
    animationDuration: `${SLIDE_MS}ms`,
    animationPlayState: paused ? ("paused" as const) : ("running" as const),
  };

  const pauseZoneHandlers = {
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
    onFocusCapture: () => setInteracting(true),
    onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setInteracting(false);
      }
    },
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured vehicles showcase"
      className="relative"
    >
      <div {...pauseZoneHandlers}>
        {/* Drag / swipe zone */}
        <motion.div
          className="relative cursor-grab select-none active:cursor-grabbing"
          drag={reduce || count < 2 ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragDirectionLock
          onDragStartCapture={(event) => event.preventDefault()}
          onDragEnd={(_, info) => {
            setInteracting(false);
            if (info.offset.x <= -SWIPE_THRESHOLD) goNext();
            else if (info.offset.x >= SWIPE_THRESHOLD) goPrev();
          }}
          onPointerDown={() => setInteracting(true)}
          onPointerUp={() => setInteracting(false)}
          onPointerCancel={() => setInteracting(false)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.article
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              aria-roledescription="slide"
              aria-label={`Vehicle ${index + 1} of ${count}`}
              className="w-full will-change-transform"
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal-soft shadow-2xl shadow-black/50">
                {/* Image */}
                <div className="relative aspect-[16/10] bg-charcoal">
                  <motion.div
                    className="absolute inset-0"
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                  >
                    {showImage ? (
                      <Image
                        src={current.imageUrl as string}
                        alt={
                          current.imageAlt ??
                          `${current.year} ${current.make} ${current.model} at Elly Magari Mwanza`
                        }
                        fill
                        priority={index === 0}
                        loading="eager"
                        draggable={false}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 680px"
                        className={cn(
                          "object-cover transition-opacity duration-500",
                          loaded[current.id] ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() =>
                          setLoaded((prev) => ({ ...prev, [current.id]: true }))
                        }
                        onError={() =>
                          setFailed((prev) => ({ ...prev, [current.id]: true }))
                        }
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-white/50">
                        <CarIcon className="size-10 text-gold/60" aria-hidden="true" />
                        <span className="text-sm">Image coming soon</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Loading shimmer */}
                  {current.imageUrl && !failed[current.id] && !loaded[current.id] && (
                    <div
                      className="absolute inset-0 animate-pulse bg-white/5"
                      aria-hidden="true"
                    />
                  )}

                  {/* Depth gradient */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal/60 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Whole-image link to the vehicle details page */}
                  <Link
                    href={`/vehicles/${current.slug}`}
                    className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gold"
                    aria-label={`View details of ${current.year} ${current.make} ${current.model}`}
                    tabIndex={-1}
                  >
                    <span className="sr-only">View details</span>
                  </Link>

                  {/* Availability status */}
                  <Badge
                    className={cn(
                      "absolute left-3 top-3 z-10 border-none px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      isSold ? "bg-charcoal text-white" : "bg-gold text-charcoal"
                    )}
                  >
                    {isSold ? "Sold" : "Available"}
                  </Badge>
                </div>

                {/* Details */}
                <motion.div variants={textVariants} className="p-4 sm:p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-white sm:text-xl">
                      <Link
                        href={`/vehicles/${current.slug}`}
                        className="transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        {current.year} {current.make} {current.model}
                      </Link>
                    </h3>
                    <p className="shrink-0 font-display text-lg font-bold text-gold sm:text-xl">
                      {formatTZSShort(current.price)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-white/65 sm:grid-cols-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
                      {current.year}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Settings2 className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
                      {current.transmission}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Fuel className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
                      {current.fuelType}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Gauge className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
                      {current.mileage != null
                        ? `${new Intl.NumberFormat("en-US").format(current.mileage)} km`
                        : "—"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      asChild
                      className="h-10 flex-1 bg-gold text-charcoal hover:bg-gold/90"
                    >
                      <Link href={`/vehicles/${current.slug}`}>
                        View Details
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <VehicleWhatsAppButton
                      number={whatsappNumber}
                      vehicle={{
                        make: current.make,
                        model: current.model,
                        year: current.year,
                        price: current.price,
                        status: current.status,
                        slug: current.slug,
                      }}
                      variant="icon"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.article>
          </AnimatePresence>

          {/* Navigation arrows */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous vehicle"
                className="absolute left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-charcoal/60 text-white backdrop-blur transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next vehicle"
                className="absolute right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-charcoal/60 text-white backdrop-blur transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </motion.div>

        {/* Progress + pagination indicators */}
        {count > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {vehicles.map((vehicle, i) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show vehicle ${i + 1} of ${count}: ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative overflow-hidden rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                  i === index ? "h-2 w-10 bg-white/25" : "h-2 w-2 bg-white/30 hover:bg-white/60"
                )}
              >
                {i === index && (
                  <span
                    key={`progress-${index}`}
                    className="hero-progress absolute inset-y-0 left-0 bg-gold"
                    style={progressStyle}
                    onAnimationEnd={goNext}
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-gold/80" aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Polite live announcement of the active slide */}
      <p className="sr-only" aria-live="polite">
        {`Showing vehicle ${index + 1} of ${count}: ${current.year} ${current.make} ${current.model}`}
      </p>
    </section>
  );
}
