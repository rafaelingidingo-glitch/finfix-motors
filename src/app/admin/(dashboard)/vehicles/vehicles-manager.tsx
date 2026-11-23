"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiFetch,
  type AdminVehicle,
  type VehicleListResponse,
} from "@/components/admin/api-client";
import { formatTZS } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export function VehiclesManager() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "AVAILABLE" | "SOLD">("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<VehicleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminVehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce the search box (400ms).
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(
    async (silent = false) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (search) params.set("search", search);
        if (status !== "ALL") params.set("status", status);
        const result = await apiFetch<VehicleListResponse>(
          `/api/admin/vehicles?${params.toString()}`,
          { signal: controller.signal }
        );
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to load vehicles.";
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, status]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const vehicles = data?.vehicles ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = search !== "" || status !== "ALL";

  async function toggleFeatured(vehicle: AdminVehicle, next: boolean) {
    setTogglingId(vehicle.id);
    // Optimistic update.
    setData((prev) =>
      prev
        ? {
            ...prev,
            vehicles: prev.vehicles.map((v) =>
              v.id === vehicle.id ? { ...v, isFeatured: next } : v
            ),
          }
        : prev
    );
    try {
      await apiFetch<{ vehicle: AdminVehicle }>(`/api/admin/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: next }),
      });
      toast.success(next ? "Marked as featured" : "Removed from featured");
    } catch (err) {
      // Revert on failure.
      setData((prev) =>
        prev
          ? {
              ...prev,
              vehicles: prev.vehicles.map((v) =>
                v.id === vehicle.id ? { ...v, isFeatured: !next } : v
              ),
            }
          : prev
      );
      const message = err instanceof Error ? err.message : "Could not update the vehicle.";
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/vehicles/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success("Vehicle deleted");
      setDeleteTarget(null);
      // If the current page becomes empty, step back one page.
      if (data && data.vehicles.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        void load(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete the vehicle.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Vehicles</h1>
        <Button asChild className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90">
          <Link href="/admin/vehicles/new">
            <Plus className="size-4" aria-hidden="true" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      <Card className="p-0">
        <CardHeader className="gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search make, model or year…"
                aria-label="Search vehicles"
                className="h-11 pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as "ALL" | "AVAILABLE" | "SOLD");
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by status"
                  className="h-11 w-full sm:w-44"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void load(true)}
                aria-label="Refresh vehicle list"
                className="min-h-11 min-w-11 shrink-0"
              >
                <RefreshCw
                  className={cn("size-4", refreshing && "animate-spin")}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="w-16 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !data ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="size-12 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-8 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center gap-4 py-12 text-center">
                        <Car
                          className="size-10 text-muted-foreground/40"
                          aria-hidden="true"
                        />
                        <p className="font-medium">
                          {hasFilters
                            ? "No vehicles match your filters."
                            : "No vehicles yet — add your first vehicle."}
                        </p>
                        {hasFilters ? (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchInput("");
                              setSearch("");
                              setStatus("ALL");
                              setPage(1);
                            }}
                            className="min-h-11"
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button
                            asChild
                            className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
                          >
                            <Link href="/admin/vehicles/new">
                              <Plus className="size-4" aria-hidden="true" />
                              Add Vehicle
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => {
                    const thumb = vehicle.images[0]?.url ?? null;
                    return (
                      <TableRow key={vehicle.id} className={cn(refreshing && "opacity-70")}>
                        <TableCell>
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              width={48}
                              height={48}
                              className="size-12 rounded-lg border border-border object-cover"
                            />
                          ) : (
                            <div
                              className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted"
                              aria-hidden="true"
                            >
                              <Car className="size-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/vehicles/${vehicle.id}/edit`}
                            className="font-medium underline-offset-4 hover:text-brand hover:underline"
                          >
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatTZS(vehicle.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-transparent",
                              vehicle.status === "AVAILABLE"
                                ? "bg-brand-tint text-brand"
                                : "bg-charcoal text-white"
                            )}
                          >
                            {vehicle.status === "AVAILABLE" ? "Available" : "Sold"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={vehicle.isFeatured}
                            onCheckedChange={(next) => void toggleFeatured(vehicle, next)}
                            disabled={togglingId === vehicle.id}
                            aria-label={`Toggle featured for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                className="min-h-11 min-w-11"
                              >
                                <MoreHorizontal className="size-4" aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                                  <Pencil className="size-4" aria-hidden="true" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(vehicle)}
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Showing {rangeStart}–{rangeEnd} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="min-h-11"
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="min-h-11"
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
              {deleteTarget
                ? `Delete ${deleteTarget.year} ${deleteTarget.make} ${deleteTarget.model}?`
                : "Delete vehicle?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This also removes its photos. This action cannot be cancelled.
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
