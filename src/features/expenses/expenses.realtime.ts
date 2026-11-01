// Avisos en tiempo real: Supabase nos dice "algo cambió" y la tabla vuelve a pedir la lista
export async function watchExpenses(url: string, key: string, onChange: () => void) {
  // Se carga recién ahora para no frenar la primera pantalla
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  supabase
    .channel("expenses-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, onChange)
    .subscribe((status) => {
      // Si el canal falla, el sitio sigue andando: se actualiza al volver a la pestaña
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.warn("Tiempo real no disponible:", status);
    });
}
