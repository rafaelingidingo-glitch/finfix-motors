"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RotateCcw, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/site/vehicle-card";
import type { VehicleWithImages } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* API response types                                                  */
/* ------------------------------------------------------------------ */

interface ApiVehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  publicId: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

interface ApiVehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  transmission: string;
  fuelType: string;
  condition: string;
  mileage: number | null;
  color: string | null;
  engine: string | null;
  description: string | null;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: ApiVehicleImage[];
}

interface VehiclesResponse {
  vehicles: ApiVehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: { makes: string[] };
}

/* ------------------------------------------------------------------ */
/* Filters / options                                                   */
/* ------------------------------------------------------------------ */

interface Filters {
  search: string;
  make: string;
  minPrice: string;
  maxPrice: string;
  year: string;
  transmission: string;
  fuelType: string;
  status: string;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  make: "",
  minPrice: "",
  maxPrice: "",
  year: "",
  transmission: "",
  fuelType: "",
  status: "",
};

const ALL = "all";

type SortOption = "newest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR + 1 - 1990 + 1 },
  (_, i) => CURRENT_YEAR + 1 - i
);
const TRANSMISSION_OPTIONS = ["Automatic", "Manual"];
const FUEL_OPTIONS = ["Petrol", "Diesel", "Hybrid", "Electric"];

/** Build the querystring for the public vehicles API. */
function buildQuery(filters: Filters, sort: SortOption, page: number): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.make) params.set("make", filters.make);
  if (filters.minPrice.trim()) params.set("minPrice", filters.minPrice.trim());
  if (filters.maxPrice.trim()) params.set("maxPrice", filters.maxPrice.trim());
  if (filters.year) params.set("year", filters.year);
  if (filters.transmission) params.set("transmission", filters.transmission);
  if (filters.fuelType) params.set("fuelType", filters.fuelType);
  if (filters.status) params.set("status", filters.status);
  params.set("sort", sort);
  params.set("page", String(page));
  return params.toString();
}

