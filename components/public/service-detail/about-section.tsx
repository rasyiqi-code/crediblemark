"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { Service, AddonType } from "./types";
import { useTranslations, useLocale } from "next-intl";

interface AboutSectionProps {
    service: Service;
    displayDescription: string;
    displayAddons: AddonType[];
    selectedAddons: AddonType[];
    toggleAddon: (addon: AddonType) => void;
}

export function AboutSection({ service, displayDescription, displayAddons, selectedAddons, toggleAddon }: AboutSectionProps) {
    const t = useTranslations("Cards");
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAddons = displayAddons.filter(addon =>
        addon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Column: About (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse" />
                    {t("about")}
                </h2>
                <div
                    className="text-zinc-300 leading-relaxed font-light text-base md:text-lg lg:text-xl prose prose-invert max-w-none prose-p:mb-6 prose-strong:text-white prose-strong:font-black prose-li:text-zinc-400"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayDescription) }}
                />
            </div>
 
            {/* Kolom Kanan: Add-ons (1/3 lebar) sebagai Sidebar */}
            {displayAddons && displayAddons.length > 0 ? (
                <div className="space-y-6 sticky top-24">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1 h-3 bg-brand-yellow rounded-full" />
                            {t("optionalAddons")}
                        </h2>
                        <p className="text-[10px] text-zinc-500 font-medium">{t("personalize")}</p>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder={locale === 'id' ? "Cari add-on..." : "Search add-ons..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-8 pr-8 py-2.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-brand-yellow/30 focus:bg-white/[0.04] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
 
                    <div className="space-y-3 lg:max-h-[calc(100vh-320px)] lg:overflow-y-auto lg:pr-1.5">
                        {filteredAddons.map((addon, idx) => {
                            const isSelected = selectedAddons.some(a => a.name === addon.name);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleAddon(addon)}
                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border duration-300 ${isSelected ? 'bg-brand-yellow/10 border-brand-yellow/30 shadow-lg shadow-brand-yellow/5' : 'bg-white/[0.03] border-transparent hover:bg-white/[0.08] hover:border-white/10'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0 mt-0.5 ${isSelected ? 'bg-brand-yellow border-brand-yellow scale-110' : 'border-zinc-700 bg-black/40'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs md:text-sm font-bold tracking-tight ${isSelected ? 'text-brand-yellow' : 'text-zinc-300'}`}>{addon.name}</span>
                                            {addon.interval && addon.interval !== "one_time" && (
                                                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{addon.interval}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs md:text-sm font-black text-white ml-3 whitespace-nowrap">
                                        +<PriceDisplay amount={addon.price} baseCurrency={(addon.currency as "USD" | "IDR") || (service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-6 space-y-4 hidden lg:block">
                        <div className="justify-between items-end mb-2 flex">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t("totalInvestment")}</span>
                            <div className="text-xl font-black text-white tracking-tighter">
                                <PriceDisplay
                                    amount={service.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)}
                                    baseCurrency={(service.currency as "USD" | "IDR") || 'USD'}
                                    compact={true}
                                />
                            </div>
                        </div>
                        <PurchaseButton
                            serviceId={service.id}
                            interval={service.interval}
                            selectedAddons={selectedAddons}
                            className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-yellow/20 transition-all hover:scale-[1.02] active:scale-95 group"
                        />
                        <p className="text-[9px] text-center text-zinc-600 font-medium tracking-wide">{t("secureCheckout")}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 sticky top-24 hidden lg:block">
                    <div className="space-y-4">
                        <PurchaseButton
                            serviceId={service.id}
                            interval={service.interval}
                            selectedAddons={[]}
                            className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-yellow/20 transition-all hover:scale-[1.02] active:scale-95"
                        />
                        <p className="text-[9px] text-center text-zinc-600 font-medium tracking-wide mt-4">{t("secureCheckout")}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
