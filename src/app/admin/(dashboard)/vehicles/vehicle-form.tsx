"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ApiError,
  apiFetch,
  type AdminVehicle,
  type FuelType,
  type Transmission,
  type UploadedImage,
  type VehicleCondition,
  type VehicleStatus,
} from "@/components/admin/api-client";
import { cn } from "@/lib/utils";

const TRANSMISSION_OPTIONS: Transmission[] = ["Automatic", "Manual"];
const FUEL_OPTIONS: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric"];
const CONDITION_OPTIONS: VehicleCondition[] = ["Brand New", "Foreign Used", "Locally Used"];
const STATUS_OPTIONS: VehicleStatus[] = ["AVAILABLE", "SOLD"];

const MAX_IMAGES = 12;
const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";

interface VehicleFormProps {
  mode: "create" | "edit";
  vehicleId?: string;
}

interface FormState {
  make: string;
  model: string;
  year: string;
  price: string;
  transmission: string;
  fuelType: string;
  condition: string;
  mileage: string;
  color: string;
  engine: string;
  status: VehicleStatus;
  isFeatured: boolean;
  description: string;
}

const EMPTY_FORM: FormState = {
  make: "",
  model: "",
  year: "",
  price: "",
  transmission: "",
  fuelType: "",
  condition: "",
  mileage: "",
  color: "",
  engine: "",
  status: "AVAILABLE",
  isFeatured: false,
  description: "",
};

