"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getPortfolioHtml, getRenderedHtml } from "@/lib/portfolios/actions";

// Style CSS untuk menyembunyikan scrollbar di preview iframe
const PREVIEW_HIDE_SCROLLBAR = `<style>body { scrollbar-width: none; -ms-overflow-style: none; } body::-webkit-scrollbar { display: none; }</style>`;

/**
 * Membangun srcDoc untuk iframe preview portfolio.
 * Jika konten sudah merupakan dokumen HTML lengkap, sisipkan style scrollbar-hiding ke <head>.
 * Jika fragment HTML, bungkus dalam dokumen HTML baru.
 */
function buildSrcDoc(content: string): string {
    if (!content) return "<html><body style='background: #f8fafc'></body></html>";
    const trimmed = content.trim();
    const isFullDocument = /^<!doctype\s+html|^<html[\s>]/i.test(trimmed);

    if (isFullDocument) {
        if (/<head[\s>]/i.test(trimmed)) {
            return trimmed.replace(/<head([^>]*)>/i, `<head$1>${PREVIEW_HIDE_SCROLLBAR}`);
        }
        return trimmed.replace(/<html([^>]*)>/i, `<html$1><head>${PREVIEW_HIDE_SCROLLBAR}</head>`);
    }

    return `<html><head>${PREVIEW_HIDE_SCROLLBAR}</head><body>${content}</body></html>`;
}

interface PortfolioPreviewProps {
    slug?: string;
    html?: string;
    imageUrl?: string | null;
    externalUrl?: string | null;
}

/**
 * Komponen live preview untuk card portfolio.
 * Diekstrak dari `portfolio-manager.tsx` agar dapat dikelola secara mandiri.
 * Mendukung preview via iframe (HTML langsung / eksternal URL) atau gambar statis.
 */
export function PortfolioPreview({ slug, html: directHtml, imageUrl, externalUrl }: PortfolioPreviewProps) {
    const [fetchedContent, setFetchedContent] = useState("");

    useEffect(() => {
        if (directHtml) return;

        if (externalUrl) {
            const protocol = window.location.protocol;
            const host = window.location.host;
            const localBaseUrl = `${protocol}//${host}`;
            getRenderedHtml(externalUrl, localBaseUrl).then(setFetchedContent);
        } else if (slug) {
            getPortfolioHtml(slug).then(setFetchedContent);
        }
    }, [slug, directHtml, externalUrl]);

    const content = directHtml || fetchedContent;

    return (
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-zinc-900 relative group/preview shadow-2xl">
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
            ) : (
                <div className="absolute inset-0 origin-top-left w-[400%] h-[400%] scale-[0.25] pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                    <iframe
                        src={externalUrl || undefined}
                        srcDoc={!externalUrl ? buildSrcDoc(content) : undefined}
                        className="w-full h-full border-none overflow-hidden"
                        title="Admin Preview"
                        scrolling="no"
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 pointer-events-none" />
        </div>
    );
}

interface PortfolioCardProps {
    item: {
        id: string;
        title: string;
        slug: string;
        category?: string | null;
        description?: string | null;
        imageUrl?: string | null;
        externalUrl?: string | null;
    };
    onDelete: (id: string) => void;
}

/**
 * Card portfolio single item dengan live preview, aksi hapus, dan tombol preview.
 * Diekstrak dari `portfolio-manager.tsx` agar dapat dikelola secara mandiri.
 */
export function PortfolioCard({ item, onDelete }: PortfolioCardProps) {
    return (
        <div className="group relative bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden hover:border-brand-yellow/30 transition-all duration-700 shadow-2xl hover:shadow-brand-yellow/5 backdrop-blur-sm">
            {/* Area visual utama */}
            <div className="p-3">
                <PortfolioPreview
                    slug={item.slug}
                    imageUrl={item.imageUrl}
                    externalUrl={item.externalUrl}
                />

                {/* Aksi hover */}
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2.5 rounded-full bg-black/60 backdrop-blur-xl text-white/50 hover:text-red-500 hover:bg-black/80 transition-all border border-white/10"
                        title="Delete Project"
                    >
                        {/* Trash2 icon via inline SVG agar tidak perlu import lucide di file ini */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </button>
                    <a
                        href={`/view-design/${item.slug}`}
                        target="_blank"
                        className="p-2.5 rounded-full bg-black/60 backdrop-blur-xl text-white/50 hover:text-brand-yellow hover:bg-black/80 transition-all border border-white/10"
                        title="View Full Preview"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </a>
                </div>

                {/* Status badge */}
                <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                    </span>
                    <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest font-mono">
                        {item.externalUrl ? "Live Site" : "Live Render"}
                    </span>
                </div>
            </div>

            {/* Konten teks */}
            <div className="px-6 pb-6 pt-2">
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2">
                        {item.category && (
                            <span className="text-[10px] text-brand-yellow/60 font-bold uppercase tracking-[0.2em]">
                                {item.category}
                            </span>
                        )}
                    </div>
                    <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-yellow transition-colors duration-500 truncate">
                        {item.title}
                    </h4>
                    {item.description && (
                        <p className="text-[11px] text-zinc-500 line-clamp-1 font-light italic">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
                            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                        </svg>
                        <span className="text-[10px] text-zinc-600 font-mono italic">Admin Managed</span>
                    </div>
                    <a
                        href={`/view-design/${item.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-brand-yellow text-white hover:text-black rounded-full text-[10px] font-black transition-all duration-500 border border-white/10 hover:border-brand-yellow"
                    >
                        PREVIEW
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
}
