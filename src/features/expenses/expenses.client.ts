// Lógica de la tabla en el navegador: lista, buscador, orden, alta y edición
import { meta, type Expense } from "./expenses.data";
import { loadExpenses, addExpense, updateExpense } from "./expenses.store";
import { createRow } from "./expenses.row";

export function initExpenses() {
  const root = document.querySelector<HTMLElement>("#expenses");
  if (!root) return;

  const input = root.querySelector<HTMLInputElement>("#expenses-q")!;
  const count = root.querySelector<HTMLElement>("#expenses-count")!;
  const empty = root.querySelector<HTMLElement>("#expenses-empty")!;
  const body = root.querySelector<HTMLTableSectionElement>("tbody")!;
  const { singular = "", plural = "" } = root.dataset;
  const items = new Map<string, Expense>(); // gastos por id
  let sort = { col: -1, dir: 1, numeric: false };
  const rows = () => Array.from(body.rows);

  // Filtro: oculta filas sin coincidencia y actualiza contador y mensaje
  const applyFilter = () => {
    const q = input.value.toLowerCase().trim();
    let n = 0;
    rows().forEach((r) => {
      const ok = (r.dataset.search ?? "").includes(q);
      r.hidden = !ok;
      if (ok) n++;
    });
    empty.hidden = n > 0;
    empty.textContent = body.rows.length ? meta.empty : meta.none;
    count.textContent = `${n} ${n === 1 ? singular : plural}`;
  };

  // Orden por la columna activa (no hace nada si todavía no se eligió una)
  const applySort = () => {
    const { col, dir, numeric } = sort;
    if (col < 0) return;
    const sorted = rows().sort((a, b) => {
      const x = a.cells[col].dataset.v ?? "";
      const y = b.cells[col].dataset.v ?? "";
      return (numeric ? Number(x) - Number(y) : x.localeCompare(y, "es")) * dir;
    });
    body.append(...sorted);
  };

  // Destello azul en una fila recién añadida o editada
  const flash = (row: HTMLElement) => {
    row.classList.remove("is-new");
    void row.offsetWidth; // reinicia la animación si ya estaba
    row.classList.add("is-new");
    setTimeout(() => row.classList.remove("is-new"), 1800);
  };

  // Lista inicial (guardada en el navegador, o los datos de ejemplo)
  const list = loadExpenses();
  list.forEach((e) => items.set(e.id, e));
  body.replaceChildren(...list.map(createRow));
  applyFilter();

  input.addEventListener("input", applyFilter);

  // Orden: clic en el encabezado alterna ascendente / descendente
  root.querySelectorAll<HTMLButtonElement>(".expenses__sort").forEach((btn) => {
    btn.addEventListener("click", () => {
      const col = Number(btn.dataset.col);
      sort = { col, dir: sort.col === col ? -sort.dir : 1, numeric: btn.dataset.type === "number" };
      applySort();
      // aria-sort informa la columna activa (y muestra la flecha por CSS)
      root.querySelectorAll("th").forEach((th) => th.removeAttribute("aria-sort"));
      btn.closest("th")!.setAttribute("aria-sort", sort.dir === 1 ? "ascending" : "descending");
    });
  });

  // Clic (o Enter) en una fila: pide al modal que se abra con ese gasto
  const openRow = (target: EventTarget | null) => {
    const tr = (target as HTMLElement).closest("tr");
    const expense = tr && items.get(tr.dataset.id ?? "");
    if (expense) document.dispatchEvent(new CustomEvent("expense:edit", { detail: expense }));
  };
  body.addEventListener("click", (ev) => openRow(ev.target));
  body.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && (ev.target as HTMLElement).matches("tr")) {
      ev.preventDefault();
      openRow(ev.target);
    }
  });

  // Gasto nuevo: lo manda el modal con un evento (así los dos quedan separados)
  document.addEventListener("expense:add", (ev) => {
    const expense = (ev as CustomEvent<Expense>).detail;
    addExpense(expense);
    items.set(expense.id, expense);
    const row = createRow(expense);
    body.prepend(row);
    input.value = "";
    applySort();
    applyFilter();
    flash(row);
    row.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  // Gasto editado: actualiza la misma fila en el lugar (así el foco no se pierde)
  document.addEventListener("expense:update", (ev) => {
    const expense = (ev as CustomEvent<Expense>).detail;
    const old = items.get(expense.id);
    const same = old && (Object.keys(old) as (keyof Expense)[]).every((k) => old[k] === expense[k]);
    if (!old || same) return; // sin cambios: no hay nada que guardar
    updateExpense(expense);
    items.set(expense.id, expense);

    const row = body.querySelector<HTMLTableRowElement>(`tr[data-id="${CSS.escape(expense.id)}"]`)!;
    const fresh = createRow(expense);
    row.dataset.search = fresh.dataset.search;
    row.setAttribute("aria-label", fresh.getAttribute("aria-label")!);
    row.replaceChildren(...Array.from(fresh.children));
    applySort();
    applyFilter();
    flash(row);
  });
}