export function VehicleForm({ mode, vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Load existing vehicle in edit mode.
  useEffect(() => {
    if (!isEdit || !vehicleId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ vehicle: AdminVehicle }>(
          `/api/admin/vehicles/${vehicleId}`
        );
        if (cancelled) return;
        const v = data.vehicle;
        setForm({
          make: v.make,
          model: v.model,
          year: String(v.year),
          price: String(v.price),
          transmission: v.transmission,
          fuelType: v.fuelType,
          condition: v.condition,
          mileage: v.mileage == null ? "" : String(v.mileage),
          color: v.color ?? "",
          engine: v.engine ?? "",
          status: v.status,
          isFeatured: v.isFeatured,
          description: v.description ?? "",
        });
        setImages(
          v.images.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            altText: img.altText,
          }))
        );
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          toast.error("Vehicle not found. It may have been deleted.");
        } else {
          toast.error(
            err instanceof Error ? err.message : "Failed to load the vehicle."
          );
        }
        router.push("/admin/vehicles");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, vehicleId, router]);

  function validate(): boolean {
    const currentYear = new Date().getFullYear();
    const next: Record<string, string> = {};

    if (!form.make.trim()) next.make = "Make is required.";
    if (!form.model.trim()) next.model = "Model is required.";

    const year = Number(form.year);
    if (!form.year || !Number.isInteger(year)) {
      next.year = "Year is required.";
    } else if (year < 1950) {
      next.year = "Year must be 1950 or later.";
    } else if (year > currentYear + 1) {
      next.year = "Year cannot be in the future.";
    }

    const price = Number(form.price);
    if (!form.price || !Number.isInteger(price)) {
      next.price = "Price is required (whole TZS amount).";
    } else if (price < 100000) {
      next.price = "Price must be at least TZS 100,000.";
    }

    if (!form.transmission) next.transmission = "Select a transmission.";
    if (!form.fuelType) next.fuelType = "Select a fuel type.";
    if (!form.condition) next.condition = "Select a condition.";

    const mileage = form.mileage === "" ? null : Number(form.mileage);
    if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0)) {
      next.mileage = "Mileage must be a whole number of 0 or more.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setAttempted(true);

    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      price: Number(form.price),
      transmission: form.transmission,
      fuelType: form.fuelType,
      condition: form.condition,
      mileage: form.mileage === "" ? null : Number(form.mileage),
      color: form.color.trim() || null,
      engine: form.engine.trim() || null,
      description: form.description.trim() || null,
      status: form.status,
      isFeatured: form.isFeatured,
      images: images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        altText: img.altText,
      })),
    };

    setSubmitting(true);
    try {
      if (isEdit && vehicleId) {
        await apiFetch<{ vehicle: AdminVehicle }>(`/api/admin/vehicles/${vehicleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Vehicle updated");
      } else {
        await apiFetch<{ vehicle: AdminVehicle }>("/api/admin/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Vehicle created");
      }
      router.push("/admin/vehicles");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the vehicle.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-40 w-full rounded-xl" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold sm:text-2xl">
            {isEdit ? "Edit Vehicle" : "Add Vehicle"}
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/vehicles")}
            className="min-h-11"
          >
            Back to list
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: vehicle fields */}
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="font-display text-base font-bold sm:text-lg">
                Vehicle Information
              </CardTitle>
              <CardDescription>
                Details shown to buyers on the public website.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Make" required htmlFor="veh-make" error={attempted ? errors.make : undefined}>
                  <Input
                    id="veh-make"
                    value={form.make}
                    onChange={(e) => update("make", e.target.value)}
                    placeholder="e.g. Toyota"
                    className="h-11"
                    aria-invalid={attempted && Boolean(errors.make)}
                  />
                </Field>

                <Field label="Model" required htmlFor="veh-model" error={attempted ? errors.model : undefined}>
                  <Input
                    id="veh-model"
                    value={form.model}
                    onChange={(e) => update("model", e.target.value)}
                    placeholder="e.g. Land Cruiser Prado"
                    className="h-11"
                    aria-invalid={attempted && Boolean(errors.model)}
                  />
                </Field>

                <Field label="Year" required htmlFor="veh-year" error={attempted ? errors.year : undefined}>
                  <Input
                    id="veh-year"
                    type="number"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    step={1}
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    placeholder="e.g. 2018"
                    className="h-11"
                    aria-invalid={attempted && Boolean(errors.year)}
                  />
                </Field>

                <Field
                  label="Price (TZS)"
                  required
                  htmlFor="veh-price"
                  error={attempted ? errors.price : undefined}
                  helper="Price in Tanzanian Shillings, e.g. 32500000"
                >
                  <Input
                    id="veh-price"
                    type="number"
                    min={100000}
                    step={100000}
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="e.g. 32500000"
                    className="h-11"
                    aria-invalid={attempted && Boolean(errors.price)}
                  />
                </Field>

                <Field label="Transmission" required htmlFor="veh-transmission" error={attempted ? errors.transmission : undefined}>
                  <Select
                    value={form.transmission}
                    onValueChange={(v) => update("transmission", v)}
                  >
                    <SelectTrigger
                      id="veh-transmission"
                      aria-invalid={attempted && Boolean(errors.transmission)}
                      className="h-11 w-full"
                    >
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSMISSION_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Fuel Type" required htmlFor="veh-fuel" error={attempted ? errors.fuelType : undefined}>
                  <Select value={form.fuelType} onValueChange={(v) => update("fuelType", v)}>
                    <SelectTrigger
                      id="veh-fuel"
                      aria-invalid={attempted && Boolean(errors.fuelType)}
                      className="h-11 w-full"
                    >
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Condition" required htmlFor="veh-condition" error={attempted ? errors.condition : undefined}>
                  <Select value={form.condition} onValueChange={(v) => update("condition", v)}>
                    <SelectTrigger
                      id="veh-condition"
                      aria-invalid={attempted && Boolean(errors.condition)}
                      className="h-11 w-full"
                    >
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Mileage (km)" htmlFor="veh-mileage" error={attempted ? errors.mileage : undefined}>
                  <Input
                    id="veh-mileage"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.mileage}
                    onChange={(e) => update("mileage", e.target.value)}
                    placeholder="e.g. 68000"
                    className="h-11"
                    aria-invalid={attempted && Boolean(errors.mileage)}
                  />
                </Field>

                <Field label="Color" htmlFor="veh-color">
                  <Input
                    id="veh-color"
                    value={form.color}
                    onChange={(e) => update("color", e.target.value)}
                    placeholder="e.g. Pearl White"
                    className="h-11"
                  />
                </Field>

                <Field label="Engine" htmlFor="veh-engine" helper="Optional, e.g. 2500cc">
                  <Input
                    id="veh-engine"
                    value={form.engine}
                    onChange={(e) => update("engine", e.target.value)}
                    placeholder="e.g. 2500cc"
                    className="h-11"
                  />
                </Field>

                <Field label="Status" required htmlFor="veh-status">
                  <Select value={form.status} onValueChange={(v) => update("status", v as VehicleStatus)}>
                    <SelectTrigger id="veh-status" className="h-11 w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "AVAILABLE" ? "Available" : "Sold"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-brand-tint/50 px-4 py-3 sm:col-span-2">
                  <div>
                    <Label htmlFor="veh-featured" className="font-medium">
                      Featured
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show on homepage featured section
                    </p>
                  </div>
                  <Switch
                    id="veh-featured"
                    checked={form.isFeatured}
                    onCheckedChange={(v) => update("isFeatured", v)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="veh-description">Description</Label>
                  <Textarea
                    id="veh-description"
                    rows={6}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Key features, service history, import details…"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: photos */}
          <Card className="p-5 sm:p-6">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="font-display text-base font-bold sm:text-lg">
                Photos
              </CardTitle>
              <CardDescription>
                Up to {MAX_IMAGES} photos. The first photo is the cover image.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <ImageUploader images={images} onChange={setImages} disabled={submitting} />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Tip: clear, well-lit photos from multiple angles sell faster. The
                first image appears on the homepage and vehicle cards.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 -mx-4 mt-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/vehicles")}
              disabled={submitting}
              className="min-h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Vehicle"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children}
      {helper && !error ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image uploader
// ---------------------------------------------------------------------------

function ImageUploader({
  images,
  onChange,
  disabled,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  function remove(index: number) {
    const img = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    // Best-effort cleanup of the stored file (safe to fail silently).
    void apiFetch<{ ok: boolean }>("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: img.publicId, url: img.url }),
    }).catch(() => undefined);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const selected = Array.from(files);

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images per vehicle.`);
      return;
    }
    const accepted = selected.slice(0, room);
    if (selected.length > room) {
      toast.error(`Only ${room} more image${room === 1 ? "" : "s"} can be added.`);
    }

    setUploading(true);
    try {
      // Upload ONE file per request: serverless hosts (e.g. Vercel) cap the
      // request body at ~4.5 MB, so batching multiple images in one call
      // would fail with 413. Sequential per-file uploads are safe everywhere.
      let current = [...images];
      for (const file of accepted) {
        const formData = new FormData();
        formData.append("files", file);
        const result = await apiFetch<{ images: { url: string; publicId: string | null }[] }>(
          "/api/admin/upload",
          { method: "POST", body: formData }
        );
        const uploaded: UploadedImage[] = result.images.map((img) => ({
          url: img.url,
          publicId: img.publicId ?? null,
          altText: null,
        }));
        current = [...current, ...uploaded];
        onChange(current);
      }
      toast.success("Photos uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
        aria-label="Upload vehicle photos"
        disabled={disabled || uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label="Upload photos"
        className={cn(
          "relative flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors hover:border-brand hover:bg-brand-tint/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          (disabled || uploading) && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-brand" aria-hidden="true" />
            <span className="text-sm font-medium">Uploading…</span>
          </>
        ) : (
          <>
            <ImagePlus className="size-6 text-brand" aria-hidden="true" />
            <span className="text-sm font-medium">Click to upload photos</span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG or WebP up to 4 MB each
            </span>
          </>
        )}
      </button>

      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div key={`${img.url}-${index}`} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={img.url}
                  alt={img.altText ?? "Vehicle photo"}
                  fill
                  sizes="(max-width: 640px) 33vw, 150px"
                  className="object-cover"
                />
                {index === 0 ? (
                  <Badge className="absolute left-1.5 top-1.5 border-transparent bg-brand text-white">
                    Main
                  </Badge>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={uploading}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
              <div className="mt-1 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || uploading}
                  aria-label={`Move photo ${index + 1} earlier`}
                  className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </button>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1 || uploading}
                  aria-label={`Move photo ${index + 1} later`}
                  className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
          <Car className="size-4 shrink-0" aria-hidden="true" />
          No photos yet — the vehicle will show a placeholder on the website.
        </div>
      )}
    </div>
  );
}
