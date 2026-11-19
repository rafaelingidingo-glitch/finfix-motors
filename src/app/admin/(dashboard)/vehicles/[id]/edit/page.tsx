import type { Metadata } from "next";
import { VehicleForm } from "../../vehicle-form";

export const metadata: Metadata = {
  title: "Edit Vehicle",
};

export const dynamic = "force-dynamic";

export default async function AdminEditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleForm mode="edit" vehicleId={id} />;
}
