// Tipos y textos de Ventas: editá acá sin tocar los componentes
export const sellers = [
  { value: "fede", label: "Fede" },
  { value: "fer", label: "Fer" },
] as const;
export type Seller = (typeof sellers)[number]["value"];
export const sellerLabel = (s: Seller) => sellers.find((x) => x.value === s)?.label ?? s;

export interface Sale {
  id: string; // lo genera la base de datos
  product: string;
  customer: string;
  date: string; // formato AAAA-MM-DD
  quantity: number;
  amount: number; // monto total en pesos
  seller: Seller; // medio de venta: quién vendió
  notes: string | null; // null = sin observaciones (se muestra "–")
}
export type SaleInput = Omit<Sale, "id">;

export const meta = {
  title: "Ventas",
  description: "Registro de ventas con cliente, fecha y monto.",
  searchLabel: "Buscar venta",
  add: "Añadir venta",
  del: "Eliminar",
  delAsk: "¿Seguro?",
  delArm: "Tocá de nuevo para eliminar",
  deleted: "Venta eliminada",
  empty: "Sin resultados. Probá con otra búsqueda.",
  none: "Todavía no hay ventas. Añadí la primera.",
  singular: "venta",
  plural: "ventas",
  summary: { label: "Resumen de ventas", total: "Total vendido", filtered: "Total filtrado:" },
};

// Mensajes cuando algo falla con el servidor
export const errors = {
  load: "No se pudieron cargar las ventas. Recargá la página.",
  save: "No se pudo guardar. Revisá la conexión y probá de nuevo.",
  delete: "No se pudo eliminar la venta. Probá de nuevo.",
};

// Títulos de columna (también son las etiquetas del formulario y de la vista móvil)
export const columns = {
  product: "Producto",
  customer: "Cliente",
  date: "Fecha",
  quantity: "Cantidad",
  amount: "Monto",
  seller: "Medio de venta",
  notes: "Observaciones",
};

// Textos del formulario del modal
export const form = {
  title: "Añadir venta",
  submit: "Guardar venta",
  editTitle: "Editar venta",
  editSubmit: "Guardar cambios",
  saving: "Guardando…",
  cancel: "Cancelar",
  close: "Cerrar",
  optional: "(opcional)",
  required: "Completá este campo",
  pickSeller: "Elegí quién vendió",
  invalid: "Ingresá un valor válido",
  placeholders: { product: "Llavero personalizado", customer: "Nombre del cliente", amount: "0" },
};

// El formato de dinero y fechas es compartido con Gastos
export { formatMoney, formatDate } from "../../shared/format";
