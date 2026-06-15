"use client";

import React from "react";
import { Search, LayoutGrid, List, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/shared/utils";

interface MediaToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewType: "grid" | "list";
    setViewType: (view: "grid" | "list") => void;
    selectedCount: number;
    onCancelSelection: () => void;
    onBulkDelete: () => Promise<void>;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    uploading: boolean;
}

export function MediaToolbar({
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    selectedCount,
    onCancelSelection,
    onBulkDelete,
    onUpload,
    uploading
}: MediaToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-2xl min-w-0">
                <div className="relative w-full min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Cari media..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-zinc-900/40 border-white/5 pl-10 h-11 lg:h-10 ring-offset-zinc-950 focus-visible:ring-violet-500/50 w-full min-w-0"
                    />
                </div>
                <div className="flex items-center bg-zinc-900/40 border border-white/5 rounded-lg p-0.5 shrink-0 w-full sm:w-auto justify-center">
                    <button
                        onClick={() => setViewType("grid")}
                        className={cn(
                            "flex-1 sm:flex-none px-3 sm:px-1.5 py-1.5 rounded-md transition-colors flex items-center justify-center gap-2",
                            viewType === "grid" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="xs:inline hidden sm:hidden text-[9px] font-bold uppercase tracking-wider">Grid</span>
                    </button>
                    <button
                        onClick={() => setViewType("list")}
                        className={cn(
                            "flex-1 sm:flex-none px-3 sm:px-1.5 py-1.5 rounded-md transition-colors flex items-center justify-center gap-2",
                            viewType === "list" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <List className="w-4 h-4" />
                        <span className="xs:inline hidden sm:hidden text-[9px] font-bold uppercase tracking-wider">List</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {selectedCount > 0 && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCancelSelection}
                            className="flex-1 sm:flex-none h-11 lg:h-10 border-white/5 bg-zinc-900/40 text-zinc-400 hover:text-white px-4"
                        >
                            Batal ({selectedCount})
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onBulkDelete}
                            className="flex-1 sm:flex-none h-11 lg:h-10 px-4 font-semibold"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </Button>
                    </div>
                )}
                <label className="relative w-full sm:w-auto">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={onUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                    <Button
                        asChild
                        disabled={uploading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 lg:h-10 px-6 font-semibold"
                    >
                        <span>
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Media
                                </>
                            )}
                        </span>
                    </Button>
                </label>
            </div>
        </div>
    );
}
