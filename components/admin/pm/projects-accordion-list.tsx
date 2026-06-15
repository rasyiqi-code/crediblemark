"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, ChevronDown, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";
import { type ExtendedProject } from "@/lib/shared/types";
import { useProjectPagination } from "@/lib/shared/hooks/use-project-pagination";
import { AdminEmptyState } from "@/components/admin/shared/admin-empty-state";
import { AdminLoadMoreButton } from "@/components/admin/shared/admin-load-more-button";
import { DetailItem } from "@/components/admin/shared/detail-item";

// ============================================
// Status Configuration Map
// ============================================

/** Map status DB ke label dan styling badge */
const STATUS_MAP: Record<string, { label: string; color: string; variant: "default" | "secondary" | "outline" }> = {
    queue:  { label: "Queue",          color: "text-zinc-400 border-zinc-700",               variant: "outline"   },
    dev:    { label: "In Development", color: "bg-blue-500/10 text-blue-500 border-blue-500/20",   variant: "secondary" },
    review: { label: "In Review",      color: "bg-purple-500/10 text-purple-400 border-purple-500/20", variant: "outline" },
    done:   { label: "Done",           color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", variant: "default" },
};

const DEFAULT_STATUS = { label: "Unknown", color: "text-zinc-400 border-zinc-700", variant: "outline" as const };

// ============================================
// Sub-components
// ============================================

/** Single accordion item untuk satu proyek */
function ProjectAccordionItem({ project }: { project: ExtendedProject }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const status = (project.status || "queue").toLowerCase();
    const config = STATUS_MAP[status] || DEFAULT_STATUS;
    const date = new Date(project.createdAt);

    return (
        <div className="border border-zinc-800/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/80 bg-zinc-950/50">
            {/* Header — selalu tampil */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-900/40 group"
            >
                {/* Indikator status */}
                <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                        status === "done"   ? "bg-emerald-500" :
                        status === "dev"    ? "bg-blue-500"    :
                        status === "review" ? "bg-purple-400"  :
                        "bg-zinc-600"
                    }`}
                />

                {/* Judul proyek + nama klien */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm truncate">{project.title}</span>
                        {project.service ? (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-normal py-0 px-1.5 h-4 text-[9px] shrink-0">
                                Product
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-normal py-0 px-1.5 h-4 text-[9px] shrink-0">
                                Service
                            </Badge>
                        )}
                    </div>
                    <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
                        {project.clientName || "Unnamed Client"}
                    </span>
                </div>

                {/* Status badge + tanggal */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={config.variant} className={`py-0 px-2 h-5 text-[10px] ${config.color}`}>
                        {config.label}
                    </Badge>
                    <span className="text-zinc-600 text-[11px] whitespace-nowrap">
                        {date.toLocaleDateString()}
                    </span>
                </div>

                {/* Chevron */}
                <ChevronDown
                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Konten detail saat dibuka */}
            {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-zinc-800/40 animate-in fade-in slide-in-from-top-1 duration-200">
                    {project.description && (
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3 max-w-2xl">
                            {project.description}
                        </p>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2">
                        {/* Grid detail */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 lg:pr-8">
                            <DetailItem
                                icon={<User className="w-3.5 h-3.5" />}
                                label="Client ID"
                                value={project.userId}
                                copyable
                            />
                            <DetailItem
                                icon={<FileText className="w-3.5 h-3.5" />}
                                label="Invoice ID"
                                value={project.invoiceId || undefined}
                                placeholder="No Invoice"
                                copyable
                            />
                            <DetailItem
                                icon={<Calendar className="w-3.5 h-3.5" />}
                                label="Created"
                                value={date.toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            />
                        </div>

                        {/* Tombol aksi */}
                        <div className="flex justify-start lg:justify-end shrink-0 pt-2 lg:pt-0">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 px-4 text-xs border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-400 gap-2 w-full lg:w-auto"
                            >
                                <Link href={`/admin/pm/${project.id}`}>
                                    <Settings2 className="w-3.5 h-3.5" />
                                    Manage Project
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Main Component
// ============================================

interface ProjectAccordionListProps {
    data: ExtendedProject[];
    totalCount: number;
    query?: string;
    status?: string;
}

/**
 * Daftar proyek berbasis accordion untuk Mission Board.
 * Menggunakan hook `useProjectPagination` dan komponen shared
 * `AdminEmptyState`, `AdminLoadMoreButton`, dan `DetailItem`.
 */
export function ProjectAccordionList({
    data: initialData,
    totalCount,
    query,
    status,
}: ProjectAccordionListProps) {
    const { data, hasMore, isLoading, loadMore } = useProjectPagination({
        initialData,
        totalCount,
        query,
        status,
    });

    return (
        <div className="w-full space-y-2">
            {data.length > 0 ? (
                data.map((project) => (
                    <ProjectAccordionItem key={project.id} project={project} />
                ))
            ) : (
                <AdminEmptyState title="Tidak ada proyek ditemukan." />
            )}

            {hasMore && (
                <AdminLoadMoreButton isLoading={isLoading} onClick={loadMore} />
            )}
        </div>
    );
}
