// Configuración de Astro: páginas en el servidor, adaptador de Vercel y variables de entorno
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server", // todas las páginas pasan por el servidor (así rige la contraseña)
  adapter: vercel(),
  env: {
    schema: {
      // Cadena de conexión a Postgres (Vercel la completa solo al conectar Neon)
      DATABASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
      // Usuario y contraseña compartidos por las dos personas que usan el sitio
      APP_USER: envField.string({ context: "server", access: "secret", default: "fefe" }),
      APP_PASSWORD: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
