import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Cuadrícula sutil + desplazamiento continuo y parallax ligero al mover el ratón.
 * Los colores derivan de tokens CSS (--color-border, acento) para no imponer otra paleta.
 */
const GridBackground: React.FC = () => {
    const layerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (prefersReducedMotion) return;

        let rafId = 0;

        const handleMouseMove = (event: MouseEvent) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const el = layerRef.current;
                if (!el) return;
                const x = (event.clientX - window.innerWidth / 2) / 30;
                const y = (event.clientY - window.innerHeight / 2) / 30;
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [prefersReducedMotion]);

    const gridLine = 'color-mix(in srgb, var(--color-border) 32%, transparent)';

    return (
        <div
            ref={layerRef}
            className={cn(
                'pointer-events-none absolute inset-0 overflow-hidden',
                !prefersReducedMotion && 'transition-transform duration-300 ease-out',
            )}
            aria-hidden
        >
            <div
                className={cn(
                    'absolute inset-0 h-full w-full',
                    !prefersReducedMotion && 'animate-grid-shift',
                )}
                style={{
                    backgroundImage: `
            linear-gradient(to right, ${gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Resplandor central muy suave; no altera el color de fondo de la página */}
            <div className="absolute left-1/2 top-1/2 h-[min(60vmin,720px)] w-[min(60vmin,720px)] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px] sm:blur-[150px]" />
        </div>
    );
};

export default GridBackground;
