import type { Metadata } from "next";
import { VehiclesManager } from "./vehicles-manager";

export const metadata: Metadata = {
  title: "Vehicles",
};

export const dynamic = "force-dynamic";

export default function AdminVehiclesPage() {
  return <VehiclesManager />;
}
