// Cálculo del resumen (total, cantidad y gasto mayor): lo usan el servidor y el navegador
import type { Expense } from "./expenses.data";
import { sumAmounts } from "../../shared/format";
export { sumAmounts };

export interface Summary {
  total: number;
  count: number;
  biggest: Expense | null;
}

export function summarize(list: Expense[]): Summary {
  const biggest = list.reduce<Expense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null);
  return { total: sumAmounts(list), count: list.length, biggest };
}
