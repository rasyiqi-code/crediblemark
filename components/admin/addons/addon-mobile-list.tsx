"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import type { AddonData } from "./edit-addon-dialog";
import { PriceDisplay } from "@/components/providers/currency-provider";

interface AddonMobileListProps {
    addons: AddonData[];
    selectedIds: string[];
    isSelectionMode: boolean;
    onSelectChange: (id: string, checked: boolean) => void;
    locale: string;
    onToggleActive: (addonId: string, currentStatus: boolean) => Promise<void>;
    onOpenEditDialog: (addon: AddonData) => void;
}

export function AddonMobileList({
    addons,
    selectedIds,
    isSelectionMode,
    onSelectChange,
    locale,
    onToggleActive,
    onOpenEditDialog
}: AddonMobileListProps) {
    return (
        <div className="md:hidden w-full divide-y divide-zinc-900">
            <Accordion type="single" collapsible className="w-full">
                {addons.map((addon) => {
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
                                            onChange={(e) => onSelectChange(addon.id, e.target.checked)}
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
                                            onSelectChange(addon.id, !isSelected);
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
                                        <PriceDisplay amount={addon.price} baseCurrency={(addon.currency as 'USD' | 'IDR') || 'USD'} />
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
                                            onCheckedChange={() => onToggleActive(addon.id, addon.isActive)}
                                        />
                                    </div>

                                    {/* Edit (Hanya ikon pensil) */}
                                    {!isSelectionMode && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onOpenEditDialog(addon)}
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
    );
}
