"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceAccordionItem } from "./service-accordion-item";
import { deleteServices } from "@/app/actions/services";
import { Trash2, CheckSquare, Square, Loader2, ListCheck, Search, X, ArrowUpDown } from "lucide-react";

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

interface ServiceListClientProps {
    services: ServiceData[];
}

export function ServiceListClient({ services }: ServiceListClientProps) {
    const t = useTranslations("Admin.Services");
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    type SortOption = "latest" | "oldest" | "price_asc" | "price_desc" | "name_asc";
    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [isPending, startTransition] = useTransition();

    // Menyaring layanan berdasarkan teks pencarian (searchQuery)
    const filteredServices = services.filter((service) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesTitleId = service.title_id?.toLowerCase().includes(query) || false;
        const matchesDesc = service.description.toLowerCase().includes(query);
        const matchesDescId = service.description_id?.toLowerCase().includes(query) || false;

        return matchesTitle || matchesTitleId || matchesDesc || matchesDescId;
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-3 w-full">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Tombol aktifkan/nonaktifkan mode seleksi */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            if (isSelectionMode) setSelectedIds([]); // Reset seleksi saat keluar mode
                        }}
                        className={`text-xs flex items-center gap-2 px-3 h-8 border transition-all rounded-lg active:scale-95 ${
                            isSelectionMode 
                                ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                                : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                        }`}
                    >
                        <ListCheck className="w-3.5 h-3.5" />
                        <span>{isSelectionMode ? t("cancelSelectMode") : t("selectMode")}</span>
                    </Button>

                    {isSelectionMode && (
                        <>
                            <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />
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
                        </>
                    )}

                    {isSelectionMode && selectedIds.length > 0 && (
                        <span className="text-xs text-zinc-500 animate-in fade-in duration-200">
                            {selectedIds.length} terpilih
                        </span>
                    )}
                </div>

                {/* Bagian Kanan Toolbar: Pengurutan, Pencarian, dan Tombol Hapus Massal */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Dropdown Pengurutan (Sort) */}
                    <Select value={sortBy} onValueChange={(val: SortOption) => setSortBy(val)}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-black/20 border-white/5 text-zinc-300 text-xs h-8 focus:ring-blue-500/20 focus:ring-offset-0">
                            <div className="flex items-center gap-1.5">
                                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                                <SelectValue placeholder={t("sortBy")} />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/5 text-zinc-200">
                            <SelectItem value="latest" className="text-xs">{t("sortLatest")}</SelectItem>
                            <SelectItem value="oldest" className="text-xs">{t("sortOldest")}</SelectItem>
                            <SelectItem value="price_asc" className="text-xs">{t("sortPriceAsc")}</SelectItem>
                            <SelectItem value="price_desc" className="text-xs">{t("sortPriceDesc")}</SelectItem>
                            <SelectItem value="name_asc" className="text-xs">{t("sortNameAsc")}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Input Pencarian */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            className="bg-black/20 border-white/5 text-zinc-200 text-xs pl-9 pr-8 h-8 w-full sm:w-56 focus-visible:ring-blue-500/20"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Tombol Hapus Massal */}
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
            </div>

            {/* List Accordion dengan opsi pencentangan dinamis */}
            {sortedServices.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                    {searchQuery ? t("noServicesFound") : t("noServices")}
                </div>
            ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                    {sortedServices.map((service, index) => (
                        <ServiceAccordionItem
                            key={service.id}
                            service={service}
                            index={services.length - index}
                            showCheckbox={isSelectionMode}
                            isSelected={selectedIds.includes(service.id)}
                            onSelectChange={(selected) => handleSelectChange(service.id, selected)}
                        />
                    ))}
                </Accordion>
            )}
        </div>
    );
}
