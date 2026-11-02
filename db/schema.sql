-- Tablas del sitio. Ejecutalo en el SQL Editor de Supabase (se puede correr todas las veces que quieras:
-- no borra ni duplica nada).

-- ============ GASTOS ============
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  description text         not null check (char_length(description) between 1 and 200),
  supplier    text         not null check (char_length(supplier) between 1 and 120),
  date        date         not null,
  quantity    integer      not null check (quantity >= 1),
  amount      numeric(14,2) not null check (amount >= 0),
  notes       text         check (notes is null or char_length(notes) <= 1000),
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);
create index if not exists expenses_created_at_idx on expenses (created_at desc);

-- ============ VENTAS ============
create table if not exists sales (
  id          uuid primary key default gen_random_uuid(),
  product     text         not null check (char_length(product) between 1 and 200),
  customer    text         not null check (char_length(customer) between 1 and 120),
  date        date         not null,
  quantity    integer      not null check (quantity >= 1),
  amount      numeric(14,2) not null check (amount >= 0),
  seller      text         not null check (seller in ('fede', 'fer')),  -- medio de venta
  notes       text         check (notes is null or char_length(notes) <= 1000),
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);
create index if not exists sales_created_at_idx on sales (created_at desc);

-- ============ TIEMPO REAL ============
-- El navegador solo puede LEER (para recibir avisos de cambios).
-- Escribir lo hace únicamente el servidor del sitio, que se conecta con su propia clave.
do $$
declare t text;
begin
  foreach t in array array['expenses', 'sales'] loop
    execute format('alter table %I enable row level security', t);
    -- Permiso de lectura para la clave pública (anon); sin permisos de escritura
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('drop policy if exists %I on %I', t || '_realtime_read', t);
      execute format('create policy %I on %I for select to anon using (true)', t || '_realtime_read', t);
    end if;
    -- Activa los avisos de cambios en la tabla
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
       and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = t) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- (Opcional) datos de ejemplo para probar:
-- insert into sales (product, customer, date, quantity, amount, seller, notes) values
--   ('Llavero personalizado', 'Juan Pérez', '2026-10-28', 10, 25000, 'fede', 'Con nombre'),
--   ('Soporte de auriculares', 'Ana Gómez', '2026-10-29', 2, 18000, 'fer', null);
