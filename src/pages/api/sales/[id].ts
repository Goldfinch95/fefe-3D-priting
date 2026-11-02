// API: PUT /api/sales/:id (editar) y DELETE /api/sales/:id (borrar)
import type { APIRoute } from "astro";
import { updateSale, deleteSale } from "../../../features/sales/sales.repo";
import { parseSaleInput } from "../../../features/sales/sales.validate";
import { json, fail, readJson } from "../../../shared/http";

export const PUT: APIRoute = async ({ params, request }) => {
  const parsed = parseSaleInput(await readJson(request));
  if (!parsed.ok) return fail(400, parsed.error);
  try {
    const saved = await updateSale(params.id ?? "", parsed.value);
    return saved ? json(saved) : fail(404, "La venta ya no existe.");
  } catch (e) {
    console.error("PUT /api/sales/:id", e);
    return fail(500, "No se pudo guardar la venta.");
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    return (await deleteSale(params.id ?? "")) ? json({ ok: true }) : fail(404, "La venta ya no existe.");
  } catch (e) {
    console.error("DELETE /api/sales/:id", e);
    return fail(500, "No se pudo eliminar la venta.");
  }
};
