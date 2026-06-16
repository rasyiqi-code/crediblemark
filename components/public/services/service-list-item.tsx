"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    slug?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    currency?: string | null;
    interval: string;
    features: unknown;
    category?: string | null;
    features_id?: unknown;
    image: string | null;
}

interface ServiceListItemProps {
    service: Service;
    isId: boolean;
    indexNumber?: number;
}

export function ServiceListItem({ service, isId, indexNumber }: ServiceListItemProps) {
    const titleText = (isId ? service.title_id : null) || service.title || "";

    return (
        <div
            className="py-2.5 px-4 sm:px-5 flex flex-row justify-between items-center gap-3 bg-zinc-900/20 hover:bg-zinc-900/30 border-l-2 border-l-brand-yellow transition-all duration-300 group relative"
        >
            {/* Gaya Marquee Lokal Terisolasi */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marqueeMobile {
                    0% { transform: translate3d(0, 0, 0); }
                    20% { transform: translate3d(0, 0, 0); }
                    60% { transform: translate3d(-50%, 0, 0); }
                    80% { transform: translate3d(-50%, 0, 0); }
                    100% { transform: translate3d(0, 0, 0); }
                }
                .marquee-container {
                    overflow-x: auto;
                    scrollbar-width: none;
                    white-space: nowrap;
                    width: 100%;
                    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                }
                .marquee-container::-webkit-scrollbar {
                    display: none;
                }
                .marquee-content {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marqueeMobile 8s cubic-bezier(0.25, 1, 0.5, 1) 1 forwards;
                }
                @media (min-width: 640px) {
                    .marquee-container {
                        overflow: hidden;
                        mask-image: none;
                        -webkit-mask-image: none;
                    }
                    .marquee-content {
                        animation: none;
                        display: block;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                }
            `}} />

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Judul & Link Detail */}
                <div className="flex items-center gap-1 max-w-full">
                    <Link href={`/services/${service.slug || service.id}`} className="marquee-container flex-1 min-w-0 block">
                        <div className="marquee-content">
                            <span className="text-xs sm:text-sm font-bold text-brand-yellow leading-snug pr-8 inline-block">
                                {indexNumber !== undefined && (
                                    <span style={{ color: "#ffffff" }} className="mr-1.5">#{indexNumber}.</span>
                                )}
                                {titleText}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-brand-yellow leading-snug sm:hidden pr-8 inline-block">
                                {indexNumber !== undefined && (
                                    <span style={{ color: "#ffffff" }} className="mr-1.5">#{indexNumber}.</span>
                                )}
                                {titleText}
                            </span>
                        </div>
                    </Link>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0 opacity-0 group-hover:opacity-100 transform translate-y-0.5 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-300 hidden sm:block" />
                </div>
            </div>
        </div>
    );
}
