# FINFIX MOTORS LIMITED — Premium Car Dealership Website

Production-ready car dealership website for **Finfix Motors Limited**
(Dar es Salaam & Dodoma, Tanzania — *Waagizaji wa Magari Aina Yote*).

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, Prisma ORM and Neon PostgreSQL. **Vercel-ready out of the box.**

## Features

### Public website
- **Homepage** — animated vehicle showcase hero, trust bar, featured vehicles, services, why-choose, recently added, CTA
- **Vehicle inventory** (`/inventory`) — search, filters (make, price range, year, transmission, fuel type, availability), sorting, load-more pagination
- **Vehicle details** (`/vehicles/[slug]`) — image gallery, full specs, availability badge, WhatsApp inquiry with vehicle name + link, related vehicles, Vehicle JSON-LD
- **Services** (`/services`), **About** (`/about`), **Contact** (`/contact`) — map embed, directions link, validated inquiry form (stored in DB, viewable in admin)
- **WhatsApp integration** — floating button, header button, per-vehicle inquiry links
- **SEO** — dynamic metadata + Open Graph (branded OG image), `sitemap.xml`, `robots.txt`, AutoDealer + Vehicle structured data (two-branch addresses), semantic HTML
- **Resilience** — public pages render graceful empty states during transient DB outages (e.g. Neon compute waking from auto-suspend)

### Admin dashboard (`/admin`)
- Secure login (bcrypt password hashing, JWT httpOnly cookie session)
- Route protection via `src/proxy.ts` **and** per-request server-side auth checks
- Rate limiting on login/inquiry endpoints; same-origin checks on all mutations
- Dashboard overview (total / available / sold / featured vehicles, new inquiries, recently added)
- Vehicle management — create, edit, delete (with storage cleanup), multi-image upload with previews + reorder + "main photo", featured toggle, sold/available status
- Services management (admin-editable service content)
- Site settings management (contact info, hero copy, about text, map query, Instagram)
- Inquiry inbox (new/read status, delete, vehicle link)

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons |
| Database | Prisma ORM + PostgreSQL (Neon) |
| Auth | bcryptjs + JWT (jose) in httpOnly cookie |
| Images | Cloudinary (server-side upload), local `public/uploads` fallback for dev |
| Deployment | Vercel (free Hobby plan compatible) |

---

## 1. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Database (Neon pooled connection string)
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require"

# Optional: direct (non-pooled) URL — only used by Prisma CLI migrations locally
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.<region>.aws.neon.tech/neondb?sslmode=require"

# Security — REQUIRED in production. Generate: openssl rand -base64 48
SESSION_SECRET="<random 64+ char string>"

