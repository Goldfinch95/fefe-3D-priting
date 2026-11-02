// Arma una fila de la tabla (textContent evita inyectar HTML desde los datos)
import { columns, formatDate, formatMoney, meta, type Expense } from "./expenses.data";

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

export function createRow(e: Expense): HTMLTableRowElement {
  const tr = document.createElement("tr");
  tr.setAttribute("role", "row");
  tr.tabIndex = 0; // la fila se enfoca con Tab y se abre con Enter
  tr.setAttribute("aria-label", `Editar ${e.description}`);
  tr.dataset.id = e.id;
  tr.dataset.search = `${e.description} ${e.supplier} ${e.notes ?? ""}`.toLowerCase();

  // Observaciones: texto cortado en una línea o un guion si está vacío
  const notes = document.createElement("span");
  notes.className = e.notes ? "expenses__notes" : "expenses__dash";
  notes.textContent = e.notes ?? "–";
  if (e.notes) notes.title = e.notes;
  const notesCell = cell(columns.notes, null, notes);
  if (!e.notes) notesCell.dataset.empty = "";

  // Herramientas: lápiz decorativo + botón de papelera (dos toques para borrar)
  const del = document.createElement("button");
  del.type = "button";
  del.className = "expenses__del";
  del.dataset.label = `${meta.del} ${e.description}`;
  del.setAttribute("aria-label", del.dataset.label);
  del.innerHTML = `${TRASH}<span class="expenses__del-label"></span>`;
  del.lastElementChild!.textContent = meta.del;
  const tools = cell("", null, "", "expenses__tools");
  tools.innerHTML = PENCIL.replace("<svg ", '<svg class="expenses__pencil" ');
  tools.append(del);

  tr.append(
    cell(columns.description, e.description, e.description),
    cell(columns.supplier, e.supplier, e.supplier),
    cell(columns.date, new Date(e.date).getTime(), formatDate(e.date)),
    cell(columns.quantity, e.quantity, String(e.quantity), "expenses__num"),
    cell(columns.amount, e.amount, formatMoney(e.amount), "expenses__num expenses__amount"),
    notesCell,
    tools
  );
  return tr;
}
