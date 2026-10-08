# Kicksplosion.store

Next.js catalog for **Kicksplosion.store** — public shoe catalog with filters, media sliders, and an admin area for product management. **Supabase** stores product data; **AWS S3** stores images and videos. Deploy on **Vercel**.

## Features

- Branded loading splash on the home page
- Product grid with search and brand filter
- Redesigned product detail page (gallery + thumbnails, WhatsApp order CTA)
- **SOLD** overlay on sold items
- Admin login, CRUD, media upload to S3, mark sold / available

## Setup

### 1. Supabase (database)

1. Open your project → **SQL Editor** → run [`supabase/schema.sql`](supabase/schema.sql). If the DB already exists, also run [`supabase/add_size_unit.sql`](supabase/add_size_unit.sql).
2. Copy **Project URL**, **publishable key**, and **secret key** from **Settings → API**.

### 2. AWS S3 (media)

1. Bucket: **`kicksplosion-bucket`** (or your bucket name).
2. IAM user with `s3:PutObject`, `s3:DeleteObject`, `s3:DeleteObjects` on that bucket.
3. **Public read** for catalog URLs — either:
   - Bucket policy allowing `s3:GetObject` for `arn:aws:s3:::your-bucket/products/*` with `"Principal": "*"`, or
   - Objects uploaded with public-read ACL (not recommended for all use cases).
4. Set **`AWS_REGION`** to the bucket’s region (e.g. `eu-north-1`). Public image URLs are built from **`AWS_S3_BUCKET`** + **`AWS_REGION`** at deploy time — you do **not** need `NEXT_PUBLIC_AWS_REGION`.

### 3. Local environment

```bash
cp .env.example .env.local
```

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key — server only |
| `AWS_REGION` | S3 bucket region (required for uploads and catalog image URLs) |
| `AWS_S3_BUCKET` | Bucket name |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM credentials — server only |
| `NEXT_PUBLIC_S3_PUBLIC_URL_BASE` | Optional; override public media URL base (default: derived from bucket + region at build) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp for “Order on WhatsApp” (e.g. `923001234567`) |
| `NEXT_PUBLIC_SITE_URL` | Optional override for canonical URLs (sitemap, robots, WhatsApp). Defaults to `https://kicksplosion.store` on Vercel production if unset. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login |
| `SESSION_SECRET` | At least 32 random characters |

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Deploy on Vercel

Add all variables from `.env.local`. Never prefix `AWS_SECRET_ACCESS_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `ADMIN_PASSWORD` with `NEXT_PUBLIC_`.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres), AWS S3 (media)
- Embla Carousel, iron-session
