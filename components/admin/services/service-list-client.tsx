"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Accordion } from "@/components/ui/accordion";
import { ServiceAccordionItem } from "./service-accordion-item";
import { deleteServices } from "@/app/actions/services";
import { AdminListToolbar } from "@/components/admin/shared/admin-list-toolbar";

interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    currency?: string | null;
    interval: string;
    priceType: string;
    createdAt: Date | string;
    visibility: string;
    image?: string | null;
    addons?: unknown;
    addons_id?: unknown;
}

interface AddonData {
    id: string;
    name: string;
    name_id?: string | null;
    price: number;
    currency: string;
    interval: string;
    isActive: boolean;
}

interface ServiceListClientProps {
    services: ServiceData[];
    addons?: AddonData[];
}

export function ServiceListClient({ services, addons = [] }: ServiceListClientProps) {
    const t = useTranslations("Admin.Services");
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    type SortOption = "latest" | "oldest" | "price_asc" | "price_desc" | "name_asc";
    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [isPending, startTransition] = useTransition();

    // Tambahkan nomor urut asli ke setiap layanan berdasarkan urutan props aslinya
    const servicesWithIndex = services.map((service, idx) => ({
        ...service,
        displayIndex: services.length - idx
    }));

    // Menyaring layanan berdasarkan teks pencarian (searchQuery) atau nomor urut (displayIndex)
    const filteredServices = servicesWithIndex.filter((service) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        // Jika query mengandung tanda koma, kita pecah menjadi beberapa token untuk pencarian multi-item/multi-angka
        if (query.includes(",")) {
            const tokens = query.split(",").map(t => t.trim()).filter(t => t !== "");
            
            // Mencocokkan apakah minimal salah satu token cocok dengan item layanan ini
            return tokens.some((token) => {
                // Jika token adalah angka murni, cocokkan secara persis dengan displayIndex
                if (/^\d+$/.test(token)) {
                    return service.displayIndex.toString() === token;
                }
                // Jika token teks, cocokkan secara parsial dengan judul atau deskripsi
                const matchesTitle = service.title.toLowerCase().includes(token);
                const matchesTitleId = service.title_id?.toLowerCase().includes(token) || false;
                const matchesDesc = service.description.toLowerCase().includes(token);
                const matchesDescId = service.description_id?.toLowerCase().includes(token) || false;

                return matchesTitle || matchesTitleId || matchesDesc || matchesDescId;
            });
        }

        // Pencarian standar jika tidak menggunakan pemisah koma
        const matchesIndex = service.displayIndex.toString() === query || 
                             service.displayIndex.toString().includes(query);
        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesTitleId = service.title_id?.toLowerCase().includes(query) || false;
        const matchesDesc = service.description.toLowerCase().includes(query);
        const matchesDescId = service.description_id?.toLowerCase().includes(query) || false;

        return matchesIndex || matchesTitle || matchesTitleId || matchesDesc || matchesDescId;
    });

    // Mengurutkan layanan berdasarkan opsi pengurutan (sortBy)
    const sortedServices = [...filteredServices].sort((a, b) => {
        switch (sortBy) {
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "price_asc":
                return a.price - b.price;
            case "price_desc":
                return b.price - a.price;
            case "name_asc":
                return a.title.localeCompare(b.title);
            case "latest":
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    // Cek apakah seluruh layanan yang disaring saat ini tercentang
    const allSelected = sortedServices.length > 0 && selectedIds.length === sortedServices.length;

    // Menangani perubahan centang pada masing-masing item layanan
    const handleSelectChange = (id: string, selected: boolean) => {
        if (selected) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
    };

    // Menangani aksi tombol Tandai Semua / Batal Tandai Semua
    const handleToggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedServices.map((s) => s.id));
        }
    };

    // Menangani penghapusan massal layanan terpilih
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        const confirmMessage = t("deleteSelectedConfirm", { count: selectedIds.length });
        if (!confirm(confirmMessage)) return;

        startTransition(async () => {
            try {
                const res = await deleteServices(selectedIds);
                if (res.error) {
                    toast.error(t("deleteSelectedError"));
                } else {
                    toast.success(t("deleteSelectedSuccess"));
                    setSelectedIds([]);
                    router.refresh();
                }
            } catch (error) {
                console.error("Bulk delete failed:", error);
                toast.error(t("deleteSelectedError"));
            }
        });
    };

    return (
        <div className="w-full space-y-4">
            {/* Toolbar Aksi & Pencarian */}
            <AdminListToolbar
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) setSelectedIds([]);
                }}
                selectModeLabel={t("selectMode")}
                cancelSelectModeLabel={t("cancelSelectMode")}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOptions={[
                    { value: "latest", label: t("sortLatest") },
                    { value: "oldest", label: t("sortOldest") },
                    { value: "price_asc", label: t("sortPriceAsc") },
                    { value: "price_desc", label: t("sortPriceDesc") },
                    { value: "name_asc", label: t("sortNameAsc") }
                ]}
                sortPlaceholder={t("sortBy")}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                searchPlaceholder={t("searchPlaceholder")}
                selectedCount={selectedIds.length}
                allSelected={allSelected}
                onToggleSelectAll={handleToggleSelectAll}
                selectAllLabel={t("selectAll")}
                deselectAllLabel={t("deselectAll")}
                onBulkDelete={handleBulkDelete}
                bulkDeleteLabel={t("deleteSelected", { count: selectedIds.length })}
                isPending={isPending}
            />

            {/* List Accordion dengan opsi pencentangan dinamis */}
            {sortedServices.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                    {searchQuery ? t("noServicesFound") : t("noServices")}
                </div>
            ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                    {sortedServices.map((service) => (
                        <ServiceAccordionItem
                            key={service.id}
                            service={service}
                            index={service.displayIndex}
                            showCheckbox={isSelectionMode}
                            isSelected={selectedIds.includes(service.id)}
                            onSelectChange={(selected) => handleSelectChange(service.id, selected)}
                            globalAddons={addons}
                        />
                    ))}
                </Accordion>
            )}
        </div>
    );
}
