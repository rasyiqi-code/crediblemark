"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { ServiceAccordionItem } from "./service-accordion-item";
import { deleteServices } from "@/app/actions/services";
import { Trash2, CheckSquare, Square, Loader2 } from "lucide-react";

interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
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
    const [isPending, startTransition] = useTransition();

    // Cek apakah seluruh layanan saat ini tercentang
    const allSelected = services.length > 0 && selectedIds.length === services.length;

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
            setSelectedIds(services.map((s) => s.id));
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
            {/* Toolbar Aksi Massal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-3 w-full">
                <div className="flex items-center gap-3">
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
                    {selectedIds.length > 0 && (
                        <span className="text-xs text-zinc-500 animate-in fade-in duration-200">
                            {selectedIds.length} terpilih
                        </span>
                    )}
                </div>

                {selectedIds.length > 0 && (
                    <Button
                        type="button"
                        onClick={handleBulkDelete}
                        disabled={isPending}
                        className="h-8 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center gap-1.5 px-3.5 rounded-lg animate-in fade-in slide-in-from-right-1 duration-200"
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

            {/* List Accordion dengan opsi pencentangan */}
            <Accordion type="multiple" className="w-full space-y-2">
                {services.map((service, index) => (
                    <ServiceAccordionItem
                        key={service.id}
                        service={service}
                        index={services.length - index}
                        showCheckbox={true}
                        isSelected={selectedIds.includes(service.id)}
                        onSelectChange={(selected) => handleSelectChange(service.id, selected)}
                    />
                ))}
            </Accordion>
        </div>
    );
}
