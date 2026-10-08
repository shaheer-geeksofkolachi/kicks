-- Run in Supabase SQL Editor

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

alter table public.product_reviews enable row level security;

drop policy if exists "Public read product_reviews" on public.product_reviews;
create policy "Public read product_reviews"
  on public.product_reviews for select
  to anon, authenticated
  using (true);
