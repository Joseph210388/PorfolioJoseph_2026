import React from 'react';

interface AdminModalFooterProps {
    formId: string;
    onCancel: () => void;
    saving?: boolean;
}

export const AdminModalFooter: React.FC<AdminModalFooterProps> = ({ formId, onCancel, saving }) => (
    <div className="flex flex-wrap justify-end gap-3">
        <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border border-[#dee2e6] bg-white px-5 py-2.5 text-sm font-semibold text-[#495057] shadow-sm transition-colors hover:border-[#ec4869]/50 hover:bg-white hover:text-[#212529]"
        >
            Cancelar
        </button>
        <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ec4869] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d93d5c] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {saving ? 'Guardando…' : 'Guardar'}
        </button>
    </div>
);
