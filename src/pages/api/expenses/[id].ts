// API: PUT /api/expenses/:id (editar) y DELETE /api/expenses/:id (borrar)
import type { APIRoute } from "astro";
import { updateExpense, deleteExpense } from "../../../features/expenses/expenses.repo";
import { parseExpenseInput } from "../../../features/expenses/expenses.validate";
import { json, fail, readJson } from "../../../features/expenses/expenses.http";

export const PUT: APIRoute = async ({ params, request }) => {
  const parsed = parseExpenseInput(await readJson(request));
  if (!parsed.ok) return fail(400, parsed.error);
  try {
    const saved = await updateExpense(params.id ?? "", parsed.value);
    return saved ? json(saved) : fail(404, "El gasto ya no existe.");
  } catch (e) {
    console.error("PUT /api/expenses/:id", e);
    return fail(500, "No se pudo guardar el gasto.");
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    return (await deleteExpense(params.id ?? "")) ? json({ ok: true }) : fail(404, "El gasto ya no existe.");
  } catch (e) {
    console.error("DELETE /api/expenses/:id", e);
    return fail(500, "No se pudo eliminar el gasto.");
  }
};
