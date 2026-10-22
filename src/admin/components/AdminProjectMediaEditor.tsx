import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Star, Trash2 } from 'lucide-react';
import { adminInputClass } from './AdminField';
import type { ProjectMediaFormItem } from '../adminApi';
import { cn } from '@/lib/utils';

interface AdminProjectMediaEditorProps {
    items: ProjectMediaFormItem[];
    onChange: (items: ProjectMediaFormItem[]) => void;
}

const newMediaItem = (isThumbnail: boolean): ProjectMediaFormItem => ({
    clientId: `new-${crypto.randomUUID()}`,
    url: '',
    is_thumbnail: isThumbnail,
});

export const AdminProjectMediaEditor: React.FC<AdminProjectMediaEditorProps> = ({ items, onChange }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex((current) => {
            if (items.length === 0) return 0;
            return Math.min(current, items.length - 1);
        });
    }, [items.length]);

    const selected = items[selectedIndex] ?? null;

    const addImage = () => {
        const next = [...items, newMediaItem(items.length === 0)];
        onChange(next);
        setSelectedIndex(next.length - 1);
    };

    const updateUrl = (clientId: string, url: string) => {
        onChange(items.map((item) => (item.clientId === clientId ? { ...item, url } : item)));
    };

    const setThumbnail = (clientId: string) => {
        onChange(items.map((item) => ({ ...item, is_thumbnail: item.clientId === clientId })));
    };

    const removeItem = (clientId: string) => {
        const next = items.filter((item) => item.clientId !== clientId);
        if (next.length > 0 && !next.some((item) => item.is_thumbnail)) {
            next[0] = { ...next[0], is_thumbnail: true };
        }
        onChange(next);
    };

    const showPrev = () => {
        if (items.length < 2) return;
        setSelectedIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
    };

    const showNext = () => {
        if (items.length < 2) return;
        setSelectedIndex((index) => (index >= items.length - 1 ? 0 : index + 1));
    };

    const thumbs = (
        <>
            {items.map((item, index) => (
                <button
                    key={item.clientId}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Imagen ${index + 1}`}
                    aria-current={index === selectedIndex ? true : undefined}
                    className={cn(
                        'h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-white sm:h-16 sm:w-16',
                        index === selectedIndex
                            ? 'border-[#ec4869] ring-2 ring-[#ec4869]/30'
                            : 'border-[#dee2e6] hover:border-[#ec4869]/50',
                    )}
                >
                    {item.url.trim() ? (
                        <img src={item.url.trim()} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-[#6c757d]">
                            #{index + 1}
                        </span>
                    )}
                </button>
            ))}
            {items.length > 0 ? (
                <button
                    type="button"
                    onClick={addImage}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[#dee2e6] text-[#495057] transition-colors hover:border-[#ec4869]/50 hover:text-[#ec4869] sm:h-16 sm:w-16"
                    aria-label="Añadir imagen"
                >
                    <Plus className="h-5 w-5" />
                </button>
            ) : null}
        </>
    );

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
                {items.length > 0 ? (
                    <div className="order-2 flex min-h-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:order-1 lg:w-[4.75rem] lg:shrink-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
                        {thumbs}
                    </div>
                ) : null}

                <div className="relative order-1 min-h-0 flex-1 overflow-hidden rounded-xl bg-[#f8f9fa] p-2 sm:p-3 lg:order-2">
                    {selected?.url.trim() ? (
                        <img
                            src={selected.url.trim()}
                            alt=""
                            className="h-52 w-full rounded-lg object-cover object-top sm:h-64 md:h-80 lg:h-full lg:min-h-[22rem]"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={addImage}
                            className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#dee2e6] bg-white text-sm font-medium text-[#495057] transition-colors hover:border-[#ec4869]/50 hover:text-[#ec4869] sm:h-64 md:h-80 lg:h-full lg:min-h-[22rem]"
                        >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa]">
                                <Plus className="h-5 w-5" />
                            </span>
                            Añadir imagen
                        </button>
                    )}

                    {items.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={showPrev}
                                className="absolute left-3 top-1/2 z-[2] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70 sm:h-10 sm:w-10"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={showNext}
                                className="absolute right-3 top-1/2 z-[2] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70 sm:h-10 sm:w-10"
                                aria-label="Imagen siguiente"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    ) : null}

                    {selected ? (
                        <div className="absolute bottom-3 left-3 right-3 z-[2] flex flex-wrap items-center justify-between gap-2">
                            {selected.is_thumbnail ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                    <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
                                    Miniatura
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setThumbnail(selected.clientId)}
                                    className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black/75"
                                >
                                    Hacer miniatura
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => removeItem(selected.clientId)}
                                aria-label="Eliminar imagen"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            {selected ? (
                <input
                    type="text"
                    inputMode="url"
                    value={selected.url}
                    onChange={(e) => updateUrl(selected.clientId, e.target.value)}
                    placeholder="https://…"
                    className={cn(adminInputClass, 'text-sm')}
                    aria-label="URL de la imagen"
                />
            ) : null}
        </div>
    );
};
