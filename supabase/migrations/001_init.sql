begin;

create table if not exists public.orders (
  id uuid primary key,
  order_number text not null unique,
  idempotency_key uuid not null unique,
  customer_name text not null,
  primary_phone text not null,
  secondary_phone text,
  governorate text not null,
  city text not null,
  address text not null,
  building_number text,
  floor_apartment text,
  landmark text,
  notes text,
  items_json jsonb not null check (jsonb_typeof(items_json) = 'array'),
  subtotal_egp integer not null check (subtotal_egp >= 0),
  shipping_fee_egp integer not null default 100 check (shipping_fee_egp = 100),
  cod_amount_egp integer not null check (cod_amount_egp >= 0),
  status text not null default 'طلب جديد' check (
    status in ('طلب جديد', 'تم التأكيد', 'جاري التجهيز', 'تم الشحن', 'تم التسليم', 'ملغي')
  ),
  exported boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

alter table public.orders enable row level security;

revoke all on table public.orders from anon, authenticated;
grant select, insert, update, delete on table public.orders to service_role;

commit;

