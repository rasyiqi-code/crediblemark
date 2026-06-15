"use client";

import { Check, Sparkles, ChevronDown } from "lucide-react";
import Image from "next/image";
import { PurchaseButton } from "@/components/store/purchase-button";
import { PriceDisplay, useCurrency } from "@/components/providers/currency-provider";
import { useState, useRef } from "react";
import Link from "next/link";
import { type Service } from "./service-detail/types";

interface ServiceCardProps {
    service: Service;
}

import { useTranslations } from "next-intl";

export function ServiceCard({ service }: ServiceCardProps) {
    const t = useTranslations("Cards");
    const tService = useTranslations("Service");
    const rectRef = useRef<DOMRect | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const { currency } = useCurrency();
    const isId = currency === 'IDR';

    const displayTitle = (isId && (service as unknown as Record<string, unknown>).title_id) ? (service as unknown as Record<string, unknown>).title_id as string : service.title;

    const displayFeatures = (isId && Array.isArray((service as unknown as Record<string, unknown>).features_id) && ((service as unknown as Record<string, unknown>).features_id as string[]).length > 0)
        ? (service as unknown as Record<string, unknown>).features_id as string[]
        : service.features as string[];
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!rectRef.current) {
            rectRef.current = e.currentTarget.getBoundingClientRect();
        }
        const rect = rectRef.current;
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        rectRef.current = null;
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="group relative rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-brand-yellow/30 overflow-hidden flex flex-col h-full shadow-2xl"
        >
            {/* Interactive Glow Effect */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(254, 215, 0, 0.1), transparent 40%)`,
                }}
            />

            {/* Visual Block - Changed to Square Ratio */}
            <Link href={`/services/${service.slug || service.id}`} className="relative aspect-square overflow-hidden shrink-0 block">
                {service.image ? (
                    <Image
                        src={service.image}
                        alt={displayTitle}
                        fill
                        unoptimized={true}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-zinc-700" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </Link>

            <div className="flex flex-col flex-grow p-4 md:p-5 relative z-10">
                {/* Header Block */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                            {service.interval === 'one_time'
                                ? tService("oneTime")
                                : service.interval}
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            + Add-ons
                        </div>
                    </div>
                    <Link href={`/services/${service.slug || service.id}`}>
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight mb-3">
                            {displayTitle}
                        </h3>
                    </Link>

                </div>

                <div className="mt-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Features Block */}
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col relative group/list">
                            <ul className="space-y-1.5">
                                {displayFeatures.slice(0, 3).map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 group/item">
                                        <Check className="w-3 h-3 text-brand-yellow shrink-0 mt-0.5" />
                                        <span className="text-[11px] text-zinc-400 group-hover/item:text-white transition-colors line-clamp-1">{feature.replace(/<[^>]*>?/gm, '')}</span>
                                    </li>
                                ))}
                            </ul>
                            {displayFeatures.length > 3 && (
                                <>
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
                                    <Link
                                        href={`/services/${service.slug || service.id}`}
                                        className="text-[9px] text-brand-yellow font-bold uppercase tracking-widest mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                        +{displayFeatures.length - 3} {t("more")} <ChevronDown className="w-2.5 h-2.5" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Metrics Block */}
                        <div className="p-3 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10 flex flex-col justify-between min-h-[100px]">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t("price")}</div>
                                {(service as unknown as Record<string, unknown>).priceType === 'STARTING_AT' && (
                                    <span className="text-[9px] font-normal text-zinc-400">
                                        {tService("startsAt")}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5 select-none">
                                {service.discount && service.discount > 0 ? (
                                    <span className="text-xs text-zinc-500 line-through tracking-tight font-medium">
                                        <PriceDisplay amount={service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} compact={true} />
                                    </span>
                                ) : null}
                                <div className="text-xl md:text-2xl font-black text-white tracking-tighter break-words line-clamp-1 group-hover:line-clamp-none transition-all">
                                    <PriceDisplay amount={service.discount ? (service.price * (1 - service.discount / 100)) : service.price} baseCurrency={((service as unknown as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} compact={true} />
                                </div>
                            </div>
                            <PurchaseButton
                                serviceId={service.id}
                                interval={service.interval}
                                className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-9 px-4 rounded-xl w-full text-[10px] uppercase mt-4 tracking-tighter shadow-lg shadow-brand-yellow/20 shrink-0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
