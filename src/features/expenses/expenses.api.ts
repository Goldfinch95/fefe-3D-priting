// Llamadas del navegador a la API de gastos (el servidor guarda en la base de datos)
import { errors, type Expense, type ExpenseInput } from "./expenses.data";

const BASE = "/api/expenses";

async function request<T>(url: string, method: string, body?: ExpenseInput): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error(errors.save); // sin conexión
  }
  if (!res.ok) {
    const message = await res.json().then((j) => j.error as string).catch(() => null);
    throw new Error(message ?? errors.save);
  }
  return res.json();
}

export const fetchExpenses = () => request<Expense[]>(BASE, "GET");
export const createExpense = (data: ExpenseInput) => request<Expense>(BASE, "POST", data);
export const updateExpense = (id: string, data: ExpenseInput) => request<Expense>(`${BASE}/${id}`, "PUT", data);
export const deleteExpense = (id: string) => request<{ ok: true }>(`${BASE}/${id}`, "DELETE");
