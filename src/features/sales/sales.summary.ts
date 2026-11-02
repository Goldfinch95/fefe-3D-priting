// Cálculo del resumen de ventas: total, cantidad y total por vendedor (servidor y navegador)
import { sellers, type Sale, type Seller } from "./sales.data";
import { sumAmounts } from "../../shared/format";
export { sumAmounts };

export interface Summary {
  total: number;
  count: number;
  bySeller: Record<Seller, number>;
}

export function summarize(list: Sale[]): Summary {
  const bySeller = Object.fromEntries(sellers.map((s) => [s.value, sumAmounts(list.filter((x) => x.seller === s.value))])) as Record<Seller, number>;
  return { total: sumAmounts(list), count: list.length, bySeller };
}
