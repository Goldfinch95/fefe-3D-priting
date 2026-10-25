// Guardado de gastos en el navegador (localStorage).
// Para pasar a una base de datos, cambiá solo las funciones de este archivo.
import { expenses as seed, type Expense } from "./expenses.data";

const KEY = "fefe:expenses";

export const newId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Descarta datos que no tengan la forma de un gasto
const isExpense = (x: any): x is Expense =>
  x && typeof x.description === "string" && typeof x.supplier === "string" &&
  typeof x.date === "string" && typeof x.quantity === "number" && typeof x.amount === "number";

const write = (list: Expense[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* sin storage el cambio igual se ve hasta recargar */
  }
};

// Lista guardada, o los datos de ejemplo la primera vez
export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return seed;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return seed;
    const list: Expense[] = data.filter(isExpense);
    // Gastos guardados antes de existir el id: se les asigna uno y se guarda
    if (list.some((e) => !e.id)) {
      list.forEach((e) => (e.id ||= newId()));
      write(list);
    }
    return list;
  } catch {
    return seed; // storage bloqueado o JSON dañado
  }
}

export const addExpense = (e: Expense) => write([e, ...loadExpenses()]);
export const updateExpense = (e: Expense) =>
  write(loadExpenses().map((x) => (x.id === e.id ? e : x)));