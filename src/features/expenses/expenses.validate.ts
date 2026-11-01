// Validación de lo que llega a la API (nunca se confía en el navegador)
import type { ExpenseInput } from "./expenses.data";

type Result = { ok: true; value: ExpenseInput } | { ok: false; error: string };

const text = (v: unknown, max: number) => (typeof v === "string" && v.trim().length >= 1 && v.trim().length <= max ? v.trim() : null);
const isDate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s);

export function parseExpenseInput(body: unknown): Result {
  const b = (body ?? {}) as Record<string, unknown>;
  const description = text(b.description, 200);
  const supplier = text(b.supplier, 120);
  const notes = b.notes == null || b.notes === "" ? null : text(b.notes, 1000);

  if (!description) return { ok: false, error: "La descripción es obligatoria (hasta 200 caracteres)." };
  if (!supplier) return { ok: false, error: "El proveedor es obligatorio (hasta 120 caracteres)." };
  if (!isDate(b.date)) return { ok: false, error: "La fecha no es válida." };
  if (!Number.isInteger(b.quantity) || (b.quantity as number) < 1 || (b.quantity as number) > 1_000_000)
    return { ok: false, error: "La cantidad debe ser un número entero de 1 en adelante." };
  if (typeof b.amount !== "number" || !Number.isFinite(b.amount) || b.amount < 0 || b.amount > 1e12)
    return { ok: false, error: "El monto no es válido." };
  if (b.notes != null && b.notes !== "" && notes === null) return { ok: false, error: "Las observaciones son muy largas (hasta 1000 caracteres)." };

  return {
    ok: true,
    value: { description, supplier, date: b.date, quantity: b.quantity as number, amount: Math.round(b.amount * 100) / 100, notes },
  };
}
