"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Zap, CreditCard, Percent, Plus } from "lucide-react";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { ServiceActionButtons } from "./service-action-buttons";
import { useTranslations, useLocale } from "next-intl";

interface ServiceAccordionItemProps {
    service: any;
    index?: number;
}

export function ServiceAccordionItem({ service, index }: ServiceAccordionItemProps) {
    const t = useTranslations("Admin.Services");
    const locale = useLocale();
    const isId = locale === 'id' || locale === 'id-ID';

    const displayTitle = isId ? (service.title_id || service.title) : service.title;
    const intervalLabel = service.interval === 'one_time'
        ? t("oneTime")
        : (service.interval === 'monthly' ? t("monthly") : (service.interval === 'yearly' ? t("yearly") : service.interval));

    return (
        <AccordionItem
            value={service.id}
            id={`service-item-${service.id}`}
            className="border border-zinc-800/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/80 bg-zinc-950/50 data-[state=open]:border-zinc-700/80 w-full max-w-full relative select-none"
        >
            <AccordionTrigger className="hover:no-underline px-4 py-3.5 cursor-pointer hover:bg-zinc-900/40 group [&>svg]:hidden grid-cols-1 gap-0">
                <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="flex-1 min-w-0 pr-2">
                            <span className="font-medium text-white text-sm truncate block">
                                {index ? `${index}. ` : ""}{displayTitle}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-1 text-[11px] text-zinc-500 mt-1">
                                <span className="truncate font-semibold text-brand-yellow">
                                    <PriceDisplay amount={service.discount && service.discount > 0 ? (service.price * (1 - service.discount / 100)) : service.price} baseCurrency={service.currency || 'USD'} />
                                </span>
                                {service.discount && service.discount > 0 ? (
                                    <>
                                        <span className="line-through text-zinc-400 text-[10px]">
                                            <PriceDisplay amount={service.price} baseCurrency={service.currency || 'USD'} />
                                        </span>
                                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 py-0.25 rounded font-bold">
                                            -{service.discount}%
                                        </span>
                                    </>
                                ) : null}
                                <span className="hidden sm:inline-block text-zinc-700">•</span>
                                <span className="hidden sm:inline-block whitespace-nowrap">
                                    {new Date(service.createdAt).toLocaleDateString()}
                                </span>

                                <Badge
                                    variant="outline"
                                    className={`py-0 px-1.5 h-3.5 text-[9px] sm:text-[10px] shrink-0 font-medium ${service.visibility === 'PRIVATE'
                                        ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}
                                >
                                    {service.visibility === 'PRIVATE' ? t("visibilityPrivate") : t("visibilityPublic")}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-1 border-t border-zinc-800/40 overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row items-start gap-4 mt-3">
                    {service.image && (
                        <div className="relative rounded-lg overflow-hidden border border-white/5 max-w-[200px] sm:w-56 md:w-64 aspect-video shrink-0 bg-black/30 self-start">
                            <Image
                                src={service.image}
                                alt={displayTitle}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 256px"
                            />
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 lg:pr-8">
                                <div className="flex items-start gap-2 group/detail">
                                    <span className="text-zinc-600 mt-0.5"><Zap className="w-3.5 h-3.5" /></span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">{t("interval")}</span>
                                        <span className="text-xs text-zinc-400 font-medium">
                                            {intervalLabel}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 group/detail">
                                    <span className="text-zinc-600 mt-0.5"><CreditCard className="w-3.5 h-3.5" /></span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">{t("priceModel")}</span>
                                        <span className="text-xs text-zinc-400 font-medium">
                                            {service.priceType === 'STARTING_AT'
                                                ? t("startingAt")
                                                : t("fixedPrice")}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 group/detail">
                                    <span className="text-zinc-600 mt-0.5"><Percent className="w-3.5 h-3.5" /></span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">{t("discount")}</span>
                                        <span className="text-xs text-zinc-400 font-medium">
                                            {service.discount && service.discount > 0 ? `${service.discount}%` : t("noDiscount")}
                                        </span>
                                    </div>
                                </div>

                                {/* Tombol Aksi di Mobile (sejajar horizontal dengan Diskon di kolom kedua) */}
                                <div className="flex items-center sm:hidden">
                                    <ServiceActionButtons serviceId={service.id} />
                                </div>
                            </div>

                            {/* Tombol Aksi di Desktop/Tablet (sm ke atas) */}
                            <div className="hidden sm:flex justify-start lg:justify-end shrink-0 pt-2 lg:pt-0 pl-6 lg:pl-0">
                                <ServiceActionButtons serviceId={service.id} />
                            </div>
                        </div>

                        {/* Tampilan daftar addon service */}
                        {(() => {
                            const addons = (isId ? service.addons_id : service.addons) as Array<{ name: string; description?: string; price: number; currency?: string; interval?: string }> | null;
                            if (!addons || addons.length === 0) return null;
                            return (
                                <div className="mt-3 pt-3 border-t border-zinc-800/40">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold block mb-2">
                                        {t("addonsAvailable")}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {addons.map((addon, idx) => (
                                            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                                                <Plus className="w-3.5 h-3.5 text-brand-yellow mt-0.5 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-xs text-zinc-300 font-medium block truncate">{addon.name}</span>
                                                    {addon.description && (
                                                        <span className="text-[10px] text-zinc-600 block truncate">{addon.description}</span>
                                                    )}
                                                    <span className="text-[10px] text-brand-yellow font-mono font-bold">
                                                        <PriceDisplay amount={addon.price} baseCurrency={(addon.currency as 'USD' | 'IDR') || service.currency as 'USD' | 'IDR' || 'USD'} />
                                                        {addon.interval && addon.interval !== 'one_time' && (
                                                            <span className="text-zinc-600 ml-0.5">/{addon.interval === 'monthly' ? t("mo") : (addon.interval === 'yearly' ? t("yr") : addon.interval)}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
