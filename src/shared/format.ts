// Formato de dinero y fechas, y suma de montos (compartido por Gastos y Ventas)
export const formatMoney = (n: number) =>
  `$${n.toLocaleString("es-AR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

// Suma en centavos para evitar errores de decimales (0.1 + 0.2)
export const sumAmounts = (list: { amount: number }[]) =>
  list.reduce((acc, e) => acc + Math.round(e.amount * 100), 0) / 100;
