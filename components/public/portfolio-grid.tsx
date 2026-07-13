"use client";

import { useState } from "react";
import { PortfolioCard } from "@/components/public/portfolio-card";
import { ScrollAnimationWrapper } from "@/components/ui/scroll-animation-wrapper";
import { useTranslations } from "next-intl";

interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    category?: string;
    description?: string;
    html: string;
    externalUrl?: string;
    imageUrl?: string;
    source?: "database" | "github";
}

interface PortfolioGridProps {
    items: PortfolioItem[];
}

/**
 * Grid portfolio dengan filter category.
 * Menampilkan tombol filter di atas grid card untuk memfilter berdasarkan kategori.
 */
export function PortfolioGrid({ items }: PortfolioGridProps) {
    const [activeSource, setActiveSource] = useState<string>("all");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const t = useTranslations("Portfolio");

    // Pisahkan item berdasarkan source
    const hasDb = items.some(i => i.source === "database" || !i.source);
    const hasGithub = items.some(i => i.source === "github");

    // Filter berdasarkan source tab
    const sourceFiltered = activeSource === "all"
        ? items
        : activeSource === "projects"
        ? items.filter(i => i.source === "database" || !i.source)
        : items.filter(i => i.source === "github");

    // Ekstrak daftar kategori unik dari source-filtered items
    const categories = Array.from(
        new Set(sourceFiltered.map((item) => item.category || "Design"))
    );

    // Filter items berdasarkan kategori aktif
    const filteredItems =
        activeCategory === "all"
            ? sourceFiltered
            : sourceFiltered.filter((item) => (item.category || "Design") === activeCategory);

    const handleSourceChange = (src: string) => {
        setActiveSource(src);
        setActiveCategory("all"); // Reset kategori saat ganti source
    };

    return (
        <>
            {/* Source Tab Filter (Proyek vs Repositori) */}
            {(hasDb && hasGithub) && (
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[
                        { key: "all", label: t("all") },
                        { key: "projects", label: t("projects") },
                        { key: "repos", label: t("repos") },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleSourceChange(key)}
                            className={`px-5 py-2 rounded-full text-xs font-black tracking-wide transition-all duration-300 border ${
                                activeSource === key
                                    ? "text-black border-brand-yellow/50 shadow-lg shadow-brand-yellow/20"
                                    : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                            }`}
                            style={activeSource === key ? { backgroundColor: "#a67c00" } : undefined}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Category Filter Bar */}
            {categories.length > 1 && (
                <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 border ${activeCategory === "all"
                            ? "text-white border-white/30 shadow-lg"
                            : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                            }`}
                        style={activeCategory === "all" ? { backgroundColor: "#a67c00" } : undefined}
                    >
                        {t("all")}
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 border ${activeCategory === cat
                                 ? "text-white border-white/30 shadow-lg"
                                 : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                                 }`}
                            style={activeCategory === cat ? { backgroundColor: "#a67c00" } : undefined}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                {filteredItems.map((item, index) => (
                    <ScrollAnimationWrapper key={item.id} delay={index * 0.1}>
                        <PortfolioCard
                            title={item.title}
                            slug={item.slug}
                            category={item.category}
                            description={item.description}
                            html={item.html}
                            externalUrl={item.externalUrl}
                            imageUrl={item.imageUrl}
                            source={item.source}
                        />
                    </ScrollAnimationWrapper>
                ))}
            </div>

            {/* Empty state saat filter aktif */}
            {filteredItems.length === 0 && (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl mb-24">
                    <p className="text-zinc-500">{t("empty")}</p>
                </div>
            )}
        </>
    );
}
