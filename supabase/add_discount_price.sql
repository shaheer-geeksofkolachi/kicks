-- Run in Supabase SQL Editor if products table already exists.

alter table public.products
  add column if not exists discount_price_pkr integer;

alter table public.products drop constraint if exists products_discount_price_pkr_check;

alter table public.products
  add constraint products_discount_price_pkr_check
  check (
    discount_price_pkr is null
    or (discount_price_pkr >= 0 and discount_price_pkr < price_pkr)
  );
