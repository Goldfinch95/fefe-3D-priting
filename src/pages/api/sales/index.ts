// API: GET /api/sales (lista) y POST /api/sales (crear)
import type { APIRoute } from "astro";
import { listSales, createSale } from "../../../features/sales/sales.repo";
import { parseSaleInput } from "../../../features/sales/sales.validate";
import { json, fail, readJson } from "../../../shared/http";

export const GET: APIRoute = async () => {
  try {
    return json(await listSales());
  } catch (e) {
    console.error("GET /api/sales", e);
    return fail(500, "No se pudieron cargar las ventas.");
  }
};

export const POST: APIRoute = async ({ request }) => {
  const parsed = parseSaleInput(await readJson(request));
  if (!parsed.ok) return fail(400, parsed.error);
  try {
    return json(await createSale(parsed.value), 201);
  } catch (e) {
    console.error("POST /api/sales", e);
    return fail(500, "No se pudo guardar la venta.");
  }
};
