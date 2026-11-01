// Lógica del modal (sirve para añadir y para editar): abrir/cerrar, validar y guardar en el servidor
import { form as texts, type Expense, type ExpenseInput } from "./expenses.data";
import { createExpense, updateExpense } from "./expenses.api";

export function initExpenseModal() {
  const dialog = document.querySelector<HTMLDialogElement>("#expense-modal");
  if (!dialog) return;

  const form = dialog.querySelector<HTMLFormElement>("form")!;
  const fields = Array.from(form.querySelectorAll<HTMLInputElement>("input"));
  const title = dialog.querySelector<HTMLElement>("[data-modal-title]")!;
  const submit = dialog.querySelector<HTMLButtonElement>("[data-modal-submit]")!;
  const formError = dialog.querySelector<HTMLElement>("#modal-error")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let editing: Expense | null = null; // gasto que se está editando (null = alta nueva)
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const submitLabel = () => (editing ? texts.editSubmit : texts.submit);

  // Muestra u oculta el error debajo de un campo
  const showError = (el: HTMLInputElement, msg: string) => {
    const err = form.querySelector<HTMLElement>(`#e-${el.name}`)!;
    err.textContent = msg;
    err.hidden = !msg;
    el.toggleAttribute("aria-invalid", !!msg);
  };

  // Devuelve el mensaje de error de un campo ("" si está bien)
  const check = (el: HTMLInputElement) => {
    const v = el.value.trim();
    if (!v) return texts.required;
    if (el.name === "quantity" && !(Number.isInteger(+v) && +v >= 1)) return texts.invalid;
    if (el.name === "amount" && !(Number.isFinite(+v) && +v >= 0)) return texts.invalid;
    return "";
  };

  // Abre vacío (añadir) o con los datos de un gasto (editar)
  const open = (e?: Expense) => {
    editing = e ?? null;
    fields.forEach((el) => showError(el, ""));
    formError.hidden = true;
    title.textContent = e ? texts.editTitle : texts.title;
    submit.textContent = submitLabel();
    field("description").value = e?.description ?? "";
    field("supplier").value = e?.supplier ?? "";
    field("date").value = e?.date ?? new Date().toLocaleDateString("en-CA"); // hoy, AAAA-MM-DD
    field("quantity").value = e ? String(e.quantity) : "";
    field("amount").value = e ? String(e.amount) : "";
    field("notes").value = e?.notes ?? "";
    dialog.showModal();
    document.body.classList.add("no-scroll");
  };

  // Cierra con animación de salida (sin animación si el usuario prefiere menos movimiento)
  const close = () => {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    if (reduce.matches) return dialog.close();
    dialog.classList.add("is-closing");
    setTimeout(() => {
      dialog.classList.remove("is-closing");
      dialog.close();
    }, 180);
  };

  document.querySelectorAll("[data-expense-open]").forEach((b) => b.addEventListener("click", () => open()));
  document.addEventListener("expense:edit", (ev) => open((ev as CustomEvent<Expense>).detail));
  dialog.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
  dialog.addEventListener("click", (e) => e.target === dialog && close()); // clic en el fondo
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); }); // tecla Esc
  dialog.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  fields.forEach((el) => el.addEventListener("input", () => showError(el, "")));

  // Guardar: valida, manda al servidor y, si todo salió bien, avisa a la tabla
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    let firstBad: HTMLInputElement | null = null;
    fields.forEach((el) => {
      const msg = check(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) return (firstBad as HTMLInputElement).focus();

    const v = (name: string) => field(name).value.trim();
    const data: ExpenseInput = {
      description: v("description"),
      supplier: v("supplier"),
      date: v("date"),
      quantity: Number(v("quantity")),
      amount: Number(v("amount")),
      notes: v("notes") || null,
    };

    // Si no cambió nada no hace falta molestar al servidor
    if (editing && (Object.keys(data) as (keyof ExpenseInput)[]).every((k) => data[k] === editing![k])) return close();

    formError.hidden = true;
    submit.disabled = true;
    submit.textContent = texts.saving;
    try {
      const expense = editing ? await updateExpense(editing.id, data) : await createExpense(data);
      document.dispatchEvent(new CustomEvent("expense:saved", { detail: { expense, isNew: !editing } }));
      close();
    } catch (err) {
      formError.textContent = (err as Error).message;
      formError.hidden = false; // el modal sigue abierto para reintentar sin perder lo escrito
    } finally {
      submit.disabled = false;
      submit.textContent = submitLabel();
    }
  });
}
