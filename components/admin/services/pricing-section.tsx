"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles, Loader2 } from "lucide-react";

interface PricingSectionProps {
    priceType: string;
    setPriceType: (value: string) => void;
    interval: string;
    setInterval: (value: string) => void;
    currency: string;
    setCurrency: (value: string) => void;
    applyStep2: () => Promise<void>;
    pendingDraft: any;
    isGeneratingPricing: boolean;
    isSubmitting: boolean;
    isEdit: boolean;
    generatedData?: any;
    defaultVisibility?: string;
    defaultPrice?: number;
    defaultDiscount?: number;
}

export function PricingSection({
    priceType,
    setPriceType,
    interval,
    setInterval,
    currency,
    setCurrency,
    applyStep2,
    pendingDraft,
    isGeneratingPricing,
    isSubmitting,
    isEdit,
    generatedData,
    defaultVisibility = "PUBLIC",
    defaultPrice,
    defaultDiscount
}: PricingSectionProps) {
    const t = useTranslations("Service");
    const tAdmin = useTranslations("Admin.Services");

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">{tAdmin("pricingConfig")}</h3>
                </div>
                <Button
                    type="button"
                    onClick={applyStep2}
                    disabled={!pendingDraft || isGeneratingPricing}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] gap-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-40 disabled:hover:bg-indigo-500/10 disabled:hover:text-indigo-400"
                >
                    {isGeneratingPricing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Sparkles className="w-3 h-3" />
                    )}
                    Isi dari AI
                </Button>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("visibility")}</label>
                    <Select name="visibility" defaultValue={defaultVisibility}>
                        <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PUBLIC">{tAdmin("public")}</SelectItem>
                            <SelectItem value="PRIVATE">{tAdmin("private")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("priceType")}</label>
                    <Select name="priceType" value={priceType} onValueChange={setPriceType}>
                        <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FIXED">{t("fixedPrice")}</SelectItem>
                            <SelectItem value="STARTING_AT">{t("startingAt")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("price")}</label>
                    <div className="flex gap-2">
                        <Select name="currency" value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="w-[100px] bg-black/20 border-white/10 text-zinc-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={generatedData?.recommended_price ?? defaultPrice}
                            placeholder="0.00"
                            required
                            className="flex-1 bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 text-lg font-semibold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("originalPrice")}</label>
                    <Input
                        name="discount"
                        type="number"
                        min="0"
                        max="99"
                        step="1"
                        defaultValue={generatedData?.discount ?? defaultDiscount ?? 0}
                        placeholder="0"
                        className="w-full bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 text-sm font-semibold"
                    />
                    <span className="text-[10px] text-zinc-500 block leading-normal">
                        {tAdmin("originalPriceHelp")}
                    </span>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("billingInterval")}</label>
                    <Select
                        name="interval"
                        value={interval}
                        onValueChange={setInterval}
                    >
                        <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="one_time">{t("oneTime")}</SelectItem>
                            <SelectItem value="monthly">{tAdmin("monthlySub")}</SelectItem>
                            <SelectItem value="yearly">{tAdmin("yearlySub")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <input type="hidden" name="interval" value={interval} />
                </div>
            </div>
            <div className="px-6 py-4 bg-zinc-900/60 border-t border-white/5">
                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? (isEdit ? tAdmin("saving") : tAdmin("publishing"))
                        : (isEdit ? tAdmin("saveChanges") : tAdmin("publishService"))}
                </Button>
                {!isEdit && (
                    <p className="text-[10px] text-center text-zinc-600 mt-3">
                        {tAdmin("publishNotice")}
                    </p>
                )}
            </div>
        </div>
    );
}
