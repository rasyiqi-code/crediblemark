"use client";

import { useEffect, useState } from "react";
import { Service, AddonType } from "./types";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { useTranslations } from "next-intl";

interface StickyCTAProps {
    service: Service;
    intervalLabel: string;
    selectedAddons: AddonType[];
}

export function StickyCTA({ service, intervalLabel, selectedAddons }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tService = useTranslations("Service");

    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = 400;
            if (window.scrollY > heroHeight) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
    const totalPrice = Number(service.price) + addonsTotal;

    const displayTitle = service.title;
    const baseCurrency = (service.currency === "IDR" || service.currency === "USD") ? service.currency : "USD";
    const priceSuffix = service.priceType === 'STARTING_AT' ? tService("startsAt") : '';

    return (
        <div
            className={`fixed top-10 md:top-14 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 z-30 transition-all duration-300 transform shadow-lg shadow-black/80 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="flex flex-row items-center justify-between gap-4 py-1.5 md:py-2">
                    {/* Bagian Kiri - Badge & Judul */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                        <span className="text-xs md:text-sm font-black text-brand-yellow tracking-tighter leading-none truncate block">
                            {displayTitle}
                        </span>
                    </div>

                    {/* Bagian Kanan - Harga & Tombol */}
                    <div className="flex items-center gap-4 md:gap-6 shrink-0">
                        {/* Harga (Desktop Only) */}
                        <div className="hidden sm:flex items-baseline gap-1.5 text-right select-none">
                            {priceSuffix && (
                                <span className="text-[9px] md:text-[10px] font-medium text-zinc-500 pb-0.5">
                                    {priceSuffix}
                                </span>
                            )}
                            <span className="text-sm md:text-base font-black text-brand-yellow tracking-tighter">
                                <PriceDisplay amount={totalPrice} baseCurrency={baseCurrency} compact={true} />
                            </span>
                            <span className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                / {intervalLabel}
                            </span>
                        </div>

                        {/* Tombol Pilih - Persegi seperti di hero */}
                        <PurchaseButton
                            serviceId={service.id}
                            interval={service.interval}
                            selectedAddons={selectedAddons}
                            className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-3.5 md:px-4 py-1 md:py-1.5 rounded-none font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-brand-yellow/20 transition-all hover:scale-[1.05] active:scale-[0.95] shrink-0 !w-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}