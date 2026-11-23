"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Car,
  HandCoins,
  Pencil,
  Plus,
  Ship,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  apiFetch,
  type AdminService,
  type ServiceIconKey,
  type ServiceListResponse,
} from "@/components/admin/api-client";

const ICON_OPTIONS: { value: ServiceIconKey; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "ship", label: "Ship" },
  { value: "truck", label: "Truck" },
  { value: "hand-coins", label: "Hand coins" },
];

function ServiceIcon({ iconKey }: { iconKey: ServiceIconKey }) {
  switch (iconKey) {
    case "ship":
      return <Ship className="size-5 text-brand" aria-hidden="true" />;
    case "truck":
      return <Truck className="size-5 text-brand" aria-hidden="true" />;
    case "hand-coins":
      return <HandCoins className="size-5 text-brand" aria-hidden="true" />;
    case "car":
    default:
      return <Car className="size-5 text-brand" aria-hidden="true" />;
  }
}

export function ServicesManager() {
  const [services, setServices] = useState<AdminService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminService | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch<ServiceListResponse>("/api/admin/services");
      setServices(data.services);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load services.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(service: AdminService) {
    setEditing(service);
    setDialogOpen(true);
  }

  async function toggleActive(service: AdminService, next: boolean) {
    setTogglingId(service.id);
    try {
      const result = await apiFetch<{ service: AdminService }>(
        `/api/admin/services/${service.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: next }),
        }
      );
      setServices((prev) =>
        prev ? prev.map((s) => (s.id === result.service.id ? result.service : s)) : prev
      );
      toast.success(next ? "Service activated" : "Service hidden");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update the service.";
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/services/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success("Service deleted");
      setDeleteTarget(null);
      void load(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete the service.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Services</h1>
        <Button
          onClick={openCreate}
          className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Service
        </Button>
      </div>

      <div className="space-y-4">
        {loading && services === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="p-5">
              <div className="flex gap-4">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              </div>
            </Card>
          ))
        ) : services && services.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <Wrench className="size-10 text-muted-foreground/40" aria-hidden="true" />
              <p className="font-medium">
                No services — the website falls back to default content.
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add services such as car sales, imports on order and vehicle
                transportation to control what appears on the website.
              </p>
              <Button
                onClick={openCreate}
                className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Service
              </Button>
            </div>
          </Card>
        ) : (
          services?.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-tint"
                  aria-hidden="true"
                >
                  <ServiceIcon iconKey={service.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{service.title}</h2>
                    {service.isActive ? (
                      <Badge className="border-transparent bg-brand-tint text-brand">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Hidden
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Order {service.sortOrder}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="sr-only" id={`active-label-${service.id}`}>
                      Active
                    </span>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={(next) => void toggleActive(service, next)}
                      disabled={togglingId === service.id}
                      aria-labelledby={`active-label-${service.id}`}
                      aria-label={`Toggle active for ${service.title}`}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEdit(service)}
                    aria-label={`Edit ${service.title}`}
                    className="min-h-11 min-w-11"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteTarget(service)}
                    aria-label={`Delete ${service.title}`}
                    className="min-h-11 min-w-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editing}
        onSaved={() => void load(true)}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget ? `Delete "${deleteTarget.title}"?` : "Delete service?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the service from the website. This action cannot be
              cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / edit dialog
// ---------------------------------------------------------------------------

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: AdminService | null; // null = create
  onSaved: () => void;
}

function ServiceDialog({ open, onOpenChange, service, onSaved }: ServiceDialogProps) {
  const isEdit = service !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<ServiceIconKey>("car");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [pending, setPending] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset the form whenever the dialog opens with a different target.
  useEffect(() => {
    if (!open) return;
    setTitle(service?.title ?? "");
    setDescription(service?.description ?? "");
    setIcon(service?.icon ?? "car");
    setSortOrder(String(service?.sortOrder ?? 0));
    setIsActive(service?.isActive ?? true);
    setAttempted(false);
    setErrors({});
  }, [open, service]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (title.trim().length < 2) next.title = "Title is required (min 2 characters).";
    if (description.trim().length < 10) {
      next.description = "Description is required (min 10 characters).";
    }
    const order = Number(sortOrder);
    if (!Number.isInteger(order) || order < 0 || order > 99) {
      next.sortOrder = "Sort order must be a whole number between 0 and 99.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setAttempted(true);
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      icon,
      sortOrder: Number(sortOrder),
      isActive,
    };

    setPending(true);
    try {
      if (isEdit && service) {
        await apiFetch<{ service: AdminService }>(`/api/admin/services/${service.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Service updated");
      } else {
        await apiFetch<{ service: AdminService }>("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Service created");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the service.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Service" : "Add Service"}
          </DialogTitle>
          <DialogDescription>
            Services appear in the &quot;Our Services&quot; section of the website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="svc-title">Title</Label>
            <Input
              id="svc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Import Cars on Order"
              className="h-11"
              aria-invalid={attempted && Boolean(errors.title)}
            />
            {attempted && errors.title ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-description">Description</Label>
            <Textarea
              id="svc-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service in one or two sentences…"
              aria-invalid={attempted && Boolean(errors.description)}
            />
            {attempted && errors.description ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-icon">Icon</Label>
              <Select value={icon} onValueChange={(v) => setIcon(v as ServiceIconKey)}>
                <SelectTrigger id="svc-icon" className="h-11 w-full">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-order">Sort order</Label>
              <Input
                id="svc-order"
                type="number"
                min={0}
                max={99}
                step={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-11"
                aria-invalid={attempted && Boolean(errors.sortOrder)}
              />
              {attempted && errors.sortOrder ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.sortOrder}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-brand-tint/50 px-4 py-3">
            <Label htmlFor="svc-active" className="font-medium">
              Active
            </Label>
            <Switch id="svc-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="min-h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
            >
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
