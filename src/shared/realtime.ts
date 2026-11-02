// Avisos en tiempo real: Supabase nos dice "algo cambió en esta tabla" y la página vuelve a pedir la lista
export async function watchTable(url: string, key: string, table: string, onChange: () => void) {
  // Se carga recién ahora para no frenar la primera pantalla
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  supabase
    .channel(`${table}-changes`)
    .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
    .subscribe((status) => {
      // Si el canal falla, el sitio sigue andando: se actualiza al volver a la pestaña
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.warn("Tiempo real no disponible:", status);
    });
}
