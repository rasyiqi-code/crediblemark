"use client";

import Link from "next/link";
import { ExternalLink, Maximize2, Github, Smartphone, Monitor, Code, Star, GitFork } from "lucide-react";
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
    source?: "database" | "github";
}

export function PortfolioCard({ title, slug, html, externalUrl, imageUrl, description, category, source }: PortfolioCardProps) {
    const t = useTranslations("Portfolio");
    const previewUrl = `/view-design/${slug}`;
    const isGithubSource = source === "github";
    
    // State image dinamis dengan inisialisasi awal ke opsi dinamis realtime (Auto-Screenshot / GitHub)
    const [imgSrc, setImgSrc] = useState<string>(() => {
        // Coba Opsi 1 (Utama): Auto-Screenshot Live Demo (jika externalUrl ada dan bukan github)
        if (externalUrl && !externalUrl.includes("github.com")) {
            // Gunakan auth key hanya di production karena domain referer diikat ke crediblemark.com
            const isProd = process.env.NODE_ENV === "production";
            const thumUrl = isProd 
                ? `https://image.thum.io/get/auth/78195-crediblemark.com/width/800/crop/800/${externalUrl}`
                : `https://image.thum.io/get/width/800/crop/800/${externalUrl}`;
            return thumUrl;
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

        // Step 1: Error dari imageUrl (atau langsung dilompati jika tidak ada imageUrl)
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
        }

        // Step 3: Cadangan terakhir jika semuanya gagal (Menggunakan gambar abstrak premium Unsplash agar 100% online & bebas 404)
        setFallbackStep(4);
        setImgSrc("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop");
    };

    // Tentukan icon & CTA berdasarkan kategori
    const isGithub = isGithubSource || category?.toLowerCase().includes("github");
    const isAndroid = !isGithubSource && (category?.toLowerCase().includes("android") || category?.toLowerCase().includes("mobile"));
    const isDesktop = !isGithubSource && (category?.toLowerCase().includes("desktop") || category?.toLowerCase().includes("windows") || category?.toLowerCase().includes("mac"));
    
    const Icon = isGithub ? Github : isAndroid ? Smartphone : isDesktop ? Monitor : Code;
    const ctaText = isGithub ? t("viewRepo") : (isAndroid || isDesktop) ? t("getApp") : t("viewCase");

    // Ekstrak language dari description untuk card GitHub (opsional)
    const langLabel = null;

    return (
        <div className={`group relative border rounded-2xl flex flex-col overflow-hidden transition-all duration-700 shadow-xl backdrop-blur-sm ${
            isGithubSource
                ? "bg-zinc-950/60 border-white/8 hover:border-zinc-600/50 hover:shadow-zinc-800/30"
                : "bg-zinc-950/40 border-white/5 hover:border-brand-yellow/30 hover:shadow-brand-yellow/5"
        }`}>
            {/* Main Visual Area */}
            <div className="p-3">
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/5 bg-zinc-900 relative group/preview shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imgSrc}
                        alt={title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover/preview:scale-105 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                    />
                    
                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />

                    {/* Expand Button — hanya untuk database portfolio */}
                    {!isGithubSource && (
                        <Link
                            href={previewUrl}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-xl text-white/50 hover:text-brand-yellow hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 border border-white/10"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </Link>
                    )}

                    {/* Source Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 shadow-lg pointer-events-none">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                isGithubSource ? "bg-zinc-400" : "bg-brand-yellow"
                            }`}></span>
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                                isGithubSource ? "bg-zinc-400" : "bg-brand-yellow"
                            }`}></span>
                        </span>
                        <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest font-mono">
                            {isGithubSource ? "Repositori" : isAndroid ? t("typeMobileApp") : isDesktop ? t("typeDesktopApp") : externalUrl ? t("typeLiveSite") : t("typeLiveRender")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 pt-1 flex flex-col flex-1">
                <div className="flex flex-col gap-0.5 mb-3">
                    {/* Category / Language label */}
                    {(category || langLabel) && (
                        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                            isGithubSource ? "text-zinc-500" : "text-brand-yellow/60"
                        }`}>
                            {isGithubSource ? langLabel || category : category}
                        </span>
                    )}
                    <h4 className={`text-base font-bold tracking-tight transition-colors duration-500 ${
                        isGithubSource
                            ? "text-white/90 group-hover:text-white"
                            : "text-white group-hover:text-brand-yellow"
                    }`}>
                        {title}
                    </h4>
                    {description && (
                        <p className="text-[11px] text-zinc-500 line-clamp-2 font-light leading-snug mt-0.5">
                            {description}
                        </p>
                    )}
                </div>

                {/* Footer CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    {/* Icon Badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${isGithubSource ? "bg-zinc-800/80 border-zinc-700/50" : "bg-brand-yellow/10 border-brand-yellow/30"}`}>
                        <Icon className={`w-3.5 h-3.5 ${isGithubSource ? "text-zinc-300" : "text-brand-yellow"}`} />
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Tombol View Design — hanya untuk database source */}
                        {!isGithubSource && (
                            <Link
                                href={previewUrl}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white rounded-full text-[10px] font-bold transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
                            >
                                <Maximize2 className="w-3 h-3" />
                                {t("viewCase")}
                            </Link>
                        )}
                        {/* CTA Utama */}
                        <Link
                            href={externalUrl || previewUrl}
                            target={externalUrl ? "_blank" : undefined}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black transition-all duration-500 border shadow-lg group/btn ${
                                isGithubSource
                                    ? "bg-white/5 hover:bg-zinc-700 text-white/70 hover:text-white border-white/10 hover:border-zinc-600"
                                    : "bg-white/5 hover:bg-brand-yellow text-white hover:text-black border-white/10 hover:border-brand-yellow"
                            }`}
                        >
                            {ctaText}
                            <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background Glow Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
                isGithubSource ? "from-zinc-600/5 to-transparent" : "from-brand-yellow/5 to-transparent"
            }`} />
        </div>
    );
}
