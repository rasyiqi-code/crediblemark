"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Globe, FormInput } from "lucide-react";

// Re-export tipe agar bisa digunakan di popups-manager tanpa duplikasi
export interface PopUp {
    id: string;
    headline: string;
    headline_id: string | null;
    description: string;
    description_id: string | null;
    ctaText: string | null;
    ctaText_id: string | null;
    ctaUrl: string | null;
    isActive: boolean;
    targetingType: string;
    targetingPaths: string[];
    targetingLocales: string[];
    showFormLead: boolean;
    formHeadline: string | null;
    formHeadline_id: string | null;
    delay: number;
    couponCode: string | null;
    createdAt: string | Date;
}

interface PopupFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingPopup: Partial<PopUp> | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Dialog form untuk membuat atau mengedit PopUp.
 * Diekstrak dari `popups-manager.tsx` agar konsisten dengan pola komponen marketing lainnya.
 * Mendukung mode bilingual (EN/ID toggle).
 */
export function PopupFormDialog({ isOpen, onOpenChange, editingPopup, onSubmit }: PopupFormDialogProps) {
    const [isMultiLang, setIsMultiLang] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-white/5 text-white max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                        {editingPopup ? "Edit PopUp" : "Create New PopUp"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Configure your promotional popup settings and targeting rules.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6 pt-4">
                    {/* Toggle bilingual */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <Globe className="w-3 h-3 text-brand-yellow" />
                                Multi-language Mode
                            </Label>
                            <p className="text-[10px] text-zinc-500">Enable translation fields for English and Indonesian.</p>
                        </div>
                        <Switch checked={isMultiLang} onCheckedChange={setIsMultiLang} />
                    </div>

                    {/* Headline */}
                    <div className={`grid ${isMultiLang ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Headline {isMultiLang && "(EN)"}</Label>
                            <Input name="headline" defaultValue={editingPopup?.headline} required className="bg-white/5 border-white/10" />
                        </div>
                        {isMultiLang && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Headline (ID)</Label>
                                <Input name="headline_id" defaultValue={editingPopup?.headline_id || ""} className="bg-white/5 border-white/10" />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className={`grid ${isMultiLang ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description {isMultiLang && "(EN)"}</Label>
                            <Textarea name="description" defaultValue={editingPopup?.description} required className="bg-white/5 border-white/10 min-h-[80px]" />
                        </div>
                        {isMultiLang && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (ID)</Label>
                                <Textarea name="description_id" defaultValue={editingPopup?.description_id || ""} className="bg-white/5 border-white/10 min-h-[80px]" />
                            </div>
                        )}
                    </div>

                    {/* CTA Text */}
                    <div className={`grid ${isMultiLang ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CTA Text {isMultiLang && "(EN)"}</Label>
                            <Input name="ctaText" defaultValue={editingPopup?.ctaText || ""} className="bg-white/5 border-white/10" />
                        </div>
                        {isMultiLang && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CTA Text (ID)</Label>
                                <Input name="ctaText_id" defaultValue={editingPopup?.ctaText_id || ""} className="bg-white/5 border-white/10" />
                            </div>
                        )}
                    </div>

                    {/* CTA URL + Coupon */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CTA URL</Label>
                            <Input name="ctaUrl" defaultValue={editingPopup?.ctaUrl || ""} placeholder="https://..." className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Coupon Code (Optional)</Label>
                            <Input name="couponCode" defaultValue={editingPopup?.couponCode || ""} placeholder="SAVE50" className="bg-white/5 border-white/10 font-mono tracking-widest" />
                        </div>
                    </div>

                    {/* Lead Form Section */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                    <FormInput className="w-3 h-3 text-brand-yellow" />
                                    Enable Lead Form
                                </Label>
                                <p className="text-[10px] text-zinc-500">Allow users to record their name and email directly.</p>
                            </div>
                            <Switch name="showFormLead" defaultChecked={editingPopup?.showFormLead} />
                        </div>
                        <div className={`grid ${isMultiLang ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Form Headline {isMultiLang && "(EN)"}</Label>
                                <Input name="formHeadline" defaultValue={editingPopup?.formHeadline || ""} placeholder="Join our waitlist" className="bg-white/5 border-white/10" />
                            </div>
                            {isMultiLang && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Form Headline (ID)</Label>
                                    <Input name="formHeadline_id" defaultValue={editingPopup?.formHeadline_id || ""} placeholder="Bergabung ke daftar tunggu" className="bg-white/5 border-white/10" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Delay (Seconds)</Label>
                            <Input type="number" name="delay" defaultValue={editingPopup?.delay ?? 3} className="bg-white/5 border-white/10" />
                        </div>
                    </div>

                    {/* Targeting Rules */}
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            Targeting Rules
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Paths (Comma separated)</Label>
                                <Input name="targetingPaths" defaultValue={editingPopup?.targetingPaths?.join(", ") || ""} placeholder="/portfolio, /services" className="bg-black/50 border-white/5" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Locales (Comma separated)</Label>
                                <Input name="targetingLocales" defaultValue={editingPopup?.targetingLocales?.join(", ") || ""} placeholder="id, en" className="bg-black/50 border-white/5" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Switch name="isActive" defaultChecked={editingPopup?.isActive ?? true} />
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Published</Label>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-white/5 text-zinc-400">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-brand-yellow text-black font-black uppercase text-[11px] tracking-widest px-8">
                                {editingPopup ? "Update PopUp" : "Create PopUp"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