# Public site URL (optional on Vercel — auto-falls back to the project domain)
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# Cloudinary (vehicle image storage) — REQUIRED on Vercel
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="1234567890"
CLOUDINARY_API_SECRET="your-api-secret"
```

> Secrets are only ever read server-side. Nothing is exposed to the browser except `NEXT_PUBLIC_SITE_URL`.

## 2. Deploy to Vercel (free)

1. **Push this repository to GitHub.**

2. **Import the project on [vercel.com](https://vercel.com)** (free Hobby plan works perfectly).

3. **Add environment variables** in *Settings → Environment Variables* (Production + Preview):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** connection string (with `sslmode=require`) |
   | `SESSION_SECRET` | Same strong secret as local (keep it stable) |
   | `NEXT_PUBLIC_SITE_URL` | Your domain (optional — falls back to `*.vercel.app`) |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials (required for image uploads) |

   > `DIRECT_URL` is **not** needed on Vercel — it is only used when running migrations locally.

4. **Deploy.** The build runs `prisma generate` (postinstall + build hook) automatically. No extra build settings are required — `next.config.ts` is already Vercel-compatible.

5. **Create the database schema** (first deployment only). Run locally against the same Neon database:

   ```bash
   bun run db:push      # creates/updates tables on Neon
   bun run db:seed      # optional: seeds services, site settings + sample vehicles
   ```

   Or, to rebrand/re-sync an **existing** database:

   ```bash
   bun scripts/rebrand-finfix.ts   # applies Finfix settings/services/vehicles/admin
   ```

6. **First admin.** If the database has no admin yet, visit `/admin` → you are redirected to `/admin/setup` (one-time; locks itself afterwards).

### Deployment verification checklist
- [ ] `/` renders hero + featured vehicles (DB seeded)
- [ ] `/api/vehicles` returns JSON
- [ ] Image upload returns a Cloudinary URL (admin → add vehicle)
- [ ] WhatsApp buttons open `wa.me/255650090909` with prefilled text
- [ ] `/sitemap.xml` and `/robots.txt` respond
- [ ] Contact form submission appears in Admin → Inquiries

## 3. Cloudinary configuration

1. Create a free Cloudinary account → *Dashboard → API Keys*.
2. Put the cloud name / API key / API secret into the environment variables.
3. Vehicle images upload server-side to the `finfix-motors/vehicles` folder with automatic 1600px / auto-quality transformation.
4. Uploads are validated server-side: JPG/PNG/WebP only, max 4 MB, max 6 files per request, max 12 images per vehicle. Old images are deleted from Cloudinary when removed from a vehicle or when the vehicle is deleted.
5. If Cloudinary env vars are **not** set, uploads fall back to local `public/uploads` storage — convenient for local development, **not persisted on Vercel** (serverless filesystem is read-only and the app returns a clear configuration error). Always configure Cloudinary in production.

## 4. Security notes

- **No hardcoded admin credentials.** The first admin is created through a one-time setup flow (`/admin/setup`) that permanently locks itself once any admin exists.
- JWT session cookie: `HttpOnly`, `SameSite=Lax`, `Secure` in production, 7-day expiry.
- Login rate limiting: 8 attempts / 15 min / IP (in-memory — per serverless instance; acceptable for low traffic. For strict global limits add Upstash Redis later).
- Same-origin (Origin header) checks on all mutating API routes.
- `SESSION_SECRET` must stay stable across deployments, otherwise sessions are invalidated on each deploy.

## Local development

```bash
bun install
bun run db:push       # sync schema to Neon (uses DIRECT_URL when set)
bun run db:seed       # optional demo data
bun run dev           # http://localhost:3000
bun run lint          # ESLint
```

## Project structure

```
prisma/                 schema.prisma, seed.ts
src/app/
  layout.tsx            metadata + fonts
  page.tsx              Homepage (hero carousel, featured, services, why-choose, CTA)
  (site)/               inventory, vehicles/[slug], services, about, contact
  admin/(auth)/         login, one-time setup
  admin/(dashboard)/    dashboard, vehicles CRUD, inquiries, services, settings
  api/                  vehicles (public), inquiries (public), admin/** (guarded)
  sitemap.ts robots.ts
src/components/
  site/                 header, footer, contact bar, hero carousel, vehicle card
  public/               inventory client, gallery, contact form, final CTA
  admin/                admin shell, managers, forms
  ui/                   shadcn/ui primitives
src/lib/                db, auth (jwt/session), cloudinary, validators, rate-limit,
                        whatsapp, format, settings, services-data, vehicles, site-url
src/proxy.ts            admin route protection (edge, jose)
scripts/                generate-brand-assets.ts, rebrand-finfix.ts
```

## Business information

- **Finfix Motors Limited** — *Waagizaji wa Magari Aina Yote* (we deal in all types of vehicles)
- Locations: **Dar es Salaam** (0650 090 909) and **Dodoma** (0650 050 505), Tanzania
- Services: buying & selling vehicles, vehicle importation on order, vehicle transportation, buying vehicles directly from customers
- Tagline: *Exceptional Service, Extraordinary Vehicle*

> Inventory entries shipped with the seed are **sample placeholders** — replace them
> with real stock from the admin dashboard.
#   f i n f i x - m o t o r s  
 