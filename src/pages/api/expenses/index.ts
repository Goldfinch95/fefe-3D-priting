// API: GET /api/expenses (lista) y POST /api/expenses (crear)
import type { APIRoute } from "astro";
import { listExpenses, createExpense } from "../../../features/expenses/expenses.repo";
import { parseExpenseInput } from "../../../features/expenses/expenses.validate";
import { json, fail, readJson } from "../../../features/expenses/expenses.http";

export const GET: APIRoute = async () => {
  try {
    return json(await listExpenses());
  } catch (e) {
    console.error("GET /api/expenses", e);
    return fail(500, "No se pudieron cargar los gastos.");
  }
};

export const POST: APIRoute = async ({ request }) => {
  const parsed = parseExpenseInput(await readJson(request));
  if (!parsed.ok) return fail(400, parsed.error);
  try {
    return json(await createExpense(parsed.value), 201);
  } catch (e) {
    console.error("POST /api/expenses", e);
    return fail(500, "No se pudo guardar el gasto.");
  }
};
