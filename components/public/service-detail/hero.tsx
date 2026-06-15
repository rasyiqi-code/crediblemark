"use client";

import { PriceDisplay } from "@/components/providers/currency-provider";
import { PurchaseButton } from "@/components/store/purchase-button";
import { Service, AddonType } from "./types";
import { useTranslations } from "next-intl";
import { ExportPdfButton } from "@/components/admin/services/export-pdf-button";

interface ServiceHeroProps {
    service: Service;
    displayTitle: string;
    intervalLabel: string;
    selectedAddons: AddonType[];
    displayAddons: AddonType[];
}

export function ServiceHero({ service, displayTitle, intervalLabel, selectedAddons, displayAddons }: ServiceHeroProps) {
    const tService = useTranslations("Service");

    return (
        <div className="relative border-b border-white/5 bg-zinc-900/10 backdrop-blur-3xl mb-12 md:mb-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-yellow/[0.03] to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12 p-6 md:p-10 lg:p-12">
                {/* Kolom Kiri: Nama Jasa dan Tombol Unduh Proposal */}
                <div className="flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-4xl font-black text-brand-yellow tracking-tighter leading-tight break-words max-w-3xl">
                        <span>{displayTitle}</span>
                        {/* Batas pemisah vertikal antara judul dan tombol unduh proposal */}
                        <span className="inline-flex items-center gap-x-3 ml-3 align-middle">
                            <span className="text-zinc-600 font-light select-none text-base md:text-lg lg:text-xl">|</span>
                            <ExportPdfButton 
                                service={service} 
                                variant="button" 
                                globalAddons={displayAddons.map(addon => ({
                                    id: addon.id,
                                    name: addon.name,
                                    name_id: addon.name_id,
                                    price: addon.price,
                                    currency: addon.currency || undefined,
                                    interval: addon.interval
                                }))} 
                            />
                        </span>
                    </h1>
                </div>

                {/* Kolom Kanan: Harga & Tombol Order */}
                <div className="flex flex-col items-start md:items-end gap-3 md:gap-4 shrink-0">
                    <div className="flex items-baseline gap-1 md:gap-2 justify-start md:justify-end">
                        {service.priceType === 'STARTING_AT' && (
                            <span className="text-[9px] md:text-xs font-medium text-zinc-500 pb-0.5">
                                {tService("startsAt")}
                            </span>
                        )}
                        {service.discount && service.discount > 0 ? (
                            <span className="text-sm md:text-lg text-zinc-500 line-through tracking-tight font-medium select-none self-center mr-1">
                                <PriceDisplay amount={service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                            </span>
                        ) : null}
                        <div className="text-xl md:text-3xl lg:text-4xl font-black text-brand-yellow tracking-tighter">
                            <PriceDisplay amount={service.discount ? (service.price * (1 - service.discount / 100)) : service.price} baseCurrency={(service.currency as "USD" | "IDR") || 'USD'} compact={true} />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            / {intervalLabel}
                        </span>
                    </div>

                    <PurchaseButton
                        serviceId={service.id}
                        interval={service.interval}
                        selectedAddons={selectedAddons}
                        className="bg-brand-yellow hover:bg-brand-yellow/90 text-black px-6 py-2.5 rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-yellow/20 transition-all hover:scale-[1.05] active:scale-95 whitespace-nowrap"
                    />
                </div>
            </div>
        </div>
    );
}
