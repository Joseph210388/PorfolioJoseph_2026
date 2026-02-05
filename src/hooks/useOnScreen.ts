import { useState, useEffect, RefObject } from 'react';

/**
 * Hook personalizado para detectar si un elemento está visible en la pantalla.
 * @param ref - La referencia de React del elemento a observar.
 * @param rootMargin - Margen alrededor de la raíz. Se puede usar para activar la devolución de llamada antes o después.
 * @returns boolean - Verdadero si el elemento se está intersectando, falso en caso contrario.
 */
function useOnScreen(ref: RefObject<Element>, rootMargin = '0px'): boolean {
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Actualizar el estado cuando se activa la devolución de llamada del observador
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    // Dejar de observar el elemento una vez que se ha vuelto visible
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            {
                rootMargin,
                threshold: 0.1, // Activar cuando el 10% del elemento sea visible
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, rootMargin]);

    return isIntersecting;
}

export default useOnScreen;
