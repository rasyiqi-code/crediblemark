"use client";

import { ReactNode } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/shared/utils";

interface DetailItemProps {
    /** Ikon kecil di sisi kiri */
    icon: ReactNode;
    /** Label kategori (ditampilkan kecil di atas nilai) */
    label: string;
    /** Nilai yang ditampilkan */
    value?: string;
    /** Teks placeholder jika value kosong */
    placeholder?: string;
    /** Tampilkan tombol salin jika true */
    copyable?: boolean;
}

/**
 * Item detail satu baris dengan ikon, label, nilai, dan tombol copy opsional.
 * Digunakan di project accordion dan accordion service untuk menampilkan metadata.
 * Sebelumnya didefinisikan lokal di `projects-accordion-list.tsx`.
 */
export function DetailItem({
    icon,
    label,
    value,
    placeholder,
    copyable,
}: DetailItemProps) {
    const display = value || placeholder;
    const isEmpty = !value;

    const handleCopy = () => {
        if (!value) return;
        copyToClipboard(value, label, (msg) => toast.success(msg));
    };

    return (
        <div className="flex items-center gap-2 group/detail">
            <span className="text-zinc-600">{icon}</span>
            <div className="flex-1 min-w-0">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">
                    {label}
                </span>
                <span
                    className={`text-xs font-mono truncate block ${isEmpty ? "text-zinc-600 italic" : "text-zinc-400"}`}
                    title={value}
                >
                    {display}
                </span>
            </div>
            {copyable && value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover/detail:opacity-100 transition-opacity bg-zinc-800/50 hover:bg-zinc-800 hover:text-white text-zinc-500 shrink-0"
                    onClick={handleCopy}
                >
                    <Copy className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}
