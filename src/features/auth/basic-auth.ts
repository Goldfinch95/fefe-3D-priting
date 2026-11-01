// Contraseña opcional (HTTP Basic): solo se pide si existe la variable APP_PASSWORD
import { createHash, timingSafeEqual } from "node:crypto";
import { APP_USER, APP_PASSWORD } from "astro:env/server";

// Compara sin revelar por el tiempo de respuesta cuánto coincide
const digest = (s: string) => createHash("sha256").update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

// Devuelve una respuesta de rechazo, o null si la persona puede pasar
export function guard(request: Request): Response | null {
  // Sin APP_PASSWORD el sitio es abierto: entra cualquiera con el enlace
  if (!APP_PASSWORD) return null;

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const [user, ...rest] = Buffer.from(header.slice(6), "base64").toString("utf8").split(":");
    const okUser = same(user, APP_USER);
    const okPass = same(rest.join(":"), APP_PASSWORD);
    if (okUser && okPass) return null;
  }
  return new Response("Acceso restringido", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Fefe 3D Printing", charset="UTF-8"' },
  });
}

// Rechaza pedidos que modifican datos si vienen de otro sitio web (anti-CSRF)
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || ["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  try {
    const host = new URL(origin).host;
    return [request.headers.get("host"), request.headers.get("x-forwarded-host"), new URL(request.url).host].includes(host);
  } catch {
    return false;
  }
}
