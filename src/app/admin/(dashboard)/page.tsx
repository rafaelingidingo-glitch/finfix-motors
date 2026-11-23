import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Car, CircleCheck, CircleOff, Inbox, Plus, Star } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatTZS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalVehicles, available, sold, featured, newInquiries, recentVehicles] =
    await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: "AVAILABLE" } }),
      db.vehicle.count({ where: { status: "SOLD" } }),
      db.vehicle.count({ where: { isFeatured: true } }),
      db.inquiry.count({ where: { status: "NEW" } }),
      db.vehicle.findMany({
        include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    {
      label: "Total Vehicles",
      value: totalVehicles,
      icon: Car,
      valueClass: "text-foreground",
      iconClass: "text-foreground",
    },
    {
      label: "Available",
      value: available,
      icon: CircleCheck,
      valueClass: "text-brand",
      iconClass: "text-brand",
    },
    {
      label: "Sold",
      value: sold,
      icon: CircleOff,
      valueClass: "text-foreground",
      iconClass: "text-foreground",
    },
    {
      label: "Featured",
      value: featured,
      icon: Star,
      valueClass: "text-foreground",
      iconClass: "text-foreground",
    },
    {
      label: "New Inquiries",
      value: newInquiries,
      icon: Inbox,
      valueClass: "text-brand",
      iconClass: "text-brand",
      span: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={cn("p-5", stat.span && "col-span-2 lg:col-span-1")}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <Icon
                  className={cn("size-4 shrink-0", stat.iconClass)}
                  aria-hidden="true"
                />
              </div>
              <p
                className={cn(
                  "mt-2 font-display text-3xl font-bold tabular-nums",
                  stat.valueClass
                )}
              >
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Recently added vehicles */}
      <Card className="p-0">
        <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardTitle className="font-display text-base font-bold sm:text-lg">
            Recently Added Vehicles
          </CardTitle>
          <CardDescription>The five latest vehicles in your inventory.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4 sm:p-6 sm:pt-4">
          {recentVehicles.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <Car className="size-10 text-muted-foreground/40" aria-hidden="true" />
              <div>
                <p className="font-medium">No vehicles yet — add your first vehicle.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vehicles you add will appear here and on the public website.
                </p>
              </div>
              <Button asChild className="bg-charcoal text-white hover:bg-charcoal/90">
                <Link href="/admin/vehicles/new">
                  <Plus className="size-4" aria-hidden="true" />
                  Add Vehicle
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Photo</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Featured</TableHead>
                    <TableHead className="text-right sm:text-left">Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVehicles.map((vehicle) => {
                    const thumb = vehicle.images[0]?.url ?? null;
                    return (
                      <TableRow key={vehicle.id}>
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
                        <TableCell className="tabular-nums">
                          {formatTZS(vehicle.price)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={vehicle.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Star
                            className={cn(
                              "mx-auto size-4",
                              vehicle.isFeatured
                                ? "fill-brand text-brand"
                                : "text-muted-foreground/30"
                            )}
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            {vehicle.isFeatured ? "Featured" : "Not featured"}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(vehicle.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isAvailable = status === "AVAILABLE";
  return (
    <Badge
      className={cn(
        "border-transparent",
        isAvailable ? "bg-brand-tint text-brand" : "bg-charcoal text-white"
      )}
    >
      {isAvailable ? "Available" : "Sold"}
    </Badge>
  );
}
