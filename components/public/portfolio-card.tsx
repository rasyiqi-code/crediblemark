"use client";

import Link from "next/link";
import { ExternalLink, Maximize2, Github, Smartphone, Monitor, Code } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PortfolioCardProps {
    title: string;
    slug: string;
    html: string;
    category?: string;
    description?: string;
    externalUrl?: string;
    imageUrl?: string;
}

export function PortfolioCard({ title, slug, html, externalUrl, imageUrl, description, category }: PortfolioCardProps) {
    const t = useTranslations("Portfolio");
    const previewUrl = `/view-design/${slug}`;
    
    // State image dinamis dengan inisialisasi awal ke opsi dinamis realtime (Auto-Screenshot / GitHub)
    const [imgSrc, setImgSrc] = useState<string>(() => {
        // Coba Opsi 1 (Utama): Auto-Screenshot Live Demo (jika externalUrl ada dan bukan github)
        if (externalUrl && !externalUrl.includes("github.com")) {
            return `https://image.thum.io/get/width/800/crop/800/${externalUrl}`;
        }
        
        // Coba Opsi 2: GitHub Social Preview (jika externalUrl adalah github)
        if (externalUrl && externalUrl.includes("github.com")) {
            const match = externalUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
                const owner = match[1];
                const repo = match[2].replace(/\.git$/, "");
                return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
            }
        }
        
        // Coba Opsi 3: Database imageUrl (jika diisi manual)
        if (imageUrl) return imageUrl;

        // Default awal jika tidak ada URL eksternal & database image: Gambar Lokal
        return `/portfolio/${slug}.jpg`;
    });

    const [fallbackStep, setFallbackStep] = useState<number>(0);

    const handleImageError = () => {
        // Step 0: Error dari Opsi Dinamis Realtime
        if (fallbackStep === 0) {
            setFallbackStep(1);
            // Fallback ke: Database imageUrl (jika ada dan belum dicoba)
            if (imageUrl && imgSrc !== imageUrl) {
                setImgSrc(imageUrl);
                return;
            }
        }

        // Step 1: Error dari imageUrl
        if (fallbackStep <= 1) {
            setFallbackStep(2);
            // Fallback ke: Gambar Lokal (jika belum dicoba)
            const localPath = `/portfolio/${slug}.jpg`;
            if (imgSrc !== localPath) {
                setImgSrc(localPath);
                return;
            }
        }

        // Step 2: Error dari Gambar Lokal
        if (fallbackStep <= 2) {
            setFallbackStep(3);
            // Coba GitHub Social Preview jika tautannya GitHub dan belum pernah dicoba sebelumnya
            if (externalUrl && externalUrl.includes("github.com") && !imgSrc.includes("opengraph.githubassets.com")) {
                const match = externalUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                if (match) {
                    const owner = match[1];
                    const repo = match[2].replace(/\.git$/, "");
                    setImgSrc(`https://opengraph.githubassets.com/1/${owner}/${repo}`);
                    return;
                }
            }
            setImgSrc("/images/placeholder-portfolio.jpg");
            return;
        }

        // Step 3: Cadangan terakhir jika semuanya gagal
        if (fallbackStep >= 3) {
            setImgSrc("/images/placeholder-portfolio.jpg");
        }
    };

    // Tentukan icon & CTA berdasarkan kategori
    const isGithub = category?.toLowerCase().includes("github");
    const isAndroid = category?.toLowerCase().includes("android") || category?.toLowerCase().includes("mobile");
    const isDesktop = category?.toLowerCase().includes("desktop") || category?.toLowerCase().includes("windows") || category?.toLowerCase().includes("mac");
    
    const Icon = isGithub ? Github : isAndroid ? Smartphone : isDesktop ? Monitor : Code;
    const ctaText = isGithub ? t("viewRepo") : (isAndroid || isDesktop) ? t("getApp") : t("viewCase");

    return (
        <div className="group relative bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden hover:border-brand-yellow/30 transition-all duration-700 shadow-2xl hover:shadow-brand-yellow/5 backdrop-blur-sm">
            {/* Main Visual Area (Only Thumbnails - No heavy iframes) */}
            <div className="p-3">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-zinc-900 relative group/preview shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imgSrc}
                        alt={title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover/preview:scale-110 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                    />
                    
                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />

                    {/* Floating Expand Button */}
                    <Link
                        href={previewUrl}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white/50 hover:text-brand-yellow hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 border border-white/10"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Link>

                    {/* Live Indicator Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg pointer-events-none">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                        </span>
                        <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest font-mono">
                            {isGithub ? t("typeRepository") : isAndroid ? t("typeMobileApp") : isDesktop ? t("typeDesktopApp") : externalUrl ? t("typeLiveSite") : t("typeLiveRender")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pb-6 pt-2">
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2">
                        {category && (
                             <span className="text-[10px] text-brand-yellow/60 font-bold uppercase tracking-[0.2em]">
                                {category}
                             </span>
                        )}
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-yellow transition-colors duration-500">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-xs text-zinc-500 line-clamp-1 font-light leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Icon className="w-4 h-4 text-brand-yellow" />
                        </div>
                    </div>
                    
                    <Link
                        href={externalUrl || previewUrl}
                        target={externalUrl ? "_blank" : undefined}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-brand-yellow text-white hover:text-black rounded-full text-[11px] font-black transition-all duration-500 border border-white/10 hover:border-brand-yellow shadow-lg group/btn"
                    >
                        {ctaText}
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Background Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
}
