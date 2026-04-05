/**
 * Desplaza la ventana hasta una sección teniendo en cuenta el header fijo.
 * Evita depender solo de scrollIntoView, que en muchos navegadores no alinea bien con position: fixed.
 */
export function scrollToSectionById(id: string, behavior: ScrollBehavior = 'smooth'): void {
    const el = document.getElementById(id);
    if (!el) return;

    const header = document.querySelector('header');
    const headerHeight = header instanceof HTMLElement ? header.getBoundingClientRect().height : 80;
    const gap = 10;

    const rect = el.getBoundingClientRect();
    const y = rect.top + window.scrollY - headerHeight - gap;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    window.scrollTo({
        top: Math.min(Math.max(0, y), maxScroll),
        behavior,
    });
}
