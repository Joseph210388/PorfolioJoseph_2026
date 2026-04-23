import React, { useRef } from 'react';
import useOnScreen from '../hooks/useOnScreen';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, children }) => {
    const ref = useRef<HTMLElement | null>(null);
    // Activar la animación cuando el elemento esté a 100px de la parte inferior del viewport
    const isVisible = useOnScreen(ref, "-100px");

    return (
        <section
            id={id}
            ref={ref}
            className={`py-20 md:py-28 transition-all duration-700 ease-out transform scroll-mt-20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
        >
            <div className="flex items-center mb-12">
                <h2 className="text-3xl font-bold text-text-primary whitespace-nowrap mr-6">{title}</h2>
                <div className="w-full h-px bg-border"></div>
            </div>
            {children}
        </section>
    );
};

export default Section;