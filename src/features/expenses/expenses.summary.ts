// Cálculo del resumen (total, cantidad y gasto mayor): lo usan el servidor y el navegador
import type { Expense } from "./expenses.data";

export interface Summary {
  total: number;
  count: number;
  biggest: Expense | null;
}

// Suma en centavos para evitar errores de decimales (0.1 + 0.2)
export const sumAmounts = (list: Expense[]) =>
  list.reduce((acc, e) => acc + Math.round(e.amount * 100), 0) / 100;

export function summarize(list: Expense[]): Summary {
  const biggest = list.reduce<Expense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null);
  return { total: sumAmounts(list), count: list.length, biggest };
}