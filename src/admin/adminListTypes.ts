export const ADMIN_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export type AdminPageSize = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_ADMIN_PAGE_SIZE: AdminPageSize = 10;

export type AdminListParams = {
    page: number;
    /** Tamaño de página (UI: 10/20/50; el dashboard puede pedir menos). */
    pageSize: number;
    search?: string;
};

export type AdminPaginatedResult<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

/** Escapa caracteres especiales de ILIKE en Postgres. */
export function escapeIlikePattern(raw: string): string {
    return raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function paginateRange(page: number, pageSize: number): { from: number; to: number } {
    const from = (page - 1) * pageSize;
    return { from, to: from + pageSize - 1 };
}
