-- Urban Threads storefront schema. Apply with `supabase db push` or the Supabase SQL editor.
create table public.products (id bigint primary key, name text not null, category text not null check (category in ('T-Shirts', 'Jeans', 'Hoodies', 'Sneakers')), color text not null, price_cents integer not null check (price_cents > 0), image_url text not null, active boolean not null default true, created_at timestamptz not null default now());
create table public.orders (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete restrict, customer_email text not null, total_cents integer not null check (total_cents > 0), created_at timestamptz not null default now());
create table public.order_items (id bigint generated always as identity primary key, order_id uuid not null references public.orders(id) on delete cascade, product_id bigint not null references public.products(id) on delete restrict, product_name text not null, unit_price_cents integer not null check (unit_price_cents > 0), quantity integer not null check (quantity > 0), created_at timestamptz not null default now());
create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.products, public.orders, public.order_items from anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.orders, public.order_items to authenticated;
create policy "Anyone can view active products" on public.products for select to anon, authenticated using (active = true);
create policy "Users can view their own orders" on public.orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can view items from their orders" on public.order_items for select to authenticated using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = (select auth.uid())));
insert into public.products (id, name, category, color, price_cents, image_url) values
  (1, 'The Essential Tee', 'T-Shirts', 'Ivory', 3600, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85'),
  (2, 'Relaxed Straight Jean', 'Jeans', 'Washed Blue', 9800, 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85'),
  (3, 'Heavyweight Hoodie', 'Hoodies', 'Oatmeal', 8400, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85'),
  (4, 'Everyday Runner', 'Sneakers', 'Stone', 12000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85')
on conflict (id) do update set name = excluded.name, category = excluded.category, color = excluded.color, price_cents = excluded.price_cents, image_url = excluded.image_url, active = true;
