// Arma una fila de la tabla (textContent evita inyectar HTML desde los datos)
import { columns, formatDate, formatMoney, meta, sellerLabel, type Sale } from "./sales.data";

const SVG = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const PENCIL = SVG('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4"/>');
const TRASH = SVG('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>');

// Crea una celda con su etiqueta móvil (data-label) y valor de orden (data-v)
function cell(label: string, sortValue: string | number | null, content: string | Node, cls = "") {
  const td = document.createElement("td");
  td.setAttribute("role", "cell");
  td.dataset.label = label;
  if (sortValue !== null) td.dataset.v = String(sortValue);
  if (cls) td.className = cls;
  td.append(content);
  return td;
}

// Medio de venta: punto de color (azul Fede, rosa Fer) y nombre
function sellerBadge(seller: Sale["seller"]) {
  const wrap = document.createElement("span");
  wrap.className = "sales__seller";
  const dot = document.createElement("span");
  dot.className = `sales__dot sales__dot--${seller}`;
  dot.setAttribute("aria-hidden", "true");
  wrap.append(dot, sellerLabel(seller));
  return wrap;
}

export function createRow(s: Sale): HTMLTableRowElement {
  const tr = document.createElement("tr");
  tr.setAttribute("role", "row");
  tr.tabIndex = 0; // la fila se enfoca con Tab y se abre con Enter
  tr.setAttribute("aria-label", `Editar ${s.product}`);
  tr.dataset.id = s.id;
  tr.dataset.search = `${s.product} ${s.customer} ${sellerLabel(s.seller)} ${s.notes ?? ""}`.toLowerCase();

  // Observaciones: texto cortado en una línea o un guion si está vacío
  const notes = document.createElement("span");
  notes.className = s.notes ? "sales__notes" : "sales__dash";
  notes.textContent = s.notes ?? "–";
  if (s.notes) notes.title = s.notes;
  const notesCell = cell(columns.notes, null, notes);
  if (!s.notes) notesCell.dataset.empty = "";

  // Herramientas: lápiz decorativo + botón de papelera (dos toques para borrar)
  const del = document.createElement("button");
  del.type = "button";
  del.className = "sales__del";
  del.dataset.label = `${meta.del} ${s.product}`;
  del.setAttribute("aria-label", del.dataset.label);
  del.innerHTML = `${TRASH}<span class="sales__del-label"></span>`;
  del.lastElementChild!.textContent = meta.del;
  const tools = cell("", null, "", "sales__tools");
  tools.innerHTML = PENCIL.replace("<svg ", '<svg class="sales__pencil" ');
  tools.append(del);

  tr.append(
    cell(columns.product, s.product, s.product),
    cell(columns.customer, s.customer, s.customer),
    cell(columns.date, new Date(s.date).getTime(), formatDate(s.date)),
    cell(columns.quantity, s.quantity, String(s.quantity), "sales__num"),
    cell(columns.amount, s.amount, formatMoney(s.amount), "sales__num sales__amount"),
    cell(columns.seller, sellerLabel(s.seller), sellerBadge(s.seller)),
    notesCell,
    tools
  );
  return tr;
}
