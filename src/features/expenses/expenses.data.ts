// Datos y textos de la tabla: editá acá sin tocar los componentes
export interface Expense {
  id: string; // identificador único (sirve para editar)
  description: string;
  supplier: string;
  date: string; // formato AAAA-MM-DD
  quantity: number;
  amount: number; // monto total en pesos
  notes: string | null; // null = sin observaciones (se muestra "–")
}

export const meta = {
  title: "Gastos",
  description: "Registro de gastos con proveedor, fecha y monto.",
  searchLabel: "Buscar gasto",
  add: "Añadir gasto",
  empty: "Sin resultados. Probá con otra búsqueda.",
  none: "Todavía no hay gastos. Añadí el primero.",
  singular: "gasto",
  plural: "gastos",
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
  cancel: "Cancelar",
  close: "Cerrar",
  optional: "(opcional)",
  required: "Completá este campo",
  invalid: "Ingresá un valor válido",
  placeholders: { description: "Filamento PLA negro 1 kg", supplier: "Nombre del proveedor", amount: "0" },
};

// Datos de ejemplo: reemplazalos por los reales
export const expenses: Expense[] = [
  { id: "seed-1", description: "Filamento PLA negro 1 kg", supplier: "Filamentos del Sur", date: "2026-10-02", quantity: 4, amount: 72000, notes: "Compra mensual" },
  { id: "seed-2", description: "Resina UV gris 1 litro", supplier: "Insumos 3D", date: "2026-10-05", quantity: 2, amount: 64000, notes: null },
  { id: "seed-3", description: "Boquillas 0,4 mm", supplier: "Ferretería Central", date: "2026-10-09", quantity: 10, amount: 15000, notes: "Repuesto para la impresora principal, revisar el desgaste cada 200 horas" },
  { id: "seed-4", description: "Electricidad de octubre", supplier: "Cooperativa eléctrica", date: "2026-10-15", quantity: 1, amount: 48500, notes: null },
  { id: "seed-5", description: "Alcohol isopropílico y cinta", supplier: "Librería Mitre", date: "2026-10-18", quantity: 3, amount: 9800, notes: "Para limpiar la cama de impresión" },
];

export const formatMoney = (n: number) =>
  `$${n.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });