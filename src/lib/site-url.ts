/**
 * Canonical public site URL.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL          — explicit custom domain (set in Vercel env vars)
 * 2. VERCEL_PROJECT_PRODUCTION_URL — auto-injected by Vercel (e.g. "finfix-motors.vercel.app")
 * 3. http://localhost:3000         — local development
 *
 * Used for metadataBase, Open Graph URLs, sitemap.xml, robots.txt and the
 * JSON-LD structured data.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}
