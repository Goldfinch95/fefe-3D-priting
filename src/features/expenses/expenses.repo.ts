// Consultas SQL de gastos (único archivo del servidor que habla con la tabla)
import { getDb } from "../../db/client";
import type { Expense, ExpenseInput } from "./expenses.data";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Columnas devueltas: fecha como AAAA-MM-DD y monto como número
const cols = () => getDb()`id, description, supplier, to_char(date, 'YYYY-MM-DD') as date, quantity, amount::float8 as amount, notes`;

export async function listExpenses(): Promise<Expense[]> {
  const sql = getDb();
  return sql<Expense[]>`select ${cols()} from expenses order by created_at desc, id`;
}

export async function createExpense(e: ExpenseInput): Promise<Expense> {
  const sql = getDb();
  const [row] = await sql<Expense[]>`
    insert into expenses (description, supplier, date, quantity, amount, notes)
    values (${e.description}, ${e.supplier}, ${e.date}::date, ${e.quantity}, ${e.amount}, ${e.notes})
    returning ${cols()}`;
  return row;
}

// Devuelve null si el gasto no existe
export async function updateExpense(id: string, e: ExpenseInput): Promise<Expense | null> {
  if (!UUID.test(id)) return null;
  const sql = getDb();
  const [row] = await sql<Expense[]>`
    update expenses set description = ${e.description}, supplier = ${e.supplier}, date = ${e.date}::date,
      quantity = ${e.quantity}, amount = ${e.amount}, notes = ${e.notes}, updated_at = now()
    where id = ${id}
    returning ${cols()}`;
  return row ?? null;
}

// Devuelve false si el gasto no existe
export async function deleteExpense(id: string): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const sql = getDb();
  const rows = await sql`delete from expenses where id = ${id} returning id`;
  return rows.length > 0;
}
