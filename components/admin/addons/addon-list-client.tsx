"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, CheckSquare, Square, Loader2, ListCheck, Search, X, ArrowUpDown, Edit } from "lucide-react";
import { deleteAddons, toggleAddonStatus } from "@/app/actions/addons";
import { EditAddonDialog, type AddonData } from "./edit-addon-dialog";
import { CreateBulkAddonsDialog } from "./create-bulk-addons-dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface AddonListClientProps {
    addons: AddonData[];
}

export function AddonListClient({ addons }: AddonListClientProps) {
    const t = useTranslations("Admin.Addons");
    const locale = useLocale();
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    type SortOption = "latest" | "oldest" | "price_asc" | "price_desc" | "name_asc";
    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [isPending, startTransition] = useTransition();

    // Edit Addon Modal states
    const [editingAddon, setEditingAddon] = useState<AddonData | null>(null);
    const [editDialogOpen, setEditDialogOpenOpen] = useState(false);

    // Filter addons berdasarkan query pencarian
    const filteredAddons = addons.filter((addon) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const nameEn = addon.name.toLowerCase();
        const nameId = (addon.name_id || "").toLowerCase();
        return nameEn.includes(query) || nameId.includes(query);
    });

    // Urutkan addons berdasarkan kriteria terpilih
    const sortedAddons = [...filteredAddons].sort((a, b) => {
        switch (sortBy) {
            case "oldest":
                return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
            case "price_asc":
                return a.price - b.price;
            case "price_desc":
                return b.price - a.price;
            case "name_asc":
                return a.name.localeCompare(b.name);
            case "latest":
            default:
                return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
        }
    });

    const allSelected = sortedAddons.length > 0 && selectedIds.length === sortedAddons.length;

    const handleSelectChange = (id: string, selected: boolean) => {
        if (selected) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
    };

    const handleToggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedAddons.map((a) => a.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        const confirmMessage = t("deleteSelectedConfirm", { count: selectedIds.length });
        if (!confirm(confirmMessage)) return;

        startTransition(async () => {
            try {
                const res = await deleteAddons(selectedIds);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success(t("deleteSelectedSuccess"));
                    setSelectedIds([]);
                    router.refresh();
                }
            } catch (error) {
                console.error("Bulk delete addons failed:", error);
                toast.error("Gagal menghapus beberapa addon");
            }
        });
    };

    const handleToggleActive = async (addonId: string, currentStatus: boolean) => {
        try {
            const res = await toggleAddonStatus(addonId, !currentStatus);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(`Add-on status ${!currentStatus ? "aktif" : "nonaktif"}`);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to toggle addon status:", error);
            toast.error("Terjadi kesalahan sistem");
        }
    };

    const openEditDialog = (addon: AddonData) => {
        setEditingAddon(addon);
        setEditDialogOpenOpen(true);
    };

    return (
        <div className="w-full space-y-4">
            {/* Toolbar Panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent sm:bg-zinc-900/20 border-none sm:border sm:border-zinc-800/60 rounded-none sm:rounded-xl p-0 sm:p-3 w-full">
                {/* 4 Pengaturan Sebaris */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                    {/* 1. Select Mode */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            if (isSelectionMode) setSelectedIds([]);
                        }}
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

                    {/* 2. AI Magic Draft */}
                    {!isSelectionMode && (
                        <div className="shrink-0">
                            <CreateBulkAddonsDialog existingAddonNames={addons.map(a => a.name)} />
                        </div>
                    )}

                    {/* 3. Urutkan */}
                    <Select value={sortBy} onValueChange={(val: SortOption) => setSortBy(val)}>
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

                    {/* 4. Cari */}
                    <div className="relative flex-1 sm:flex-initial sm:w-56">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            className="bg-black/20 border-white/5 text-zinc-200 text-xs pl-8 pr-7 h-8 w-full focus-visible:ring-blue-500/20"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Aksi Tambahan: Deselect/Select All & Bulk Delete */}
                {(isSelectionMode || (isSelectionMode && selectedIds.length > 0)) && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 empty:hidden">
                        {isSelectionMode && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleToggleSelectAll}
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

                        {isSelectionMode && selectedIds.length > 0 && (
                            <span className="text-xs text-zinc-500 sm:block hidden">
                                {selectedIds.length} terpilih
                            </span>
                        )}

                        {isSelectionMode && selectedIds.length > 0 && (
                            <Button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={isPending}
                                className="h-8 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center gap-1.5 px-3.5 rounded-lg shrink-0 animate-in fade-in slide-in-from-right-1 duration-200"
                            >
                                {isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>{t("deleteSelected", { count: selectedIds.length })}</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* List Addons Table/Card */}
            {sortedAddons.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                    {searchQuery ? t("noAddonsFound") : t("noAddons")}
                </div>
            ) : (
                <div className="w-full space-y-4">
                    {/* Tampilan Mobile: Accordion (block md:hidden) */}
                    <div className="md:hidden w-full divide-y divide-zinc-900">
                        <Accordion type="single" collapsible className="w-full">
                            {sortedAddons.map((addon) => {
                                const isSelected = selectedIds.includes(addon.id);
                                return (
                                    <AccordionItem 
                                        key={addon.id} 
                                        value={addon.id}
                                        className={`border-b border-zinc-900/60 px-1 transition-colors ${
                                            isSelected 
                                                ? "bg-blue-500/5" 
                                                : "hover:bg-white/[0.01]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isSelectionMode && (
                                                <div className="pt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectChange(addon.id, e.target.checked)}
                                                        className="rounded border-zinc-800 text-blue-600 focus:ring-blue-500/20 bg-black/40 w-4 h-4 cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                            
                                            <AccordionTrigger 
                                                className="py-3 hover:no-underline"
                                                onClick={(e) => {
                                                    // Jika dalam selection mode, klik area baris harus men-toggle checkbox, bukan membuka accordion
                                                    if (isSelectionMode) {
                                                        e.preventDefault();
                                                        handleSelectChange(addon.id, !isSelected);
                                                    }
                                                }}
                                            >
                                                <span className="font-semibold text-zinc-100 text-sm truncate text-left pr-2 flex-1 min-w-0">
                                                    {locale === "id" && addon.name_id ? addon.name_id : addon.name}
                                                </span>
                                            </AccordionTrigger>
                                        </div>

                                        <AccordionContent className="pb-3 pt-0.5 border-t border-zinc-900/40 mt-1">
                                            <div className="flex items-center justify-between gap-4 pt-2.5 px-1.5 w-full text-xs">
                                                {/* Harga */}
                                                <div className="font-bold text-amber-500 text-sm shrink-0">
                                                    {addon.currency === "IDR" 
                                                        ? `Rp ${Number(addon.price).toLocaleString("id-ID")}` 
                                                        : `$${Number(addon.price).toFixed(2)}`}
                                                </div>

                                                {/* Interval */}
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                                                    {addon.interval === "monthly" 
                                                        ? "Monthly" 
                                                        : addon.interval === "yearly" 
                                                        ? "Yearly" 
                                                        : "One-time"}
                                                </div>

                                                {/* Status (Switch saja, tanpa label teks) */}
                                                <div className="flex items-center shrink-0">
                                                    <Switch
                                                        checked={addon.isActive}
                                                        onCheckedChange={() => handleToggleActive(addon.id, addon.isActive)}
                                                    />
                                                </div>

                                                {/* Edit (Hanya ikon pensil) */}
                                                {!isSelectionMode && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(addon)}
                                                        className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center border border-transparent hover:border-zinc-700/50"
                                                        title="Edit Add-on"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>

                    {/* Tampilan Desktop: Tabel (hidden md:block) */}
                    <div className="hidden md:block overflow-hidden border border-zinc-850 rounded-xl bg-zinc-950/40">
                        <table className="w-full text-left border-collapse text-zinc-300">
                            <thead>
                                <tr className="bg-zinc-900/40 border-b border-zinc-850 text-xs uppercase tracking-wider text-zinc-500">
                                    {isSelectionMode && <th className="py-3 px-4 w-10"></th>}
                                    <th className="py-3 px-4">{t("name")}</th>
                                    <th className="py-3 px-4">{t("price")}</th>
                                    <th className="py-3 px-4">{t("interval")}</th>
                                    <th className="py-3 px-4 text-center">{t("status")}</th>
                                    <th className="py-3 px-4 text-right">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {sortedAddons.map((addon) => {
                                    const isSelected = selectedIds.includes(addon.id);
                                    return (
                                        <tr 
                                            key={addon.id}
                                            className={`hover:bg-white/[0.02] transition-colors ${isSelected ? "bg-blue-500/5 hover:bg-blue-500/5" : ""}`}
                                        >
                                            {isSelectionMode && (
                                                <td className="py-3.5 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectChange(addon.id, e.target.checked)}
                                                        className="rounded border-zinc-800 text-blue-600 focus:ring-blue-500/20 bg-black/40 w-4 h-4 cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-100 text-sm">
                                                        {locale === "id" && addon.name_id ? addon.name_id : addon.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-sm">
                                                {addon.currency === "IDR" 
                                                    ? `Rp ${Number(addon.price).toLocaleString("id-ID")}` 
                                                    : `$${Number(addon.price).toFixed(2)}`}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-zinc-400 uppercase tracking-wide">
                                                {addon.interval === "monthly" 
                                                    ? "Monthly" 
                                                    : addon.interval === "yearly" 
                                                    ? "Yearly" 
                                                    : "One-time"}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Switch
                                                        checked={addon.isActive}
                                                        onCheckedChange={() => handleToggleActive(addon.id, addon.isActive)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(addon)}
                                                        className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-zinc-850"
                                                        title="Edit Add-on"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit dialog */}
            {editingAddon && (
                <EditAddonDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpenOpen}
                    addon={editingAddon}
                />
            )}
        </div>
    );
}
