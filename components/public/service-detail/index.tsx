"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Service, AddonType } from "./types";
import { ServiceHero } from "./hero";
import { AboutSection } from "./about-section";
import { ServiceFeatures } from "./features";
import { Deliverables } from "./deliverables";
import { FooterInfo } from "./footer-info";
import { StickyCTA } from "./sticky-cta";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ServiceDetailContentProps
{
    service: Service;
    isId: boolean;
    showBack?: boolean;
    trustedAvatars?: string[];
    globalAddons?: AddonType[];
}

export function ServiceDetailContent({ service, isId, trustedAvatars = [], globalAddons = [] }: ServiceDetailContentProps)
{
    const tService = useTranslations("Service");

    const handleShare = async () => {
        const shareUrl = typeof window !== "undefined" ? window.location.href : "";
        const shareTitle = typeof document !== "undefined" ? document.title : ((isId && service.title_id) ? service.title_id : service.title);

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success(isId ? "Tautan berhasil disalin ke papan klip!" : "Link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    // Fallback to EN if ID content is missing
    const displayTitle = (isId && service.title_id) ? service.title_id : service.title;
    const displayDescription = (isId && service.description_id) ? service.description_id : service.description;

    const displayAddons: AddonType[] = globalAddons.map((addon) => ({
        id: addon.id,
        name: isId ? (addon.name_id || addon.name) : addon.name,
        price: addon.price,
        currency: addon.currency as "USD" | "IDR",
        interval: addon.interval
    }));

    const intervalLabel = service.interval === 'one_time' ? tService("oneTime") : service.interval;

    const [selectedAddons, setSelectedAddons] = useState<AddonType[]>([]);

    const toggleAddon = (addon: AddonType) =>
    {
        setSelectedAddons(prev =>
        {
            const exists = prev.find(a => a.name === addon.name);
            if (exists) {
                return prev.filter(a => a.name !== addon.name);
            }
            return [...prev, addon];
        });
    };

    return (
        <div className="relative min-h-screen bg-black flex flex-col">
            {/* Shared Background Pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-brand-yellow/5 blur-[120px]" />
                <div className="absolute -left-20 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
                {service.image && (
                    <div className="absolute -right-20 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-brand-yellow/5 blur-[150px] opacity-30" />
                )}
            </div>

            <div className="flex-grow z-10">
                <ServiceHero
                    service={service}
                    displayTitle={displayTitle}
                    intervalLabel={intervalLabel}
                    selectedAddons={selectedAddons}
                    displayAddons={displayAddons}
                />

                <div className="max-w-6xl mx-auto px-6 md:px-8 space-y-24 pb-32">
                    <AboutSection
                        service={service}
                        displayDescription={displayDescription}
                        displayAddons={displayAddons}
                        selectedAddons={selectedAddons}
                        toggleAddon={toggleAddon}
                    />

                    <Deliverables service={service} isId={isId} />

                    <ServiceFeatures />

                    <FooterInfo trustedAvatars={trustedAvatars} />
                </div>
            </div>

            <StickyCTA
                service={service}
                intervalLabel={intervalLabel}
                selectedAddons={selectedAddons}
            />

            {/* Tombol Share di pojok kiri bawah dengan Efek Premium */}
            <div className="fixed bottom-8 left-8 z-50">
                <button
                    type="button"
                    onClick={handleShare}
                    className="relative flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-brand-yellow hover:border-brand-yellow/40 active:scale-95 transition-all duration-300 group cursor-pointer shadow-2xl hover:shadow-[0_0_20px_rgba(254,215,0,0.25)]"
                    title={isId ? "Bagikan Layanan" : "Share Service"}
                    aria-label="Share"
                >
                    {/* Ring Efek Berdenyut (Glow Pulse) */}
                    <div className="absolute inset-0 rounded-full bg-brand-yellow/10 animate-ping opacity-30 group-hover:opacity-50 pointer-events-none transition-opacity duration-300" />
                    
                    <Share2 className="w-5 h-5 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-[15deg]" />
                </button>
            </div>
        </div>
    );
}
