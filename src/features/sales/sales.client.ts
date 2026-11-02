// Lógica de la tabla en el navegador: lista, buscador, orden, edición y borrado
import { meta, errors, sellers, formatMoney, type Sale } from "./sales.data";
import { deleteSale, fetchSales } from "./sales.api";
import { watchTable } from "../../shared/realtime";
import { summarize, sumAmounts } from "./sales.summary";
import { createRow } from "./sales.row";

export function initSales() {
  const root = document.querySelector<HTMLElement>("#sales");
  if (!root) return;

  const input = root.querySelector<HTMLInputElement>("#sales-q")!;
  const count = root.querySelector<HTMLElement>("#sales-count")!;
  const empty = root.querySelector<HTMLElement>("#sales-empty")!;
  const status = root.querySelector<HTMLElement>("#sales-status")!;
  const errorBox = root.querySelector<HTMLElement>("#sales-error")!;
  const body = root.querySelector<HTMLTableSectionElement>("tbody")!;
  const sum = (id: string) => root.querySelector<HTMLElement>(`#summary-${id}`)!;
  const { singular = "", plural = "" } = root.dataset;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const items = new Map<string, Sale>(); // ventas por id
  let version = 0; // cambia con cada acción propia, para descartar listas viejas
  let sort = { col: -1, dir: 1, numeric: false };
  const rows = () => Array.from(body.rows);

  // Muestra un error del servidor unos segundos
  let errorTimer = 0;
  const showError = (message: string) => {
    errorBox.textContent = message;
    errorBox.hidden = false;
    clearTimeout(errorTimer);
    errorTimer = window.setTimeout(() => (errorBox.hidden = true), 6000);
  };

  // Tarjeta de total: total general siempre y, si hay búsqueda, también el de lo filtrado
  const updateSummary = () => {
    const all = Array.from(items.values());
    const { total, count, bySeller } = summarize(all);
    sum("total").textContent = formatMoney(total);
    sum("count").textContent = `${count} ${count === 1 ? singular : plural}`;
    sellers.forEach((x) => (sum(x.value).textContent = formatMoney(bySeller[x.value])));
    const searching = input.value.trim() !== "";
    sum("filtered").hidden = !searching;
    if (searching) {
      const shown = new Set(rows().filter((r) => !r.hidden).map((r) => r.dataset.id));
      sum("filtered-value").textContent = formatMoney(sumAmounts(all.filter((e) => shown.has(e.id))));
    }
  };

  // Filtro: oculta filas sin coincidencia y actualiza contador y mensaje
  const applyFilter = () => {
    const q = input.value.toLowerCase().trim();
    let n = 0;
    rows().forEach((r) => {
      const ok = (r.dataset.search ?? "").includes(q);
      r.hidden = !ok;
      if (ok) n++;
    });
    empty.hidden = n > 0 || "loadError" in root.dataset;
    empty.textContent = body.rows.length ? meta.empty : meta.none;
    count.textContent = `${n} ${n === 1 ? singular : plural}`;
    updateSummary();
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

  // Lista inicial: la manda el servidor dentro de la página
  const initial: Sale[] = JSON.parse(root.querySelector("#sales-data")?.textContent ?? "[]");
  initial.forEach((e) => items.set(e.id, e));
  body.replaceChildren(...initial.map(createRow));
  applyFilter();

  input.addEventListener("input", applyFilter);

  // Orden: clic en el encabezado alterna ascendente / descendente
  root.querySelectorAll<HTMLButtonElement>(".sales__sort").forEach((btn) => {
    btn.addEventListener("click", () => {
      const col = Number(btn.dataset.col);
      sort = { col, dir: sort.col === col ? -sort.dir : 1, numeric: btn.dataset.type === "number" };
      applySort();
      // aria-sort informa la columna activa (y muestra la flecha por CSS)
      root.querySelectorAll("th").forEach((th) => th.removeAttribute("aria-sort"));
      btn.closest("th")!.setAttribute("aria-sort", sort.dir === 1 ? "ascending" : "descending");
    });
  });

  // Clic (o Enter) en una fila: pide al modal que se abra con esa venta
  const openRow = (target: EventTarget | null) => {
    const tr = (target as HTMLElement).closest("tr");
    const sale = tr && items.get(tr.dataset.id ?? "");
    if (sale) document.dispatchEvent(new CustomEvent("sale:edit", { detail: sale }));
  };
  body.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && (ev.target as HTMLElement).matches("tr")) {
      ev.preventDefault();
      openRow(ev.target);
    }
  });

  // Borrado en dos toques: el primero arma el botón (3 s), el segundo elimina
  let armed: { btn: HTMLButtonElement; timer: number } | null = null;
  const disarm = () => {
    if (!armed) return;
    const { btn, timer } = armed;
    clearTimeout(timer);
    btn.classList.remove("is-armed");
    btn.setAttribute("aria-label", btn.dataset.label!);
    btn.lastElementChild!.textContent = meta.del;
    armed = null;
  };
  const arm = (btn: HTMLButtonElement, sale: Sale) => {
    disarm();
    btn.classList.add("is-armed");
    btn.lastElementChild!.textContent = meta.delAsk;
    status.textContent = `${meta.delArm}: ${sale.product}`;
    btn.setAttribute("aria-label", status.textContent);
    armed = { btn, timer: window.setTimeout(disarm, 3000) };
  };

  // Borra en el servidor; la fila se desvanece y, si falla, vuelve a aparecer
  const remove = async (row: HTMLTableRowElement) => {
    disarm();
    errorBox.hidden = true;
    const id = row.dataset.id!;
    const visible = rows().filter((r) => !r.hidden);
    const at = visible.indexOf(row);
    const next = visible[at + 1] ?? visible[at - 1]; // el foco pasa a la fila vecina
    row.classList.add("is-removing");
    try {
      await Promise.all([deleteSale(id), new Promise((r) => setTimeout(r, reduce.matches ? 0 : 250))]);
    } catch (e) {
      row.classList.remove("is-removing");
      return showError((e as Error).message === errors.save ? errors.delete : (e as Error).message);
    }
    version++;
    items.delete(id);
    row.remove();
    applyFilter();
    status.textContent = meta.deleted;
    (next ?? document.querySelector<HTMLElement>("[data-sale-open]"))?.focus();
  };

  body.addEventListener("click", (ev) => {
    const target = ev.target as HTMLElement;
    const del = target.closest<HTMLButtonElement>(".sales__del");
    if (!del) return openRow(target); // clic en la fila: abre el editor
    const row = del.closest("tr")!;
    const sale = items.get(row.dataset.id ?? "");
    if (!sale) return;
    del.classList.contains("is-armed") ? remove(row) : arm(del, sale);
  });
  document.addEventListener("click", (ev) => armed && !armed.btn.contains(ev.target as Node) && disarm());
  body.addEventListener("focusout", (ev) => armed && ev.target === armed.btn && disarm());
  document.addEventListener("keydown", (ev) => ev.key === "Escape" && disarm());

  // El modal avisa cuando el servidor guardó una venta (nuevo o editado)
  document.addEventListener("sale:saved", (ev) => {
    const { sale, isNew } = (ev as CustomEvent<{ sale: Sale; isNew: boolean }>).detail;
    version++;
    items.set(sale.id, sale);

    if (isNew) {
      const row = createRow(sale);
      body.prepend(row);
      input.value = "";
      applySort();
      applyFilter();
      flash(row);
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }

    // Editado: actualiza la misma fila en el lugar (así el foco no se pierde)
    const row = body.querySelector<HTMLTableRowElement>(`tr[data-id="${CSS.escape(sale.id)}"]`);
    if (!row) return;
    const fresh = createRow(sale);
    row.dataset.search = fresh.dataset.search;
    row.setAttribute("aria-label", fresh.getAttribute("aria-label")!);
    row.replaceChildren(...Array.from(fresh.children));
    applySort();
    applyFilter();
    flash(row);
  });

  // Sincroniza con el servidor: solo toca las filas que cambiaron (así no se pierde el foco)
  let syncing = false;
  const sync = async () => {
    if (syncing || document.hidden) return;
    syncing = true;
    const seen = version;
    try {
      const list = await fetchSales();
      if (seen !== version) return; // hubo una acción propia mientras tanto: lista vieja
      const ids = new Set(list.map((e) => e.id));
      rows().forEach((r) => {
        if (!ids.has(r.dataset.id ?? "") && !r.classList.contains("is-removing")) r.remove();
      });
      [...list].reverse().forEach((e) => {
        const old = items.get(e.id);
        if (old && JSON.stringify(old) === JSON.stringify(e)) return;
        const fresh = createRow(e);
        const row = body.querySelector<HTMLTableRowElement>(`tr[data-id="${CSS.escape(e.id)}"]`);
        row ? row.replaceWith(fresh) : body.prepend(fresh);
        flash(fresh);
      });
      items.clear();
      list.forEach((e) => items.set(e.id, e));
      applySort();
      applyFilter();
    } catch {
      /* sin conexión: se reintenta en el próximo aviso */
    } finally {
      syncing = false;
    }
  };

  // Se actualiza al volver a la pestaña y, si Supabase está configurado, al instante
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("sales:refresh", sync);
  const { sbUrl, sbKey } = root.dataset;
  let timer = 0;
  if (sbUrl && sbKey) watchTable(sbUrl, sbKey, "sales", () => { clearTimeout(timer); timer = window.setTimeout(sync, 250); }).catch(() => {});
}
