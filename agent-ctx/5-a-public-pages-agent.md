# Task 5-a — Public Pages (Elly Magari)

## Scope
Created all public (site) pages and their client components:
- `src/app/(site)/inventory/page.tsx` + `src/components/public/inventory-client.tsx`
- `src/app/(site)/vehicles/[slug]/page.tsx` + `src/components/public/vehicle-gallery.tsx`
- `src/app/(site)/services/page.tsx`
- `src/app/(site)/about/page.tsx` (+ generated `public/images/about-showroom.jpg`)
- `src/app/(site)/contact/page.tsx` + `src/components/public/contact-form.tsx`
- `src/components/public/final-cta.tsx` (shared dark CTA band used by services/about)

## Key implementation notes for later agents
- Inventory client talks to `GET /api/vehicles` (relative fetch only): search/make/minPrice/maxPrice/year/transmission/fuelType/status/sort/page. Debounce 400ms on search + price inputs; selects apply instantly; AbortController cancels stale requests; "Load More" appends pages (pageSize 9) with dedupe + stale-snapshot guard; skeletons while pending; empty + error states with retry. "All" options use Radix `all` sentinel (Radix forbids empty-string item values).
- Vehicle detail: `generateMetadata` awaits `params` (Next 16 Promise params), OG image uses first vehicle image (metadataBase resolves relative `/uploads/...`), JSON-LD `Vehicle` schema with `mileageFromOdometer`, `offers` (TZS, InStock/SoldOut). Sold vehicles keep the WhatsApp button working.
- Contact form posts JSON to `POST /api/inquiries` (validation matches `inquirySchema`; email omitted when empty). Toasts via sonner. Rate limit 5/10min per IP handled server-side (429 message shown in toast).
- All DB-reading pages export `dynamic = "force-dynamic"`.
- Generated `/images/about-showroom.jpg` (1344x768) for the About page.

## Verification (this task)
- curl 200 on: `/inventory`, `/services`, `/about`, `/contact`, `/vehicles/mercedes-benz-e200-2016-sedan`, `/`.
- Filtered API round-trip verified (make=Toyota&transmission=Automatic&status=AVAILABLE&sort=price_asc).
- `bun run lint`: 0 errors in task-5-a files. NOTE: 2 pre-existing lint errors in OTHER agents' files (out of my scope, untouched): `src/components/site/vehicle-whatsapp-button.tsx:34` and `src/components/site/whatsapp-float.tsx:15` (react-hooks/set-state-in-effect).
- `tsc --noEmit`: 0 errors in `src/app/(site)/**` and `src/components/public/**`. Remaining tsc errors are in other agents' files (`src/lib/vehicles.ts` Prisma include typing, `src/app/api/admin/upload/route.ts`, `examples/`, `skills/`) — build is unaffected (`ignoreBuildErrors: true`).

## Open items for other tasks
- Seed vehicle images `/images/cars/{fit,harrier,e200,cx5,xtrail,corolla,hilux,prado}.jpg` and `/images/hero.jpg` referenced by DB rows/OG meta do not exist yet (404s in dev.log) — image/seed task should provide them. The About showroom image is already in place.
- The 2 lint errors above (site shell components) belong to the shell task owner.
