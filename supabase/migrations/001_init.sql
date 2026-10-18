create table if not exists public.products (
  id text primary key, slug text not null unique, name text not null, color text not null,
  gender text not null, price_egp integer not null check (price_egp >= 0),
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key, order_number text not null unique, idempotency_key uuid not null unique,
  customer_name text not null, primary_phone text not null, secondary_phone text,
  governorate text not null, city text not null, address text not null, building_number text,
  floor_apartment text, landmark text, notes text, items_json jsonb not null,
  subtotal_egp integer not null check (subtotal_egp >= 0),
  shipping_fee_egp integer not null default 100 check (shipping_fee_egp = 100),
  cod_amount_egp integer not null check (cod_amount_egp >= 0),
  status text not null default 'طلب جديد' check (status in ('طلب جديد','تم التأكيد','جاري التجهيز','تم الشحن','تم التسليم','ملغي')),
  exported boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.orders enable row level security;
insert into public.products (id, slug, name, color, gender, price_egp) values
('ferrari-black', 'ferrari-black', 'جاكيت فراري أسود', 'أسود', 'رجالي ونسائي', 1499),
('bmw', 'bmw', 'جاكيت BMW', 'كحلي', 'رجالي ونسائي', 1499),
('ferrari-pink', 'ferrari-pink', 'جاكيت فراري وردي', 'وردي', 'رجالي ونسائي', 1499)
on conflict (id) do update set name=excluded.name, color=excluded.color, gender=excluded.gender, price_egp=excluded.price_egp, active=true;

