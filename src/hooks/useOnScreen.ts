import { useState, useEffect, type RefObject } from 'react';

/**
 * Detecta si el elemento entra en (o cerca de) el viewport.
 * En móvil, IntersectionObserver a veces no dispara al montar: comprobamos el rectángulo al inicio.
 */
function useOnScreen(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const reveal = () => setIntersecting(true);

        const isAlreadyVisible = () => {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            return rect.bottom > 0 && rect.right > 0 && rect.top < viewportHeight && rect.left < viewportWidth;
        };

        if (isAlreadyVisible()) {
            reveal();
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                reveal();
                observer.disconnect();
            },
            {
                rootMargin,
                // Con 0 basta un píxel visible; 0.1 exigía ~10% de secciones muy altas (móvil).
                threshold: 0,
            },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref, rootMargin]);

    return isIntersecting;
}

export default useOnScreen;
