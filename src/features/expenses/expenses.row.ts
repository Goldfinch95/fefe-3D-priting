// Arma una fila de la tabla (textContent evita inyectar HTML desde los datos)
import { columns, formatDate, formatMoney, type Expense } from "./expenses.data";

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

  // Lápiz decorativo (aparece al pasar el mouse)
  const pencil = cell("", null, "", "expenses__edit");
  pencil.setAttribute("aria-hidden", "true");
  pencil.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';

  tr.append(
    cell(columns.description, e.description, e.description),
    cell(columns.supplier, e.supplier, e.supplier),
    cell(columns.date, new Date(e.date).getTime(), formatDate(e.date)),
    cell(columns.quantity, e.quantity, String(e.quantity), "expenses__num"),
    cell(columns.amount, e.amount, formatMoney(e.amount), "expenses__num"),
    notesCell,
    pencil
  );
  return tr;
}