import type { Metadata } from "next";
import { VehicleForm } from "../vehicle-form";

export const metadata: Metadata = {
  title: "Add Vehicle",
};

export const dynamic = "force-dynamic";

export default function AdminNewVehiclePage() {
  return <VehicleForm mode="create" />;
}
