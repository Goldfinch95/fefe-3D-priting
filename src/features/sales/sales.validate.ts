// Validación de lo que llega a la API (nunca se confía en el navegador)
import { sellers, type SaleInput } from "./sales.data";

type Result = { ok: true; value: SaleInput } | { ok: false; error: string };

const text = (v: unknown, max: number) => (typeof v === "string" && v.trim().length >= 1 && v.trim().length <= max ? v.trim() : null);
const isDate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s);

export function parseSaleInput(body: unknown): Result {
  const b = (body ?? {}) as Record<string, unknown>;
  const product = text(b.product, 200);
  const customer = text(b.customer, 120);
  const notes = b.notes == null || b.notes === "" ? null : text(b.notes, 1000);
  const seller = sellers.find((s) => s.value === b.seller)?.value;

  if (!product) return { ok: false, error: "El producto es obligatorio (hasta 200 caracteres)." };
  if (!customer) return { ok: false, error: "El cliente es obligatorio (hasta 120 caracteres)." };
  if (!isDate(b.date)) return { ok: false, error: "La fecha no es válida." };
  if (!Number.isInteger(b.quantity) || (b.quantity as number) < 1 || (b.quantity as number) > 1_000_000)
    return { ok: false, error: "La cantidad debe ser un número entero de 1 en adelante." };
  if (typeof b.amount !== "number" || !Number.isFinite(b.amount) || b.amount < 0 || b.amount > 1e12)
    return { ok: false, error: "El monto no es válido." };
  if (!seller) return { ok: false, error: "Elegí quién vendió (Fede o Fer)." };
  if (b.notes != null && b.notes !== "" && notes === null) return { ok: false, error: "Las observaciones son muy largas (hasta 1000 caracteres)." };

  return {
    ok: true,
    value: { product, customer, date: b.date, quantity: b.quantity as number, amount: Math.round(b.amount * 100) / 100, seller, notes },
  };
}
