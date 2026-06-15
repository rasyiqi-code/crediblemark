interface FilterButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
    count: number;
    color?: string;
}

/**
 * Tombol filter pill yang digunakan di toolbar FinanceList.
 * Diekstrak dari `finance-list.tsx` agar bisa digunakan atau dikembangkan secara mandiri.
 */
export function FilterButton({ label, active, onClick, count, color }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2
                ${active ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}
            `}
        >
            <span className={active && color ? color : ""}>{label}</span>
            <span className={`px-1.5 py-0.5 rounded-full bg-zinc-950 text-[10px] min-w-[20px] text-center ${active ? "text-white" : "text-zinc-600"}`}>
                {count}
            </span>
        </button>
    );
}