/** Convert the JSON payload into the shape VehicleCard expects (Date fields restored). */
function toVehicle(v: ApiVehicle): VehicleWithImages {
  return {
    ...v,
    createdAt: new Date(v.createdAt),
    updatedAt: new Date(v.updatedAt),
    images: v.images.map((img) => ({ ...img, createdAt: new Date(img.createdAt) })),
  };
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function VehicleSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type InventoryClientProps = {
  whatsappNumber: string;
};

export function InventoryClient({ whatsappNumber }: InventoryClientProps) {
  /* Committed filters drive the fetch */
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  /* Draft inputs (debounced into filters) */
  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  /* Data */
  const [vehicles, setVehicles] = useState<VehicleWithImages[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [makes, setMakes] = useState<string[]>([]);

  /* UI states */
  const [isPending, setIsPending] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Keep latest values available to callbacks without re-subscribing effects */
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const sortRef = useRef(sort);
  sortRef.current = sort;

  /* Debounced search */
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) =>
        f.search === searchInput.trim() ? f : { ...f, search: searchInput.trim() }
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* Debounced price range */
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.minPrice === minPriceInput ? f : { ...f, minPrice: minPriceInput }));
    }, 400);
    return () => clearTimeout(timer);
  }, [minPriceInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.maxPrice === maxPriceInput ? f : { ...f, maxPrice: maxPriceInput }));
    }, 400);
    return () => clearTimeout(timer);
  }, [maxPriceInput]);

  /* Main fetch — runs whenever filters or sort change (always loads page 1) */
  useEffect(() => {
    const controller = new AbortController();
    setIsPending(true);
    setError(null);
    setPage(1);

    fetch(`/api/vehicles?${buildQuery(filters, sort, 1)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data: VehiclesResponse = await res.json();
        setVehicles(data.vehicles.map(toVehicle));
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
        setMakes(data.facets.makes);
        setIsPending(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load vehicles:", err);
        setError("Something went wrong while loading vehicles. Please try again.");
        setIsPending(false);
      });

    return () => controller.abort();
  }, [filters, sort, reloadKey]);

  /* Load more — appends the next page */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || isPending) return;
    const nextPage = page + 1;
    const filtersSnapshot = filtersRef.current;
    const sortSnapshot = sortRef.current;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/vehicles?${buildQuery(filtersSnapshot, sortSnapshot, nextPage)}`
      );
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data: VehiclesResponse = await res.json();
      /* Discard stale response if filters/sort changed while loading */
      if (filtersRef.current !== filtersSnapshot || sortRef.current !== sortSnapshot) return;
      setVehicles((prev) => {
        const existingIds = new Set(prev.map((v) => v.id));
        return [...prev, ...data.vehicles.filter((v) => !existingIds.has(v.id)).map(toVehicle)];
      });
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load more vehicles:", err);
      setError("Failed to load more vehicles. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isPending, page]);

  const setFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((f) => (f[key] === value ? f : { ...f, [key]: value }));
  }, []);

  /** Select helper: maps the "all" sentinel back to an empty filter. */
  const handleSelect = useCallback(
    (key: keyof Filters, value: string) => setFilter(key, value === ALL ? "" : value),
    [setFilter]
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setFiltersOpen(false);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v.trim() !== "").length,
    [filters]
  );

  const hasMore = !isPending && page < totalPages;

  /* ---------------------------------------------------------------- */
  /* Filters panel (shared between desktop sidebar and mobile sheet)   */
  /* ---------------------------------------------------------------- */

  const filtersPanel = (
    <div className="space-y-5">
      <FilterField label="Search" htmlFor="filter-search">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="filter-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Make, model or year..."
            className="h-11 pl-9"
            aria-label="Search vehicles by make, model or year"
          />
        </div>
      </FilterField>

      <FilterField label="Make" htmlFor="filter-make">
        <Select value={filters.make || ALL} onValueChange={(v) => handleSelect("make", v)}>
          <SelectTrigger id="filter-make" className="h-11 w-full" aria-label="Filter by make">
            <SelectValue placeholder="All Makes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Makes</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Price range (TZS)" htmlFor="filter-min-price">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="filter-min-price"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="h-11"
            aria-label="Minimum price in Tanzanian Shillings"
          />
          <Input
            id="filter-max-price"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="h-11"
            aria-label="Maximum price in Tanzanian Shillings"
          />
        </div>
      </FilterField>

      <FilterField label="Year" htmlFor="filter-year">
        <Select value={filters.year || ALL} onValueChange={(v) => handleSelect("year", v)}>
          <SelectTrigger id="filter-year" className="h-11 w-full" aria-label="Filter by year">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto custom-scrollbar">
            <SelectItem value={ALL}>All Years</SelectItem>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Transmission" htmlFor="filter-transmission">
        <Select
          value={filters.transmission || ALL}
          onValueChange={(v) => handleSelect("transmission", v)}
        >
          <SelectTrigger
            id="filter-transmission"
            className="h-11 w-full"
            aria-label="Filter by transmission"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {TRANSMISSION_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Fuel Type" htmlFor="filter-fuel">
        <Select value={filters.fuelType || ALL} onValueChange={(v) => handleSelect("fuelType", v)}>
          <SelectTrigger id="filter-fuel" className="h-11 w-full" aria-label="Filter by fuel type">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {FUEL_OPTIONS.map((fuel) => (
              <SelectItem key={fuel} value={fuel}>
                {fuel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Availability" htmlFor="filter-status">
        <Select value={filters.status || ALL} onValueChange={(v) => handleSelect("status", v)}>
          <SelectTrigger
            id="filter-status"
            className="h-11 w-full"
            aria-label="Filter by availability"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={clearFilters}
        disabled={activeCount === 0}
        aria-label="Clear all filters"
      >
        <X className="size-4" aria-hidden="true" />
        Clear All Filters
      </Button>
    </div>
  );

  const sortSelect = (
    <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
      <SelectTrigger className="h-11 w-[170px]" aria-label="Sort vehicles">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      {/* Desktop filters sidebar */}
      <aside className="hidden lg:block" aria-label="Inventory filters">
        <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="mb-5 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
            <SlidersHorizontal className="size-4 text-brand" aria-hidden="true" />
            Filters
          </h2>
          {filtersPanel}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile toolbar: filters trigger + sort */}
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-11 flex-1"
                aria-label={`Open filters. ${activeCount} active ${
                  activeCount === 1 ? "filter" : "filters"
                }.`}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
                {activeCount > 0 && (
                  <Badge className="ml-1 border-none bg-brand px-2 py-0 text-xs font-bold text-white">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-85 overflow-y-auto custom-scrollbar sm:max-w-[85vw]">
              <SheetHeader>
                <SheetTitle className="font-display uppercase tracking-wide">Filters</SheetTitle>
                <SheetDescription>Refine the vehicle listings below.</SheetDescription>
              </SheetHeader>
              <div className="pb-6">{filtersPanel}</div>
            </SheetContent>
          </Sheet>
          <div className="shrink-0">{sortSelect}</div>
        </div>

        {/* Results header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {isPending ? "..." : vehicles.length}
            </span>{" "}
            of <span className="font-semibold text-foreground">{total}</span> vehicles
          </p>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm text-muted-foreground">Sort by</span>
            {sortSelect}
          </div>
        </div>

        {/* Content */}
        {isPending ? (
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <VehicleSkeleton key={i} />
            ))}
          </div>
        ) : error && vehicles.length === 0 ? (
          <div className="rounded-xl border border-destructive/40 bg-card px-6 py-16 text-center">
            <AlertCircle className="mx-auto size-10 text-destructive" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-bold">Unable to load vehicles</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
            <Button
              onClick={retry}
              className="mt-6 h-11 bg-charcoal text-white hover:bg-charcoal/90"
              aria-label="Retry loading vehicles"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try Again
            </Button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
            <SearchX className="mx-auto size-10 text-muted-foreground/50" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-bold">No vehicles match your search</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Try adjusting your filters or clearing them to see our full inventory.
            </p>
            <Button
              onClick={clearFilters}
              className="mt-6 h-11 bg-charcoal text-white hover:bg-charcoal/90"
              aria-label="Clear filters and show all vehicles"
            >
              <X className="size-4" aria-hidden="true" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  whatsappNumber={whatsappNumber}
                />
              ))}
              {isLoadingMore &&
                Array.from({ length: 3 }, (_, i) => <VehicleSkeleton key={`more-${i}`} />)}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className={cn(
                    "h-11 min-w-48 bg-charcoal text-white hover:bg-charcoal/90",
                    isLoadingMore && "opacity-80"
                  )}
                  aria-label="Load more vehicles"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Loading...
                    </>
                  ) : (
                    "Load More Vehicles"
                  )}
                </Button>
              </div>
            )}

            {error && vehicles.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-destructive">
                {error}
                <Button onClick={retry} variant="outline" size="sm" className="h-9">
                  Try Again
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
