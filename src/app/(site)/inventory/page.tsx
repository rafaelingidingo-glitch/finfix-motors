import type { Metadata } from "next";
import { InventoryClient } from "@/components/public/inventory-client";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vehicle Inventory",
  description:
    "Browse the current stock of quality used and new vehicles at Finfix Motors Limited in Dar es Salaam and Dodoma, Tanzania. Filter by make, price, year, transmission and fuel type.",
};

/** Public inventory listing page. */
export default async function InventoryPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main-content">
      {/* Compact dark hero band */}
      <section className="bg-charcoal py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-soft">
            Finfix Motors Limited
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Vehicle Inventory
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            Browse our current stock of quality vehicles in Dar es Salaam and Dodoma, Tanzania.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14" aria-label="Vehicle listings">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <InventoryClient whatsappNumber={settings.whatsappNumber} />
        </div>
      </section>
    </main>
  );
}
