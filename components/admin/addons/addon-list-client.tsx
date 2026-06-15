"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAddons, toggleAddonStatus } from "@/app/actions/addons";
import { EditAddonDialog, type AddonData } from "./edit-addon-dialog";
import { AddonToolbar, type SortOption } from "./addon-toolbar";
import { AddonMobileList } from "./addon-mobile-list";
import { AddonDesktopTable } from "./addon-desktop-table";

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
    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [isPending, startTransition] = useTransition();

    // State untuk modal Edit Addon
    const [editingAddon, setEditingAddon] = useState<AddonData | null>(null);
    const [editDialogOpen, setEditDialogOpenOpen] = useState(false);

    // Filter addon berdasarkan kata kunci pencarian
    const filteredAddons = addons.filter((addon) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const nameEn = addon.name.toLowerCase();
        const nameId = (addon.name_id || "").toLowerCase();
        return nameEn.includes(query) || nameId.includes(query);
    });

    // Urutkan addon berdasarkan opsi yang terpilih
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
            <AddonToolbar
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) setSelectedIds([]);
                }}
                selectedIdsCount={selectedIds.length}
                allSelected={allSelected}
                onToggleSelectAll={handleToggleSelectAll}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                isPending={isPending}
                onBulkDelete={handleBulkDelete}
                existingAddonNames={addons.map((a) => a.name)}
            />

            {/* List Addons */}
            {sortedAddons.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                    {searchQuery ? t("noAddonsFound") : t("noAddons")}
                </div>
            ) : (
                <div className="w-full space-y-4">
                    {/* Tampilan Mobile: Accordion */}
                    <AddonMobileList
                        addons={sortedAddons}
                        selectedIds={selectedIds}
                        isSelectionMode={isSelectionMode}
                        onSelectChange={handleSelectChange}
                        locale={locale}
                        onToggleActive={handleToggleActive}
                        onOpenEditDialog={openEditDialog}
                    />

                    {/* Tampilan Desktop: Tabel */}
                    <AddonDesktopTable
                        addons={sortedAddons}
                        selectedIds={selectedIds}
                        isSelectionMode={isSelectionMode}
                        onSelectChange={handleSelectChange}
                        locale={locale}
                        onToggleActive={handleToggleActive}
                        onOpenEditDialog={openEditDialog}
                    />
                </div>
            )}

            {/* Dialog Edit Addon */}
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
