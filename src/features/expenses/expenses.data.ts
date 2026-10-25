// Datos de la tabla: editá acá textos, columnas y filas sin tocar el componente
export interface Expense {
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
  empty: "Sin resultados. Probá con otra búsqueda.",
  singular: "gasto",
  plural: "gastos",
};

// Títulos de columna (también se usan como etiqueta en la vista móvil)
export const columns = {
  description: "Descripción",
  supplier: "Proveedor",
  date: "Fecha",
  quantity: "Cantidad",
  amount: "Monto",
  notes: "Observaciones",
};

// Datos de ejemplo: reemplazalos por los reales
export const expenses: Expense[] = [
  { description: "Filamento PLA negro 1 kg", supplier: "Filamentos del Sur", date: "2026-10-02", quantity: 4, amount: 72000, notes: "Compra mensual" },
  { description: "Resina UV gris 1 litro", supplier: "Insumos 3D", date: "2026-10-05", quantity: 2, amount: 64000, notes: null },
  { description: "Boquillas 0,4 mm", supplier: "Ferretería Central", date: "2026-10-09", quantity: 10, amount: 15000, notes: "Repuesto para la impresora principal, revisar el desgaste cada 200 horas" },
  { description: "Electricidad de octubre", supplier: "Cooperativa eléctrica", date: "2026-10-15", quantity: 1, amount: 48500, notes: null },
  { description: "Alcohol isopropílico y cinta", supplier: "Librería Mitre", date: "2026-10-18", quantity: 3, amount: 9800, notes: "Para limpiar la cama de impresión" },
];

export const formatMoney = (n: number) => `$${n.toLocaleString("es-AR")}`;
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });