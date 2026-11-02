// Consultas SQL de ventas (único archivo del servidor que habla con la tabla sales)
import { getDb } from "../../db/client";
import type { Sale, SaleInput } from "./sales.data";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Columnas devueltas: fecha como AAAA-MM-DD y monto como número
const cols = () =>
  getDb()`id, product, customer, to_char(date, 'YYYY-MM-DD') as date, quantity, amount::float8 as amount, seller, notes`;

export async function listSales(): Promise<Sale[]> {
  const sql = getDb();
  return sql<Sale[]>`select ${cols()} from sales order by date desc, created_at desc, id`;
}

export async function createSale(s: SaleInput): Promise<Sale> {
  const sql = getDb();
  const [row] = await sql<Sale[]>`
    insert into sales (product, customer, date, quantity, amount, seller, notes)
    values (${s.product}, ${s.customer}, ${s.date}::date, ${s.quantity}, ${s.amount}, ${s.seller}, ${s.notes})
    returning ${cols()}`;
  return row;
}

// Devuelve null si la venta no existe
export async function updateSale(id: string, s: SaleInput): Promise<Sale | null> {
  if (!UUID.test(id)) return null;
  const sql = getDb();
  const [row] = await sql<Sale[]>`
    update sales set product = ${s.product}, customer = ${s.customer}, date = ${s.date}::date,
      quantity = ${s.quantity}, amount = ${s.amount}, seller = ${s.seller}, notes = ${s.notes}, updated_at = now()
    where id = ${id}
    returning ${cols()}`;
  return row ?? null;
}

// Devuelve false si la venta no existe
export async function deleteSale(id: string): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const sql = getDb();
  const rows = await sql`delete from sales where id = ${id} returning id`;
  return rows.length > 0;
}