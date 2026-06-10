import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Technology } from '../utils/supabase';
import { cn } from '@/lib/utils';

const TECH_SEPARATOR = ' - ';

function measureTechLine(names: string[], visibleCount: number, measureText: (text: string) => number): number {
    const visible = names.slice(0, visibleCount);
    const hidden = Math.max(0, names.length - visibleCount);
    let line = visible.join(TECH_SEPARATOR);

    if (hidden > 0) {
        line += (line ? ' ' : '') + `... +${hidden}`;
    }

    return measureText(line);
}

function computeVisibleCount(
    names: string[],
    maxWidth: number,
    measureText: (text: string) => number,
): number {
    if (names.length === 0 || maxWidth <= 0) return 0;

    for (let count = names.length; count >= 0; count -= 1) {
        if (measureTechLine(names, count, measureText) <= maxWidth) {
            return count;
        }
    }

    return 0;
}

interface ProjectCardTechnologiesProps {
    technologies: Technology[];
    ariaLabel: string;
    noTechnologiesLabel: string;
}

const ProjectCardTechnologies: React.FC<ProjectCardTechnologiesProps> = ({
    technologies,
    ariaLabel,
    noTechnologiesLabel,
}) => {
    const containerRef = useRef<HTMLParagraphElement>(null);
    const [visibleCount, setVisibleCount] = useState(technologies.length);

    const techKey = technologies.map((t) => t.id).join(',');

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const names = technologies.map((t) => t.name);

        const measure = () => {
            const width = container.clientWidth;
            if (width === 0) return;

            const style = getComputedStyle(container);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const measureText = (text: string) => ctx.measureText(text).width;

            // Margen mínimo para evitar cortes por redondeo del navegador
            const safeWidth = width - 4;
            const count = computeVisibleCount(names, safeWidth, measureText);
            setVisibleCount(count);
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(container);

        return () => observer.disconnect();
    }, [techKey, technologies]);

    if (technologies.length === 0) {
        return <p className="text-sm text-text-muted">{noTechnologiesLabel}</p>;
    }

    const hiddenCount = Math.max(0, technologies.length - visibleCount);
    const visibleTechs = technologies.slice(0, visibleCount);
    const hiddenNames = technologies
        .slice(visibleCount)
        .map((t) => t.name)
        .join(', ');

    return (
        <p
            ref={containerRef}
            className={cn('w-full min-w-0 whitespace-nowrap text-sm text-text-secondary')}
            aria-label={ariaLabel}
        >
            {visibleTechs.map((technology, index) => (
                <React.Fragment key={technology.id}>
                    {index > 0 && (
                        <span className="text-text-muted/50" aria-hidden>
                            {' '}
                            -{' '}
                        </span>
                    )}
                    <span>{technology.name}</span>
                </React.Fragment>
            ))}
            {hiddenCount > 0 && (
                <>
                    {visibleCount > 0 && ' '}
                    <span className="inline-flex items-baseline gap-1" title={hiddenNames}>
                        <span className="text-text-muted" aria-hidden>
                            ...
                        </span>
                        <span className="font-semibold text-text-primary">+{hiddenCount}</span>
                    </span>
                </>
            )}
        </p>
    );
};

export default ProjectCardTechnologies;
