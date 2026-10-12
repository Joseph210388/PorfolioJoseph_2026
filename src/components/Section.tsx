import React, { useRef } from 'react';
import useOnScreen from '../hooks/useOnScreen';
import { cn } from '@/lib/utils';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, children }) => {
    const ref = useRef<HTMLElement | null>(null);
    // Margen positivo: la sección aparece un poco antes de llegar, no cuando ya está encima.
    const isVisible = useOnScreen(ref, '120px');

    return (
        <section
            id={id}
            ref={ref}
            className={cn(
                'scroll-mt-20 py-14 md:py-20',
                'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
        >
            <div className="mb-12 flex items-center">
                <h2 className="mr-6 whitespace-nowrap text-3xl font-bold text-text-primary">{title}</h2>
                <div className="h-px w-full bg-border"></div>
            </div>
            {children}
        </section>
    );
};

export default Section;
