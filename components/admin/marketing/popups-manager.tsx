"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
    Plus, Trash2, Settings2, LayoutTemplate,
    Globe, Navigation, Clock, MousePointer2, Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getPopUpsAction, createPopUpAction, updatePopUpAction, deletePopUpAction, togglePopUpStatusAction } from "@/app/actions/marketing-admin";
import { PopupFormDialog, type PopUp } from "./popup-form-dialog";

export function PopUpsManager() {
    const [popups, setPopups] = useState<PopUp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingPopup, setEditingPopup] = useState<Partial<PopUp> | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadPopUps();
    }, []);

    const loadPopUps = async () => {
        try {
            const result = await getPopUpsAction();
            if (!result.success) throw new Error(result.error);
            setPopups(result.data as PopUp[]);
        } catch {
            toast.error("Gagal memuat popups");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
        const payload = {
            headline: raw.headline,
            headline_id: raw.headline_id || undefined,
            description: raw.description,
            description_id: raw.description_id || undefined,
            ctaText: raw.ctaText || undefined,
            ctaText_id: raw.ctaText_id || undefined,
            ctaUrl: raw.ctaUrl || undefined,
            couponCode: raw.couponCode || undefined,
            formHeadline: raw.formHeadline || undefined,
            formHeadline_id: raw.formHeadline_id || undefined,
            delay: parseInt(raw.delay) || 0,
            isActive: raw.isActive === 'on',
            showFormLead: raw.showFormLead === 'on',
            targetingPaths: raw.targetingPaths.split(',').map(p => p.trim()).filter(Boolean),
            targetingLocales: raw.targetingLocales.split(',').map(l => l.trim()).filter(Boolean),
        };

        try {
            const result = editingPopup?.id
                ? await updatePopUpAction(editingPopup.id, payload)
                : await createPopUpAction(payload);

            if (!result.success) throw new Error(result.error);

            toast.success("PopUp berhasil disimpan");
            setIsOpen(false);
            setEditingPopup(null);
            loadPopUps();
        } catch {
            toast.error("Gagal menyimpan PopUp");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus PopUp ini?")) return;
        setDeletingId(id);
        try {
            const result = await deletePopUpAction(id);
            if (!result.success) {
                if (result.error?.includes("P2025")) {
                    toast.success("PopUp sudah dihapus");
                } else {
                    throw new Error(result.error);
                }
            } else {
                toast.success("PopUp berhasil dihapus");
            }
            loadPopUps();
        } catch {
            toast.error("Gagal menghapus PopUp");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const result = await togglePopUpStatusAction(id, !isActive);
            if (!result.success) throw new Error(result.error);
            loadPopUps();
        } catch {
            toast.error("Gagal mengubah status");
        }
    };

    return (
        <div className="grid gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <LayoutTemplate className="w-5 h-5 text-brand-yellow" />
                        PopUps
                    </h2>
                    <p className="text-zinc-500 text-xs font-medium">Manage promotional modals.</p>
                </div>
                <Button
                    onClick={() => { setEditingPopup(null); setIsOpen(true); }}
                    className="bg-brand-yellow text-black hover:bg-white font-black uppercase text-[10px] tracking-widest px-4 h-9 rounded-xl transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create PopUp
                </Button>
                <PopupFormDialog
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    editingPopup={editingPopup}
                    onSubmit={handleSubmit}
                />
            </div>

            <div className="overflow-hidden overflow-x-auto custom-scrollbar pt-4 border-t border-white/5">
                <Table className="min-w-[800px]">
                    <TableHeader className="bg-zinc-950/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-xs h-12 pl-6">Popup Info</TableHead>
                            <TableHead className="text-xs h-12">Targeting</TableHead>
                            <TableHead className="text-xs h-12">Engagement</TableHead>
                            <TableHead className="text-xs h-12">Status</TableHead>
                            <TableHead className="text-right text-xs h-12 pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-zinc-500 text-sm italic">Syncing PopUps...</TableCell>
                            </TableRow>
                        ) : popups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <LayoutTemplate className="w-8 h-8 mx-auto mb-3 opacity-10" />
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-600">No PopUps Configured</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            popups.map((popup) => (
                                <TableRow key={popup.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-6 py-5">
                                        <div className="space-y-1">
                                            <div className="font-bold text-white text-sm uppercase tracking-tight">{popup.headline}</div>
                                            <div className="text-[10px] text-zinc-500 line-clamp-1 max-w-[300px] italic">&quot;{popup.description}&quot;</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <Globe className="w-3 h-3 text-zinc-600 shrink-0" />
                                                <div className="flex gap-1">
                                                    {popup.targetingLocales.length > 0 ? (
                                                        popup.targetingLocales.map(l => (
                                                            <Badge key={l} variant="outline" className="text-[8px] bg-zinc-800 border-white/5 h-4 px-1">{l}</Badge>
                                                        ))
                                                    ) : <span className="text-[9px] text-zinc-600 font-bold uppercase">All Locales</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Navigation className="w-3 h-3 text-zinc-600 shrink-0" />
                                                <div className="text-[9px] text-zinc-500 font-bold truncate max-w-[150px]">
                                                    {popup.targetingPaths.length > 0 ? popup.targetingPaths.join(', ') : 'All Paths'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                                                <Clock className="w-3 h-3 text-brand-yellow/50" />
                                                {popup.delay}s Delay
                                            </div>
                                            {popup.ctaText && (
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                                                    <MousePointer2 className="w-3 h-3 text-brand-yellow/50" />
                                                    {popup.ctaText}
                                                </div>
                                            )}
                                            {popup.couponCode && (
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                                                    <Tag className="w-3 h-3 text-brand-yellow/50" />
                                                    Coupon: {popup.couponCode}
                                                </div>
                                            )}
                                            {popup.showFormLead && (
                                                <Badge className="w-fit text-[8px] bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20 font-black h-4 px-1.5 uppercase tracking-tighter">Form Lead</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={popup.isActive}
                                                onCheckedChange={() => handleToggle(popup.id, popup.isActive)}
                                            />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${popup.isActive ? "text-green-500" : "text-zinc-600"}`}>
                                                {popup.isActive ? "Active" : "Paused"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-9 w-9 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl"
                                                onClick={() => {
                                                    setEditingPopup(popup);
                                                    setIsOpen(true);
                                                }}
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                disabled={deletingId === popup.id}
                                                className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl disabled:opacity-50"
                                                onClick={() => handleDelete(popup.id)}
                                            >
                                                <Trash2 className={`w-4 h-4 ${deletingId === popup.id ? 'animate-pulse' : ''}`} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
