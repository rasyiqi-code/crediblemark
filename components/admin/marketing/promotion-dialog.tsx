"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updatePromotionAction, createPromotionAction } from "@/app/actions/marketing-admin";

interface Promotion {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    ctaText: string | null;
    ctaUrl: string | null;
    couponCode: string | null;
    isActive: boolean;
    startDate: string | Date | null;
    endDate: string | Date | null;
}

interface PromotionDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingPromo: Promotion | null;
    onSaveSuccess: () => void;
}

/**
 * Dialog form untuk membuat atau mengedit data promosi.
 * Diekstrak dari `promotions-manager.tsx` agar dapat dikelola secara mandiri.
 */
export function PromotionDialog({ isOpen, onOpenChange, editingPromo, onSaveSuccess }: PromotionDialogProps) {
    const titleRef       = useRef<HTMLInputElement>(null);
    const imageUrlRef    = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const ctaTextRef     = useRef<HTMLInputElement>(null);
    const ctaUrlRef      = useRef<HTMLInputElement>(null);
    const couponCodeRef  = useRef<HTMLInputElement>(null);
    const startDateRef   = useRef<HTMLInputElement>(null);
    const endDateRef     = useRef<HTMLInputElement>(null);
    const [isActive, setIsActive] = useState(editingPromo?.isActive ?? true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title:       titleRef.current?.value       || "",
            imageUrl:    imageUrlRef.current?.value    || "",
            description: descriptionRef.current?.value || "",
            ctaText:     ctaTextRef.current?.value     || "",
            ctaUrl:      ctaUrlRef.current?.value      || "",
            couponCode:  couponCodeRef.current?.value  || "",
            isActive,
            startDate: startDateRef.current?.value
                ? new Date(startDateRef.current.value).toISOString()
                : undefined,
            endDate: endDateRef.current?.value
                ? new Date(endDateRef.current.value).toISOString()
                : undefined,
        };

        try {
            if (editingPromo) {
                await updatePromotionAction(editingPromo.id, payload);
            } else {
                await createPromotionAction(payload);
            }
            toast.success(editingPromo ? "Promosi diperbarui" : "Promosi dibuat");
            onSaveSuccess();
        } catch {
            toast.error("Gagal menyimpan data");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {editingPromo ? "Edit Promosi" : "Tambah Promosi Baru"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Judul Promo</Label>
                            <Input
                                required
                                ref={titleRef}
                                defaultValue={editingPromo?.title || ""}
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                placeholder="Contoh: Diskon Lebaran 50%"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">URL Gambar Poster</Label>
                            <Input
                                required
                                ref={imageUrlRef}
                                defaultValue={editingPromo?.imageUrl || ""}
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">Deskripsi Singkat</Label>
                        <Textarea
                            ref={descriptionRef}
                            defaultValue={editingPromo?.description || ""}
                            className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 min-h-[100px] resize-none"
                            placeholder="Jelaskan detail promo..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">CTA Text (Tombol)</Label>
                            <Input
                                ref={ctaTextRef}
                                defaultValue={editingPromo?.ctaText || ""}
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                placeholder="Lihat Detail / Beli Sekarang"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">CTA URL (Tautan)</Label>
                            <Input
                                ref={ctaUrlRef}
                                defaultValue={editingPromo?.ctaUrl || ""}
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                                placeholder="/products/..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Kode Kupon</Label>
                            <Input
                                ref={couponCodeRef}
                                defaultValue={editingPromo?.couponCode || ""}
                                onBlur={(e) => { e.target.value = e.target.value.toUpperCase(); }}
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11 font-mono font-bold"
                                placeholder="PROMO2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Mulai</Label>
                            <Input
                                type="datetime-local"
                                ref={startDateRef}
                                defaultValue={
                                    editingPromo?.startDate
                                        ? new Date(editingPromo.startDate).toISOString().slice(0, 16)
                                        : ""
                                }
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Berakhir</Label>
                            <Input
                                type="datetime-local"
                                ref={endDateRef}
                                defaultValue={
                                    editingPromo?.endDate
                                        ? new Date(editingPromo.endDate).toISOString().slice(0, 16)
                                        : ""
                                }
                                className="bg-zinc-900 border-white/5 focus:border-brand-yellow/50 h-11"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/5 border border-white/5">
                        <Switch
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            className="data-[state=checked]:bg-brand-yellow"
                        />
                        <Label className="text-sm font-medium">Aktifkan Promosi Sekarang</Label>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
                            Batal
                        </Button>
                        <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold px-8 h-11">
                            {editingPromo ? "Simpan Perubahan" : "Buat Promosi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
