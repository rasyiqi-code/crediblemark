"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckSquare, Square, Loader2, ListCheck, Search, X, ArrowUpDown } from "lucide-react";

export interface SortOptionItem {
    value: string;
    label: string;
}

interface AdminListToolbarProps {
    // Mode Seleksi
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectModeLabel: string;
    cancelSelectModeLabel: string;

    // Aksi Kustom (seperti tombol AI Magic Draft)
    customAction?: React.ReactNode;

    // Pengurutan (Sorting)
    sortBy: string;
    onSortByChange: (val: string) => void;
    sortOptions: SortOptionItem[];
    sortPlaceholder?: string;

    // Pencarian (Search)
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    searchPlaceholder: string;

    // Aksi Massal (Bulk Actions)
    selectedCount: number;
    allSelected: boolean;
    onToggleSelectAll: () => void;
    selectAllLabel: string;
    deselectAllLabel: string;
    
    // Hapus Massal (Bulk Delete)
    onBulkDelete?: () => void;
    bulkDeleteLabel?: string;
    isPending?: boolean;
}

export function AdminListToolbar({
    isSelectionMode,
    onToggleSelectionMode,
    selectModeLabel,
    cancelSelectModeLabel,
    customAction,
    sortBy,
    onSortByChange,
    sortOptions,
    sortPlaceholder = "Urutkan",
    searchQuery,
    onSearchQueryChange,
    searchPlaceholder,
    selectedCount,
    allSelected,
    onToggleSelectAll,
    selectAllLabel,
    deselectAllLabel,
    onBulkDelete,
    bulkDeleteLabel = "Hapus Terpilih",
    isPending = false
}: AdminListToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent sm:bg-zinc-900/20 border-none sm:border sm:border-zinc-800/60 rounded-none sm:rounded-xl p-0 sm:p-3 w-full">
            {/* 4 Pengaturan Sebaris (Full Width di Desktop dengan flex-1) */}
            <div className="flex items-center gap-2 w-full flex-1">
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
                    title={isSelectionMode ? cancelSelectModeLabel : selectModeLabel}
                >
                    <ListCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isSelectionMode ? cancelSelectModeLabel : selectModeLabel}</span>
                </Button>

                {/* 2. Custom Action (Aksi Tambahan seperti AI Magic Draft) */}
                {!isSelectionMode && customAction && (
                    <div className="shrink-0">
                        {customAction}
                    </div>
                )}

                {/* 3. Pengurutan (Dropdown Sort) */}
                <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger className="w-9 h-8 p-0 bg-black/20 border-white/5 text-zinc-300 text-xs focus:ring-blue-500/20 focus:ring-offset-0 flex items-center justify-center shrink-0 sm:w-[140px] sm:px-3">
                        <div className="flex items-center justify-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="hidden sm:inline">
                                <SelectValue placeholder={sortPlaceholder} />
                            </span>
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/5 text-zinc-200">
                        {sortOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 4. Input Pencarian (Selalu flex-1 agar full width di desktop & mobile) */}
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        placeholder={searchPlaceholder}
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
            {(isSelectionMode || (isSelectionMode && selectedCount > 0)) && (
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
                                    <span>{deselectAllLabel}</span>
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{selectAllLabel}</span>
                                </>
                            )}
                        </Button>
                    )}

                    {isSelectionMode && selectedCount > 0 && (
                        <span className="text-xs text-zinc-500 sm:block hidden">
                            {selectedCount} terpilih
                        </span>
                    )}

                    {isSelectionMode && selectedCount > 0 && onBulkDelete && (
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
                            <span>{bulkDeleteLabel}</span>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
