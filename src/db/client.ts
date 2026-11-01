// Conexión a Postgres (una sola por instancia del servidor)
import postgres from "postgres";
import { DATABASE_URL } from "astro:env/server";

let client: ReturnType<typeof postgres> | undefined;

// Una conexión alcanza para dos usuarios y cuida el límite de conexiones de Neon
export function getDb() {
  if (!DATABASE_URL) {
    throw new Error("Falta DATABASE_URL (conectá la base en Vercel o completá tu archivo .env)");
  }
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL);
  // prepare:false es lo recomendado con el pooler de Neon (PgBouncer)
  client ??= postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: local ? false : "require",
  });
  return client;
}
