'use client';

import React, { memo, useCallback, useState } from 'react';

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);
const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
    </svg>
);

const Badge = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${className}`} {...props}>
        {children}
    </span>
);

export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface TimelineItemData {
    id: string;
    title: string;
    type: string;
    duration: string;
    icon: IconType;
    responsibilities: string[];
    skills: string[];
}

type ExpandMode = 'multi' | 'single';

export interface ProfessionalTimelineProps {
    data: TimelineItemData[];
    defaultExpandedIds?: string[];
    expandMode?: ExpandMode;
    /** Si es false, los ítems son solo lectura (sin chevron ni expandir). Útil cuando no hay detalle extra. */
    collapsible?: boolean;
}

interface TimelineItemContentProps {
    item: TimelineItemData;
}

const TimelineItemContent = memo(function TimelineItemContent({ item }: TimelineItemContentProps) {
    return (
        <div className="mt-6 space-y-4">
            {item.responsibilities.length > 0 && (
                <ul className="space-y-3">
                    {item.responsibilities.map((responsibility, idx) => (
                        <li key={`${item.id}-resp-${idx}`} className="flex items-start gap-3 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{responsibility}</span>
                        </li>
                    ))}
                </ul>
            )}

            {item.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {item.skills.map((skill, skillIdx) => (
                        <Badge
                            key={`${item.id}-skill-${skillIdx}`}
                            className="bg-accent/10 text-accent hover:bg-accent/20 transition-colors px-3 py-1"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
});
TimelineItemContent.displayName = 'TimelineItemContent';

interface TimelineItemProps {
    item: TimelineItemData;
    expanded: boolean;
    onToggle: (id: string) => void;
    collapsible: boolean;
}

const TimelineItem = memo(function TimelineItem({ item, expanded, onToggle, collapsible }: TimelineItemProps) {
    const Icon = item.icon;
    const headerId = `timeline-header-${item.id}`;
    const contentId = `timeline-content-${item.id}`;

    const headerInner = (
        <div className="min-w-0">
            <h3
                className={`text-lg font-semibold text-text-primary ${collapsible ? 'group-hover:text-accent transition-colors' : ''}`}
            >
                {item.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0 text-sm text-text-muted">
                <span>{item.type}</span>
                <span aria-hidden>•</span>
                <span className="font-mono text-xs sm:text-sm">{item.duration}</span>
            </div>
        </div>
    );

    return (
        <li className="relative">
            <div className="absolute left-1 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-text-muted">
                <Icon className="h-3.5 w-3.5 text-card-background" />
            </div>

            <div className="ml-14 pb-8">
                <div className="rounded-xl border border-border bg-card-background p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:shadow-black/20 dark:hover:shadow-black/30">
                    {collapsible ? (
                        <>
                            <button
                                type="button"
                                id={headerId}
                                className="group w-full cursor-pointer text-left"
                                onClick={() => onToggle(item.id)}
                                aria-expanded={expanded}
                                aria-controls={contentId}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    {headerInner}
                                    <div className="flex-shrink-0 text-text-muted transition-colors group-hover:text-text-primary">
                                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>
                            </button>

                            {expanded && (
                                <div id={contentId} role="region" aria-labelledby={headerId}>
                                    <TimelineItemContent item={item} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full text-left">{headerInner}</div>
                    )}
                </div>
            </div>
        </li>
    );
});
TimelineItem.displayName = 'TimelineItem';

export function ProfessionalTimeline({
    data,
    defaultExpandedIds,
    expandMode = 'multi',
    collapsible = true,
}: ProfessionalTimelineProps) {
    const initial = defaultExpandedIds ?? data.map((d) => d.id);
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initial));

    const onToggle = useCallback(
        (id: string) => {
            setExpanded((prev) => {
                if (expandMode === 'single') {
                    return prev.has(id) ? new Set() : new Set([id]);
                }
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        },
        [expandMode]
    );

    if (data.length === 0) {
        return null;
    }

    return (
        <ol className="relative list-none pl-0">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-border" aria-hidden />

            {data.map((item) => (
                <TimelineItem
                    key={item.id}
                    item={item}
                    expanded={expanded.has(item.id)}
                    onToggle={onToggle}
                    collapsible={collapsible}
                />
            ))}
        </ol>
    );
}
