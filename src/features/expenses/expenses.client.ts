// Lógica de la tabla en el navegador: buscador, orden por columna y contador
export function initExpenses() {
  const root = document.querySelector<HTMLElement>("#expenses");
  if (!root) return;

  const input = root.querySelector<HTMLInputElement>("#expenses-q")!;
  const count = root.querySelector<HTMLElement>("#expenses-count")!;
  const empty = root.querySelector<HTMLElement>("#expenses-empty")!;
  const body = root.querySelector<HTMLTableSectionElement>("tbody")!;
  const rows = Array.from(body.rows);
  const { singular = "", plural = "" } = root.dataset;
  let sort = { col: -1, dir: 1 };

  // Buscador: oculta las filas sin coincidencia y actualiza el contador
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    let n = 0;
    rows.forEach((r) => {
      const ok = (r.dataset.search ?? "").includes(q);
      r.hidden = !ok;
      if (ok) n++;
    });
    empty.hidden = n > 0;
    count.textContent = `${n} ${n === 1 ? singular : plural}`;
  });

  // Orden: clic en el encabezado alterna ascendente / descendente
  root.querySelectorAll<HTMLButtonElement>(".expenses__sort").forEach((btn) => {
    btn.addEventListener("click", () => {
      const col = Number(btn.dataset.col);
      const numeric = btn.dataset.type === "number";
      sort = { col, dir: sort.col === col ? -sort.dir : 1 };

      rows.sort((a, b) => {
        const x = a.cells[col].dataset.v ?? "";
        const y = b.cells[col].dataset.v ?? "";
        return (numeric ? Number(x) - Number(y) : x.localeCompare(y, "es")) * sort.dir;
      });
      rows.forEach((r) => body.appendChild(r));

      // aria-sort informa la columna activa (y muestra la flecha por CSS)
      root.querySelectorAll("th").forEach((th) => th.removeAttribute("aria-sort"));
      btn.closest("th")!.setAttribute("aria-sort", sort.dir === 1 ? "ascending" : "descending");
    });
  });
}