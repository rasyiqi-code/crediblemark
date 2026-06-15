import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLoadMoreButtonProps {
    /** Apakah sedang loading data berikutnya */
    isLoading: boolean;
    /** Callback saat tombol diklik */
    onClick: () => void;
    /** Label saat tidak loading */
    label?: string;
    /** Label saat loading */
    loadingLabel?: string;
}

/**
 * Tombol "Load More" yang seragam untuk digunakan pada list admin
 * yang mendukung paginasi incremental (infinite scroll / load more).
 */
export function AdminLoadMoreButton({
    isLoading,
    onClick,
    label = "Load More",
    loadingLabel = "Loading...",
}: AdminLoadMoreButtonProps) {
    return (
        <div className="flex justify-center pt-4">
            <Button
                variant="ghost"
                onClick={onClick}
                disabled={isLoading}
                className="h-10 px-8 rounded-full border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all gap-2"
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? loadingLabel : label}
            </Button>
        </div>
    );
}
