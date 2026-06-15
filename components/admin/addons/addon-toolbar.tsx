"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckSquare, Square, Loader2, ListCheck, Search, X, ArrowUpDown } from "lucide-react";
import { CreateBulkAddonsDialog } from "./create-bulk-addons-dialog";

export type SortOption = "latest" | "oldest" | "price_asc" | "price_desc" | "name_asc";

interface AddonToolbarProps {
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedIdsCount: number;
    allSelected: boolean;
    onToggleSelectAll: () => void;
    sortBy: SortOption;
    onSortByChange: (val: SortOption) => void;
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    isPending: boolean;
    onBulkDelete: () => void;
    existingAddonNames: string[];
}

export function AddonToolbar({
    isSelectionMode,
    onToggleSelectionMode,
    selectedIdsCount,
    allSelected,
    onToggleSelectAll,
    sortBy,
    onSortByChange,
    searchQuery,
    onSearchQueryChange,
    isPending,
    onBulkDelete,
    existingAddonNames
}: AddonToolbarProps) {
    const t = useTranslations("Admin.Addons");

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent sm:bg-zinc-900/20 border-none sm:border sm:border-zinc-800/60 rounded-none sm:rounded-xl p-0 sm:p-3 w-full">
            {/* 4 Pengaturan Sebaris */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                {/* 1. Tombol Mode Seleksi */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSelectionMode}
                    className={`h-8 border transition-all rounded-lg active:scale-95 shrink-0 flex items-center justify-center gap-1.5 ${
                        isSelectionMode 
                            ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                            : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    } w-9 px-0 sm:w-auto sm:px-3 text-xs`}
                    title={isSelectionMode ? t("cancelSelectMode") : t("selectMode")}
                >
                    <ListCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isSelectionMode ? t("cancelSelectMode") : t("selectMode")}</span>
                </Button>

                {/* 2. Draf AI Masal */}
                {!isSelectionMode && (
                    <div className="shrink-0">
                        <CreateBulkAddonsDialog existingAddonNames={existingAddonNames} />
                    </div>
                )}

                {/* 3. Pengurutan */}
                <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger className="w-9 h-8 p-0 bg-black/20 border-white/5 text-zinc-300 text-xs focus:ring-blue-500/20 focus:ring-offset-0 flex items-center justify-center shrink-0 sm:w-[140px] sm:px-3">
                        <div className="flex items-center justify-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="hidden sm:inline">
                                <SelectValue placeholder="Urutkan" />
                            </span>
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/5 text-zinc-200">
                        <SelectItem value="latest" className="text-xs">Terbaru</SelectItem>
                        <SelectItem value="oldest" className="text-xs">Terlama</SelectItem>
                        <SelectItem value="price_asc" className="text-xs">Harga Terendah</SelectItem>
                        <SelectItem value="price_desc" className="text-xs">Harga Tertinggi</SelectItem>
                        <SelectItem value="name_asc" className="text-xs">Nama A-Z</SelectItem>
                    </SelectContent>
                </Select>

                {/* 4. Input Pencarian */}
                <div className="relative flex-1 sm:flex-initial sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="bg-black/20 border-white/5 text-zinc-200 text-xs pl-8 pr-7 h-8 w-full focus-visible:ring-blue-500/20"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchQueryChange("")}
                            className="absolute right-2 top-2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Aksi Tambahan: Deselect/Select All & Bulk Delete */}
            {(isSelectionMode || (isSelectionMode && selectedIdsCount > 0)) && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 empty:hidden">
                    {isSelectionMode && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onToggleSelectAll}
                            className="text-xs text-zinc-400 hover:text-white flex items-center gap-2 px-3 h-8 bg-zinc-900/40 hover:bg-zinc-800/50 border border-white/5 transition-all rounded-lg active:scale-95"
                        >
                            {allSelected ? (
                                <>
                                    <Square className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>{t("deselectAll")}</span>
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{t("selectAll")}</span>
                                </>
                            )}
                        </Button>
                    )}

                    {isSelectionMode && selectedIdsCount > 0 && (
                        <span className="text-xs text-zinc-500 sm:block hidden">
                            {selectedIdsCount} terpilih
                        </span>
                    )}

                    {isSelectionMode && selectedIdsCount > 0 && (
                        <Button
                            type="button"
                            onClick={onBulkDelete}
                            disabled={isPending}
                            className="h-8 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center gap-1.5 px-3.5 rounded-lg shrink-0 animate-in fade-in slide-in-from-right-1 duration-200"
                        >
                            {isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>{t("deleteSelected", { count: selectedIdsCount })}</span>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
