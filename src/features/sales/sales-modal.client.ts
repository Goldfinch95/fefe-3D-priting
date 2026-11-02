// Lógica del modal (sirve para añadir y para editar): abrir/cerrar, validar y guardar en el servidor
import { form as texts, type Sale, type SaleInput } from "./sales.data";
import { createSale, updateSale } from "./sales.api";

export function initSaleModal() {
  const dialog = document.querySelector<HTMLDialogElement>("#sale-modal");
  if (!dialog) return;

  const form = dialog.querySelector<HTMLFormElement>("form")!;
  const fields = Array.from(form.querySelectorAll<HTMLInputElement>("input:not([type=radio])"));
  const segment = form.querySelector<HTMLElement>(".seg")!; // medio de venta (Fede / Fer)
  const radios = Array.from(form.querySelectorAll<HTMLInputElement>("input[type=radio]"));
  const title = dialog.querySelector<HTMLElement>("[data-modal-title]")!;
  const submit = dialog.querySelector<HTMLButtonElement>("[data-modal-submit]")!;
  const formError = dialog.querySelector<HTMLElement>("#modal-error")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let editing: Sale | null = null; // venta que se está editando (null = alta nueva)
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const seller = () => radios.find((r) => r.checked)?.value ?? "";
  const submitLabel = () => (editing ? texts.editSubmit : texts.submit);

  // Muestra u oculta el error debajo de un campo
  const showError = (el: HTMLElement, name: string, msg: string) => {
    const err = form.querySelector<HTMLElement>(`#e-${name}`)!;
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

  // Abre vacío (añadir) o con los datos de una venta (editar)
  const open = (s?: Sale) => {
    editing = s ?? null;
    fields.forEach((el) => showError(el, el.name, ""));
    showError(segment, "seller", "");
    formError.hidden = true;
    title.textContent = s ? texts.editTitle : texts.title;
    submit.textContent = submitLabel();
    field("product").value = s?.product ?? "";
    field("customer").value = s?.customer ?? "";
    field("date").value = s?.date ?? new Date().toLocaleDateString("en-CA"); // hoy, AAAA-MM-DD
    field("quantity").value = s ? String(s.quantity) : "";
    field("amount").value = s ? String(s.amount) : "";
    radios.forEach((r) => (r.checked = r.value === s?.seller)); // al añadir no hay nadie elegido
    field("notes").value = s?.notes ?? "";
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

  document.querySelectorAll("[data-sale-open]").forEach((b) => b.addEventListener("click", () => open()));
  document.addEventListener("sale:edit", (ev) => open((ev as CustomEvent<Sale>).detail));
  dialog.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
  dialog.addEventListener("click", (e) => e.target === dialog && close()); // clic en el fondo
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); }); // tecla Esc
  dialog.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  fields.forEach((el) => el.addEventListener("input", () => showError(el, el.name, "")));
  radios.forEach((r) => r.addEventListener("change", () => showError(segment, "seller", "")));

  // Guardar: valida, manda al servidor y, si todo salió bien, avisa a la tabla
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    let firstBad: HTMLElement | null = null;
    fields.forEach((el) => {
      const msg = check(el);
      showError(el, el.name, msg);
      if (msg && !firstBad) firstBad = el;
    });
    const noSeller = !seller();
    showError(segment, "seller", noSeller ? texts.pickSeller : "");
    if (noSeller && !firstBad) firstBad = radios[0];
    if (firstBad) return (firstBad as HTMLElement).focus();

    const v = (name: string) => field(name).value.trim();
    const data: SaleInput = {
      product: v("product"),
      customer: v("customer"),
      date: v("date"),
      quantity: Number(v("quantity")),
      amount: Number(v("amount")),
      seller: seller() as SaleInput["seller"],
      notes: v("notes") || null,
    };

    // Si no cambió nada no hace falta molestar al servidor
    if (editing && (Object.keys(data) as (keyof SaleInput)[]).every((k) => data[k] === editing![k])) return close();

    formError.hidden = true;
    submit.disabled = true;
    submit.textContent = texts.saving;
    try {
      const sale = editing ? await updateSale(editing.id, data) : await createSale(data);
      document.dispatchEvent(new CustomEvent("sale:saved", { detail: { sale, isNew: !editing } }));
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
