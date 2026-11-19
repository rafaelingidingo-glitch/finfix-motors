import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/site-shell";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="flex min-h-[60svh] items-center justify-center bg-background px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <p className="font-display text-6xl font-extrabold text-gold">404</p>
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The page you are looking for does not exist or may have moved. Browse our vehicle
            inventory or contact us and we will point you in the right direction.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-charcoal text-white hover:bg-charcoal/90">
              <Link href="/inventory">Browse Inventory</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
