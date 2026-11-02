// Tipos y textos de la tabla: editá acá sin tocar los componentes
export interface Expense {
  id: string; // lo genera la base de datos
  description: string;
  supplier: string;
  date: string; // formato AAAA-MM-DD
  quantity: number;
  amount: number; // monto total en pesos
  notes: string | null; // null = sin observaciones (se muestra "–")
}
export type ExpenseInput = Omit<Expense, "id">;

export const meta = {
  title: "Gastos",
  description: "Registro de gastos con proveedor, fecha y monto.",
  searchLabel: "Buscar gasto",
  add: "Añadir gasto",
  del: "Eliminar",
  delAsk: "¿Seguro?",
  delArm: "Tocá de nuevo para eliminar",
  deleted: "Gasto eliminado",
  empty: "Sin resultados. Probá con otra búsqueda.",
  none: "Todavía no hay gastos. Añadí el primero.",
  singular: "gasto",
  plural: "gastos",
  // Tarjeta de total
  summary: { label: "Resumen de gastos", total: "Total gastado", filtered: "Total filtrado:", biggest: "Mayor" },
};

// Mensajes cuando algo falla con el servidor
export const errors = {
  load: "No se pudieron cargar los gastos. Recargá la página.",
  save: "No se pudo guardar. Revisá la conexión y probá de nuevo.",
  delete: "No se pudo eliminar el gasto. Probá de nuevo.",
};

// Títulos de columna (también son las etiquetas del formulario y de la vista móvil)
export const columns = {
  description: "Descripción",
  supplier: "Proveedor",
  date: "Fecha",
  quantity: "Cantidad",
  amount: "Monto",
  notes: "Observaciones",
};

// Textos del formulario del modal
export const form = {
  title: "Añadir gasto",
  submit: "Guardar gasto",
  editTitle: "Editar gasto",
  editSubmit: "Guardar cambios",
  saving: "Guardando…",
  cancel: "Cancelar",
  close: "Cerrar",
  optional: "(opcional)",
  required: "Completá este campo",
  invalid: "Ingresá un valor válido",
  placeholders: { description: "Filamento PLA negro 1 kg", supplier: "Nombre del proveedor", amount: "0" },
};

// El formato de dinero y fechas es compartido con Ventas
export { formatMoney, formatDate } from "../../shared/format";
