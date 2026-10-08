-- Kicksplosion.pk catalog schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  description text,
  price_pkr integer not null check (price_pkr >= 0),
  discount_price_pkr integer check (
    discount_price_pkr is null
    or (discount_price_pkr >= 0 and discount_price_pkr < price_pkr)
  ),
  sizes text[] not null default '{}',
  size_unit text not null default 'UK' check (size_unit in ('UK', 'US', 'EU')),
  is_sold boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  sort_order integer not null default 0
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  customer_name text,
  kind text not null check (kind in ('text', 'image')),
  body_text text,
  image_storage_path text,
  created_at timestamptz not null default now(),
  constraint product_reviews_one_per_product unique (product_id),
  constraint product_reviews_content_check check (
    (
      kind = 'text'
      and body_text is not null
      and length(trim(body_text)) > 0
    )
    or (
      kind = 'image'
      and image_storage_path is not null
      and length(trim(image_storage_path)) > 0
    )
  )
);

create index if not exists product_reviews_created_at_idx on public.product_reviews (created_at desc);

create index if not exists product_media_product_id_idx on public.product_media (product_id);
create index if not exists products_brand_idx on public.products (brand);
create index if not exists products_name_idx on public.products (name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_reviews enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read product_media" on public.product_media;
create policy "Public read product_media"
  on public.product_media for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read product_reviews" on public.product_reviews;
create policy "Public read product_reviews"
  on public.product_reviews for select
  to anon, authenticated
  using (true);

-- Writes use the service role key from Next.js (bypasses RLS).
-- Product images/videos are stored in AWS S3; `storage_path` is the S3 object key.
