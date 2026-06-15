import { ReactNode } from "react";

interface AdminEmptyStateProps {
    /** Ikon yang ditampilkan di tengah */
    icon?: ReactNode;
    /** Teks utama pesan kosong */
    title?: string;
    /** Teks sekunder/deskripsi tambahan */
    description?: string;
    /** Elemen aksi opsional (misal tombol "Reset Filter") */
    action?: ReactNode;
    /** Kelas CSS tambahan untuk wrapper */
    className?: string;
}

/**
 * Komponen shared untuk menampilkan empty state yang seragam di seluruh halaman admin.
 * Menggantikan JSX div empty state inline yang berulang di banyak file.
 */
export function AdminEmptyState({
    icon,
    title = "Tidak ada data",
    description,
    action,
    className = "",
}: AdminEmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center ${className}`}
        >
            {icon && (
                <div className="mb-4 text-zinc-700">
                    {icon}
                </div>
            )}
            <p className="text-zinc-500 text-sm font-medium">{title}</p>
            {description && (
                <p className="text-zinc-600 text-xs mt-1">{description}</p>
            )}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
