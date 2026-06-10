import React from 'react';
import { cn } from '@/lib/utils';

interface Technology {
    name: string;
    icon: React.ReactElement;
}

interface StackCategory {
    label: string;
    technologies: Technology[];
}

interface TechnologyStackProps {
    categories: StackCategory[];
    className?: string;
}

const pillIconClass = 'h-3.5 w-3.5 shrink-0';

/** Icono reducido para las pills del stack */
function SmallTechIcon({ icon }: { icon: React.ReactElement }) {
    return React.cloneElement(icon, {
        className: pillIconClass,
    } as React.HTMLAttributes<SVGElement>);
}

const TechnologyStack: React.FC<TechnologyStackProps> = ({ categories, className }) => (
    <div className={cn('w-full', className)}>
        {categories.map((category, index) => (
            <div
                key={category.label}
                className={cn(
                    'flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-6',
                    index < categories.length - 1 && 'border-b border-border',
                )}
            >
                <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-text-muted sm:w-24 md:w-28 lg:w-32">
                    {category.label}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                    {category.technologies.map((tech) => (
                        <span
                            key={tech.name}
                            title={tech.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-text-primary transition-colors hover:border-accent/40"
                        >
                            <SmallTechIcon icon={tech.icon} />
                            {tech.name}
                        </span>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default TechnologyStack;
