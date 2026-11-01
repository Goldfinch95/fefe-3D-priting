// Middleware: todo pedido (páginas y API) pasa por la contraseña y el control de origen
import { defineMiddleware } from "astro:middleware";
import { guard, sameOrigin } from "./features/auth/basic-auth";

export const onRequest = defineMiddleware((context, next) => {
  const denied = guard(context.request);
  if (denied) return denied;
  if (!sameOrigin(context.request)) return new Response("Origen no permitido", { status: 403 });
  return next();
});
