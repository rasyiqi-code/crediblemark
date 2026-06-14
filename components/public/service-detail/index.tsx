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
import { MessageSquare } from "lucide-react";
import { useFloatingChat } from "@/lib/store/floating-chat-store";

interface ServiceDetailContentProps
{
    service: Service;
    isId: boolean;
    showBack?: boolean;
    trustedAvatars?: string[];
}

export function ServiceDetailContent({ service, isId, trustedAvatars = [] }: ServiceDetailContentProps)
{
    const tService = useTranslations("Service");
    const { setIsOpen } = useFloatingChat();

    // Fallback to EN if ID content is missing
    const displayTitle = (isId && service.title_id) ? service.title_id : service.title;
    const displayDescription = (isId && service.description_id) ? service.description_id : service.description;

    const displayAddons = (isId && Array.isArray(service.addons_id) && (service.addons_id as AddonType[]).length > 0)
        ? (service.addons_id as AddonType[])
        : (service.addons as AddonType[]) || [];

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

            {/* Tombol pemicu chat tambahan di pojok kiri bawah */}
            <div className="fixed bottom-8 left-8 z-50">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-white/10 text-brand-yellow shadow-2xl hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                    title={isId ? "Konsultasi Gratis" : "Free Consultation"}
                    aria-label="Chat"
                >
                    <MessageSquare className="w-5 h-5 group-hover:animate-pulse" />
                </button>
            </div>
        </div>
    );
}
