-- Tabla de gastos. Ejecutala una sola vez en el SQL Editor de Supabase.
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

-- Lista ordenada por los más nuevos primero
create index if not exists expenses_created_at_idx on expenses (created_at desc);

-- Tiempo real: el navegador solo puede LEER (para recibir avisos de cambios).
-- Escribir lo hace únicamente el servidor del sitio, que se conecta con su propia clave.
alter table expenses enable row level security;

do $$
begin
  -- Permiso de lectura para la clave pública (anon); sin permisos de escritura
  if exists (select 1 from pg_roles where rolname = 'anon') then
    drop policy if exists "expenses_realtime_read" on expenses;
    create policy "expenses_realtime_read" on expenses for select to anon using (true);
  end if;
  -- Activa los avisos de cambios en la tabla
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'expenses') then
    alter publication supabase_realtime add table expenses;
  end if;
end $$;

-- (Opcional) datos de ejemplo para probar:
-- insert into expenses (description, supplier, date, quantity, amount, notes) values
--   ('Filamento PLA negro 1 kg', 'Filamentos del Sur', '2026-10-02', 4, 72000, 'Compra mensual'),
--   ('Resina UV gris 1 litro', 'Insumos 3D', '2026-10-05', 2, 64000, null);
