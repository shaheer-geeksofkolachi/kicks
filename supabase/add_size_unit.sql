-- Run once if products table already exists without size_unit
alter table public.products
  add column if not exists size_unit text not null default 'UK';

alter table public.products drop constraint if exists products_size_unit_check;
alter table public.products
  add constraint products_size_unit_check check (size_unit in ('UK', 'US', 'EU'));
