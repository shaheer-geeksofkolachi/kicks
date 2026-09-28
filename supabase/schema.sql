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

-- Writes use the service role key from Next.js (bypasses RLS).
-- Product images/videos are stored in AWS S3; `storage_path` is the S3 object key.
