// Llamadas del navegador a la API de ventas (el servidor guarda en la base de datos)
import { errors, type Sale, type SaleInput } from "./sales.data";

const BASE = "/api/sales";

async function request<T>(url: string, method: string, body?: SaleInput): Promise<T> {
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

export const fetchSales = () => request<Sale[]>(BASE, "GET");
export const createSale = (data: SaleInput) => request<Sale>(BASE, "POST", data);
export const updateSale = (id: string, data: SaleInput) => request<Sale>(`${BASE}/${id}`, "PUT", data);
export const deleteSale = (id: string) => request<{ ok: true }>(`${BASE}/${id}`, "DELETE");
