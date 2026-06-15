"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import type { AddonData } from "./edit-addon-dialog";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface AddonDesktopTableProps {
    addons: AddonData[];
    selectedIds: string[];
    isSelectionMode: boolean;
    onSelectChange: (id: string, checked: boolean) => void;
    locale: string;
    onToggleActive: (addonId: string, currentStatus: boolean) => Promise<void>;
    onOpenEditDialog: (addon: AddonData) => void;
}

export function AddonDesktopTable({
    addons,
    selectedIds,
    isSelectionMode,
    onSelectChange,
    locale,
    onToggleActive,
    onOpenEditDialog
}: AddonDesktopTableProps) {
    const t = useTranslations("Admin.Addons");

    return (
        <div className="hidden md:block overflow-hidden border border-zinc-850 rounded-xl bg-zinc-950/40">
            <table className="w-full text-left border-collapse text-zinc-300">
                <thead>
                    <tr className="bg-zinc-900/40 border-b border-zinc-850 text-xs uppercase tracking-wider text-zinc-500">
                        {isSelectionMode && <th className="py-2 px-4 w-10"></th>}
                        <th className="py-2 px-4">{t("name")}</th>
                        <th className="py-2 px-4">{t("price")}</th>
                        <th className="py-2 px-4">{t("interval")}</th>
                        <th className="py-2 px-4 text-center">{t("status")}</th>
                        <th className="py-2 px-4 text-right">{t("actions")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                    {addons.map((addon) => {
                        const isSelected = selectedIds.includes(addon.id);
                        return (
                            <tr 
                                key={addon.id}
                                className={`hover:bg-white/[0.02] transition-colors ${isSelected ? "bg-blue-500/5 hover:bg-blue-500/5" : ""}`}
                            >
                                {isSelectionMode && (
                                    <td className="py-2 px-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectChange(addon.id, e.target.checked)}
                                            className="rounded border-zinc-800 text-blue-600 focus:ring-blue-500/20 bg-black/40 w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                )}
                                <td className="py-2 px-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-zinc-100 text-sm">
                                            {locale === "id" && addon.name_id ? addon.name_id : addon.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4 font-medium text-sm">
                                    <PriceDisplay amount={addon.price} baseCurrency={(addon.currency as 'USD' | 'IDR') || 'USD'} />
                                </td>
                                <td className="py-2 px-4 text-xs text-zinc-400 uppercase tracking-wide">
                                    {addon.interval === "monthly" 
                                        ? "Monthly" 
                                        : addon.interval === "yearly" 
                                        ? "Yearly" 
                                        : "One-time"}
                                </td>
                                <td className="py-2 px-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <Switch
                                            checked={addon.isActive}
                                            onCheckedChange={() => onToggleActive(addon.id, addon.isActive)}
                                        />
                                    </div>
                                </td>
                                <td className="py-2 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onOpenEditDialog(addon)}
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
    );
}
