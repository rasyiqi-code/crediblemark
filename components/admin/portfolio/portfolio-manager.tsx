"use client";

import { useState } from "react";
import { PortfolioItem, savePortfolio, deletePortfolio } from "@/lib/portfolios/actions";
import { Button } from "@/components/ui/button";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { HtmlFileUploader } from "./html-file-uploader";
import { PortfolioCard } from "./portfolio-card";

/**
 * Komponen utama untuk mengelola portfolio: list, tambah baru, dan hapus.
 * Mendukung 2 metode input HTML: paste code (editor IDE) dan upload file.
 */
export function PortfolioManager({ initialData }: { initialData: PortfolioItem[] }) {
    const [items, setItems] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("Web App");
    const [externalUrl, setExternalUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [html, setHtml] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSlugAuto, setIsSlugAuto] = useState(true);

    // === Handler: Simpan portfolio baru ===
    async function handleSave() {
        if (!title || !slug || (!html && !externalUrl)) {
            toast.error("Please fill in title, slug, and either an external URL or HTML file.");
            return;
        }

        // Basic URL validation to prevent crashes (e.g. just "https://")
        if (externalUrl && externalUrl.length < 10 && !externalUrl.includes(".")) {
            toast.error("Please enter a valid External URL");
            return;
        }
        
        if (imageUrl && imageUrl.length < 10 && !imageUrl.includes(".")) {
            toast.error("Please enter a valid Thumbnail URL");
            return;
        }

        setIsSaving(true);
        try {
            const newItem = await savePortfolio({ title, slug, category, externalUrl, imageUrl, description }, html);
            setItems([...items, newItem]);
            setIsModalOpen(false);
            // Reset form setelah berhasil
            setTitle("");
            setSlug("");
            setCategory("Web App");
            setDescription("");
            setImageUrl("");
            setExternalUrl("");
            setHtml("");
            setIsSlugAuto(true);
            toast.success("Portfolio saved successfully");
        } catch (error) {
            const err = error as Error;
            console.error("Save error:", err);
            toast.error(err.message || "Failed to save portfolio");
        } finally {
            setIsSaving(false);
        }
    }

    // === Handler: Hapus portfolio ===
    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this portfolio item?")) return;

        try {
            await deletePortfolio(id);
            setItems(items.filter(i => i.id !== id));
            toast.success("Deleted successfully");
        } catch {
            toast.error("Failed to delete");
        }
    }

    return (
        <div className="space-y-8">
            <AdminHeaderSetter
                title="Portfolio Live Admin"
                actions={
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="font-bold transition-all duration-300 shadow-xl w-auto bg-gradient-to-br from-brand-yellow to-yellow-600 text-black hover:scale-105 active:scale-95 shadow-brand-yellow/20 text-xs sm:text-sm px-2.5 sm:px-4"
                    >
                        <Plus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Add New Project</span>
                    </Button>
                }
            />

            <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

            {/* === Modal Form Tambah Portfolio Baru === */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open);
                // Reset form saat modal ditutup
                if (!open) {
                    setTitle("");
                    setSlug("");
                    setCategory("Web App");
                    setExternalUrl("");
                    setImageUrl("");
                    setHtml("");
                    setDescription("");
                    setIsSlugAuto(true);
                }
            }}>
                <DialogContent className="max-w-4xl bg-[#09090b] border-white/[0.08] text-white p-6 gap-6 shadow-2xl rounded-[28px] overflow-hidden">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
                            <Plus className="w-5 h-5 text-brand-yellow drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" /> 
                            New Project
                        </DialogTitle>
                        <DialogDescription className="sr-only">Form tambah portfolio baru</DialogDescription>
                    </DialogHeader>

                    {/* Main Form Grid */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            {/* Row 1: Left Group (Title, Slug, URL, OG) */}
                            <div className="md:col-span-10 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-0.5 block">Title</label>
                                    <Input
                                        value={title}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setTitle(val);
                                            if (isSlugAuto) {
                                                setSlug(val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                            }
                                        }}
                                        placeholder="Project Name"
                                        className="bg-white/[0.03] border-white/10 focus:border-brand-yellow/50 h-10 text-sm rounded-xl focus:ring-4 focus:ring-brand-yellow/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-0.5 block">Slug</label>
                                    <Input
                                        value={slug}
                                        onChange={e => {
                                            setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                            setIsSlugAuto(false);
                                        }}
                                        placeholder="project-slug"
                                        className="bg-white/[0.03] border-white/10 focus:border-brand-yellow/50 h-10 font-mono text-xs rounded-xl focus:ring-4 focus:ring-brand-yellow/5 transition-all text-zinc-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-0.5 block" title="Used for Live Preview if no HTML file is uploaded">External URL (Preview)</label>
                                    <Input
                                        value={externalUrl}
                                        onChange={e => setExternalUrl(e.target.value)}
                                        placeholder="https://"
                                        className="bg-white/[0.03] border-white/10 focus:border-brand-yellow/50 h-10 text-xs font-mono rounded-xl focus:ring-4 focus:ring-brand-yellow/5 transition-all text-zinc-400 px-3"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-0.5 block" title="Overrides the Live Preview with a static image">Thumbnail Override URL</label>
                                    <Input
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        placeholder="https://"
                                        className="bg-white/[0.03] border-white/10 focus:border-brand-yellow/50 h-10 text-xs font-mono rounded-xl focus:ring-4 focus:ring-brand-yellow/5 transition-all text-zinc-400 px-3"
                                    />
                                </div>
                            </div>

                            {/* Industry & Action Button */}
                            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-3 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-0.5 block">Industry</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 focus:border-brand-yellow/50 h-10 text-sm rounded-xl px-3 text-white appearance-none cursor-pointer focus:ring-4 focus:ring-brand-yellow/5 transition-all"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 15 5 5 5-5'/%3E%3Cpath d='m7 9 5-5 5 5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                                    >
                                        <option value="" className="bg-zinc-950 text-zinc-400">Pilih...</option>
                                        <option value="Web App" className="bg-zinc-950">Web App</option>
                                        <option value="GitHub Repo" className="bg-zinc-950">GitHub Repo</option>
                                        <option value="Android App" className="bg-zinc-950">Android App</option>
                                        <option value="Desktop App" className="bg-zinc-950">Desktop App</option>
                                        <option value="Landing Page" className="bg-zinc-950">Landing Page</option>
                                        <option value="Design" className="bg-zinc-950">Design</option>
                                        <option value="Corporate" className="bg-zinc-950">Corporate</option>
                                        <option value="Fintech" className="bg-zinc-950">Fintech</option>
                                        <option value="E-Commerce" className="bg-zinc-950">E-Commerce</option>
                                        <option value="SaaS" className="bg-zinc-950">SaaS</option>
                                        <option value="Healthcare" className="bg-zinc-950">Healthcare</option>
                                        <option value="Education" className="bg-zinc-950">Education</option>
                                        <option value="Real Estate" className="bg-zinc-950">Real Estate</option>
                                        <option value="F&B" className="bg-zinc-950">F&B</option>
                                        <option value="Travel" className="bg-zinc-950">Travel</option>
                                        <option value="Media" className="bg-zinc-950">Media</option>
                                        <option value="Agency" className="bg-zinc-950">Agency</option>
                                        <option value="Portfolio" className="bg-zinc-950">Portfolio</option>
                                        <option value="Creative" className="bg-zinc-950">Creative</option>
                                        <option value="Fashion" className="bg-zinc-950">Fashion</option>
                                        <option value="Technology" className="bg-zinc-950">Technology</option>
                                        <option value="Automotive" className="bg-zinc-950">Automotive</option>
                                        <option value="Lainnya" className="bg-zinc-950">Lainnya</option>
                                    </select>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-brand-yellow hover:bg-brand-yellow/90 hover:scale-[1.02] active:scale-95 text-black h-10 rounded-xl font-black transition-all text-xs uppercase tracking-[0.15em] shadow-[0_8px_20px_-6px_rgba(234,179,8,0.3)]"
                                >
                                    {isSaving ? "..." : "Launch"}
                                </Button>
                            </div>
                        </div>
                        
                        {/* Row 1.5: Description */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-0.5 block">Description</label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Briefly describe this project..."
                                className="bg-white/[0.03] border-white/10 focus:border-brand-yellow/50 min-h-[80px] text-sm rounded-xl focus:ring-4 focus:ring-brand-yellow/5 transition-all resize-none"
                            />
                        </div>

                        {/* Row 2: File Uploader */}
                        {!externalUrl ? (
                            <div className="pt-2">
                                <HtmlFileUploader onFileLoad={setHtml} currentHtml={html} compact />
                            </div>
                        ) : (
                            <div className="px-4 py-3 rounded-2xl bg-brand-yellow/[0.03] border border-brand-yellow/10 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="p-2 rounded-lg bg-brand-yellow/10">
                                    <ExternalLink className="w-4 h-4 text-brand-yellow" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs text-white font-bold">External Link Active</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">Using external URL for preview and redirect. File upload disabled.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* === Grid Portfolio Items === */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <PortfolioCard
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                    />
                ))}

                {items.length === 0 && (
                    <div className="text-center py-12 bg-zinc-900/10 border border-dashed border-white/5 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-600 text-sm">No portfolio items found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
