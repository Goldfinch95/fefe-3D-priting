// Lógica del navbar en el navegador: indicador, menú móvil y scroll
export function initNavbar() {
  const root = document.querySelector<HTMLElement>(".navbar");
  if (!root) return;

  const toggle = root.querySelector<HTMLButtonElement>(".navbar__toggle")!;
  const menu = root.querySelector<HTMLElement>(".navbar__menu")!;
  const wrap = root.querySelector<HTMLElement>(".navbar__links")!;
  const ind = wrap.querySelector<HTMLElement>(".navbar__indicator")!;
  const links = wrap.querySelectorAll<HTMLAnchorElement>("a");
  const active = wrap.querySelector<HTMLAnchorElement>('a[aria-current="page"]');

  // Mueve (o esconde) el indicador bajo un link
  const moveTo = (a: HTMLElement | null) => {
    if (!a) {
      ind.style.opacity = "0";
      return;
    }
    // Si estaba oculto, aparece en su lugar sin deslizarse desde el borde
    const hidden = ind.style.opacity !== "1";
    if (hidden) ind.style.transition = "none";
    ind.style.opacity = "1";
    ind.style.width = `${a.offsetWidth}px`;
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
    if (hidden) {
      void ind.offsetWidth; // fuerza el repintado
      ind.style.transition = "";
    }
  };

  links.forEach((a) => {
    a.addEventListener("mouseenter", () => moveTo(a));
    a.addEventListener("focus", () => moveTo(a));
  });
  wrap.addEventListener("mouseleave", () => moveTo(active));
  window.addEventListener("resize", () => moveTo(active));
  moveTo(active);

  // Menú móvil: abrir/cerrar y bloquear el scroll del fondo
  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.dataset.open = String(open);
    document.body.classList.toggle("no-scroll", open);
  };
  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true")
  );
  menu.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));

  // Sombra sutil cuando la página baja
  const onScroll = () => root.toggleAttribute("data-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}