import { SiteShell } from "@/components/site/site-shell";

/**
 * Layout for all public sub-pages (inventory, vehicle details, services,
 * about, contact) — shares the same header/footer shell as the homepage.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
