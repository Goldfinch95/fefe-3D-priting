// Ayudas para las rutas de la API (respuestas JSON y lectura del cuerpo)
export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

export const fail = (status: number, error: string) => json({ error }, status);

// Lee el cuerpo JSON; exige Content-Type JSON y un tamaño razonable
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) return undefined;
  const text = await request.text();
  if (text.length > 10_000) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
