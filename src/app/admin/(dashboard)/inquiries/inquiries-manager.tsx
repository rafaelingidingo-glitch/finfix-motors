"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Car,
  ExternalLink,
  Inbox,
  Mail,
  MailOpen,
  Phone,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  apiFetch,
  type AdminInquiry,
  type InquiryListResponse,
} from "@/components/admin/api-client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
type StatusFilter = "ALL" | "NEW" | "READ";

export function InquiriesManager() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InquiryListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewTarget, setViewTarget] = useState<AdminInquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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
        if (status !== "ALL") params.set("status", status);
        const result = await apiFetch<InquiryListResponse>(
          `/api/admin/inquiries?${params.toString()}`,
          { signal: controller.signal }
        );
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to load inquiries.";
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, status]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const inquiries = data?.inquiries ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function patchLocal(updated: AdminInquiry) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            inquiries: prev.inquiries.map((i) => (i.id === updated.id ? updated : i)),
          }
        : prev
    );
  }

  async function setStatusFor(inquiry: AdminInquiry, next: "NEW" | "READ") {
    try {
      const result = await apiFetch<{ inquiry: AdminInquiry }>(
        `/api/admin/inquiries/${inquiry.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        }
      );
      patchLocal(result.inquiry);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update the inquiry.";
      toast.error(message);
    }
  }

  async function openDetail(inquiry: AdminInquiry) {
    setViewTarget(inquiry);
    // Auto mark-as-read when a new inquiry is opened.
    if (inquiry.status === "NEW") {
      await setStatusFor(inquiry, "READ");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch<{ ok: boolean }>(`/api/admin/inquiries/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success("Inquiry deleted");
      setDeleteTarget(null);
      if (data && data.inquiries.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        void load(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete the inquiry.";
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
        <h1 className="font-display text-xl font-bold sm:text-2xl">Inquiries</h1>
        <Tabs
          value={status}
          onValueChange={(v) => {
            setStatus(v as StatusFilter);
            setPage(1);
          }}
        >
          <TabsList aria-label="Filter inquiries by status">
            <TabsTrigger value="ALL" className="min-h-9 px-4">
              All
            </TabsTrigger>
            <TabsTrigger value="NEW" className="min-h-9 px-4">
              New
            </TabsTrigger>
            <TabsTrigger value="READ" className="min-h-9 px-4">
              Read
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {loading && !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="p-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))
        ) : inquiries.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <Inbox className="size-10 text-muted-foreground/40" aria-hidden="true" />
              <p className="font-medium">
                {status === "ALL"
                  ? "No inquiries yet."
                  : status === "NEW"
                    ? "No new inquiries — you are all caught up."
                    : "No read inquiries."}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Messages sent through the website contact and vehicle forms will
                appear here.
              </p>
            </div>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card
              key={inquiry.id}
              className={cn("p-0 transition-opacity", refreshing && "opacity-80")}
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <button
                    type="button"
                    onClick={() => void openDetail(inquiry)}
                    className="min-w-0 flex-1 text-left"
                    aria-label={`View inquiry from ${inquiry.name}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{inquiry.name}</span>
                      <Badge
                        className={cn(
                          "border-transparent",
                          inquiry.status === "NEW"
                            ? "bg-brand text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {inquiry.status === "NEW" ? "New" : "Read"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {inquiry.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5 text-brand" aria-hidden="true" />
                        {inquiry.phone}
                      </span>
                      {inquiry.email ? (
                        <span className="truncate text-muted-foreground">
                          {inquiry.email}
                        </span>
                      ) : null}
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      aria-label={`Call ${inquiry.name}`}
                    >
                      <a href={`tel:${inquiry.phone}`}>
                        <Phone className="size-4" aria-hidden="true" />
                        Call
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        void setStatusFor(inquiry, inquiry.status === "NEW" ? "READ" : "NEW")
                      }
                      aria-label={
                        inquiry.status === "NEW"
                          ? `Mark inquiry from ${inquiry.name} as read`
                          : `Mark inquiry from ${inquiry.name} as unread`
                      }
                      className="min-h-11 min-w-11"
                    >
                      {inquiry.status === "NEW" ? (
                        <MailOpen className="size-4" aria-hidden="true" />
                      ) : (
                        <Mail className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteTarget(inquiry)}
                      aria-label={`Delete inquiry from ${inquiry.name}`}
                      className="min-h-11 min-w-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
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

      {/* Detail dialog */}
      <Dialog
        open={viewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {viewTarget ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Message from {viewTarget.name}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(viewTarget.createdAt)} —{" "}
                  {viewTarget.status === "NEW" ? "New" : "Read"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-brand" aria-hidden="true" />
                    <a href={`tel:${viewTarget.phone}`} className="underline-offset-4 hover:underline">
                      {viewTarget.phone}
                    </a>
                  </p>
                  {viewTarget.email ? (
                    <p className="text-muted-foreground">Email: {viewTarget.email}</p>
                  ) : null}
                </div>
                {viewTarget.vehicle ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-brand-tint/50 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <Car className="size-4 shrink-0 text-brand" aria-hidden="true" />
                      <span className="truncate">
                        About: {viewTarget.vehicle.year} {viewTarget.vehicle.make}{" "}
                        {viewTarget.vehicle.model}
                      </span>
                    </span>
                    <Link
                      href={`/vehicles/${viewTarget.vehicle.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
                    >
                      View vehicle
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                ) : null}
                <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                  {viewTarget.message}
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      void setStatusFor(viewTarget, viewTarget.status === "NEW" ? "READ" : "NEW")
                    }
                    className="min-h-11"
                  >
                    {viewTarget.status === "NEW" ? (
                      <>
                        <MailOpen className="size-4" aria-hidden="true" />
                        Mark as unread
                      </>
                    ) : (
                      <>
                        <Mail className="size-4" aria-hidden="true" />
                        Mark as read
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

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
              {deleteTarget ? `Delete inquiry from ${deleteTarget.name}?` : "Delete inquiry?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              The message will be permanently removed. This action cannot be
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
