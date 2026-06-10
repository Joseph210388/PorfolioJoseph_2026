import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Star, Trash2 } from 'lucide-react';
import { adminInputClass } from './AdminField';
import type { ProjectMediaFormItem } from '../adminApi';
import { cn } from '@/lib/utils';

interface AdminProjectMediaEditorProps {
    items: ProjectMediaFormItem[];
    onChange: (items: ProjectMediaFormItem[]) => void;
}

const CARD_WIDTH = 'min-w-[13.5rem] w-[13.5rem] sm:min-w-[15rem] sm:w-[15rem]';

const newMediaItem = (isThumbnail: boolean): ProjectMediaFormItem => ({
    clientId: `new-${crypto.randomUUID()}`,
    url: '',
    is_thumbnail: isThumbnail,
});

export const AdminProjectMediaEditor: React.FC<AdminProjectMediaEditorProps> = ({ items, onChange }) => {
    const addImage = () => {
        onChange([...items, newMediaItem(items.length === 0)]);
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

    const moveItem = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(index, 1);
        next.splice(target, 0, moved);
        onChange(next);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-[#dee2e6] bg-slate-50/80">
            <div
                className="flex gap-3 overflow-x-auto overscroll-x-contain p-3 snap-x snap-mandatory scroll-smooth"
                role="list"
                aria-label="Imágenes del proyecto"
            >
                {items.map((item, index) => (
                    <article
                        key={item.clientId}
                        role="listitem"
                        className={cn(
                            CARD_WIDTH,
                            'flex shrink-0 snap-start flex-col rounded-xl border bg-white p-3 shadow-sm',
                            item.is_thumbnail ? 'border-[#ec4869]/50 ring-2 ring-[#ec4869]/20' : 'border-[#dee2e6]',
                        )}
                    >
                        <div className="mb-2 flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-[#495057]">#{index + 1}</span>
                            {item.is_thumbnail ? (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#ec4869]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ec4869]">
                                    <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
                                    Miniatura
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setThumbnail(item.clientId)}
                                    className="text-[10px] font-medium text-[#ec4869] hover:underline"
                                >
                                    Hacer miniatura
                                </button>
                            )}
                        </div>

                        <div className="mb-2 h-24 w-full overflow-hidden rounded-lg border border-[#dee2e6] bg-slate-100">
                            {item.url.trim() ? (
                                <img
                                    src={item.url.trim()}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-[#6c757d]">
                                    Sin vista previa
                                </div>
                            )}
                        </div>

                        <input
                            type="url"
                            value={item.url}
                            onChange={(e) => updateUrl(item.clientId, e.target.value)}
                            placeholder="URL Cloudinary…"
                            className={cn(adminInputClass, 'text-xs')}
                            aria-label={`URL imagen ${index + 1}`}
                        />

                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#dee2e6] pt-2">
                            <div className="flex gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, -1)}
                                    disabled={index === 0}
                                    aria-label="Mover a la izquierda"
                                    className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition-colors hover:bg-slate-100 disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, 1)}
                                    disabled={index === items.length - 1}
                                    aria-label="Mover a la derecha"
                                    className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition-colors hover:bg-slate-100 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(item.clientId)}
                                aria-label="Eliminar imagen"
                                className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </article>
                ))}

                <button
                    type="button"
                    onClick={addImage}
                    className={cn(
                        CARD_WIDTH,
                        'flex shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dee2e6] bg-white p-4 text-sm font-medium text-[#495057] transition-colors hover:border-[#ec4869]/50 hover:bg-[#ec4869]/5 hover:text-[#ec4869]',
                    )}
                >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Plus className="h-5 w-5" />
                    </span>
                    <span>Añadir imagen</span>
                </button>
            </div>

            {items.length === 0 ? (
                <p className="border-t border-[#dee2e6] px-3 py-2 text-center text-xs text-[var(--admin-text-muted)]">
                    Desliza horizontalmente cuando haya varias. La miniatura es la de la tarjeta en el portfolio.
                </p>
            ) : null}
        </div>
    );
};
