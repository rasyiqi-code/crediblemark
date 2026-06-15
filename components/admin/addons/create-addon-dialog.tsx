"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { createAddon } from "@/app/actions/addons";
import { generateSingleAddonAction } from "@/app/actions/genkit";
import { useRouter } from "next/navigation";

export function CreateAddonDialog() {
    const t = useTranslations("Admin.Addons");
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [nameId, setNameId] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState<"USD" | "IDR">("IDR");
    const [interval, setIntervalVal] = useState<"one_time" | "monthly" | "yearly">("one_time");
    const [isActive, setIsActive] = useState(true);

    const nameRef = useRef<HTMLInputElement>(null);

    const handleGenerateAI = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Masukkan nama addon bahasa Inggris terlebih dahulu untuk panduan AI");
            return;
        }

        setIsGeneratingAI(true);
        try {
            const result = await generateSingleAddonAction({
                prompt: trimmedName,
                currency,
                isEn: true,
            });

            if (result.success && result.data) {
                const generated = result.data;
                setName(generated.name);
                setPrice(generated.price.toString());
                setIntervalVal(generated.interval);
                setCurrency(generated.currency);
                
                // Minta AI terjemahkan nama ke ID secara cerdas di sisi frontend
                setNameId(generated.name); 
                toast.success("Rekomendasi harga & interval berhasil dibuat oleh AI!");
            } else {
                toast.error(result.error || "Gagal membuat rekomendasi addon.");
            }
        } catch (error) {
            console.error("AI Single Addon Generation error:", error);
            toast.error("Terjadi kesalahan saat memproses rekomendasi AI.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !nameId.trim() || !price) {
            toast.error("Harap isi semua kolom wajib");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("name_id", nameId.trim());
            formData.append("price", price);
            formData.append("currency", currency);
            formData.append("interval", interval);
            formData.append("isActive", isActive.toString());

            const res = await createAddon(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(t("saveSuccess"));
                setOpen(false);
                // Reset form
                setName("");
                setNameId("");
                setPrice("");
                setCurrency("IDR");
                setIntervalVal("one_time");
                setIsActive(true);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to create addon:", error);
            toast.error("Gagal menyimpan addon baru");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-9 h-9 sm:w-auto bg-white text-black hover:bg-zinc-200 text-xs font-bold p-0 sm:px-3 flex items-center justify-center rounded-lg transition-all">
                    <Plus className="w-4 h-4 mr-0 sm:mr-1.5 shrink-0" />
                    <span className="hidden sm:inline">{t("createNew")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                        <span>{t("createNew")}</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Tambahkan addon baru ke dalam pool global. Addon ini akan langsung tersedia untuk semua layanan.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs text-zinc-400 uppercase tracking-wider">{t("name")} (EN)</Label>
                        <div className="relative">
                            <Input
                                id="name"
                                ref={nameRef}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Dedicated VPS hosting"
                                required
                                className="bg-black/40 border-zinc-850 text-zinc-200 focus-visible:ring-indigo-500/20 pr-10 h-10 text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={isGeneratingAI || !name.trim()}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-indigo-400 disabled:opacity-40 transition-colors"
                                title="Gunakan AI untuk rekomendasi harga & interval"
                            >
                                {isGeneratingAI ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name_id" className="text-xs text-zinc-400 uppercase tracking-wider">{t("nameId")} (ID)</Label>
                        <Input
                            id="name_id"
                            value={nameId}
                            onChange={(e) => setNameId(e.target.value)}
                            placeholder="Contoh: VPS Hosting Dedicated"
                            required
                            className="bg-black/40 border-zinc-850 text-zinc-200 focus-visible:ring-indigo-500/20 h-10 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-xs text-zinc-400 uppercase tracking-wider">{t("price")}</Label>
                            <div className="flex gap-2">
                                <Select value={currency} onValueChange={(val: "USD" | "IDR") => setCurrency(val)}>
                                    <SelectTrigger className="w-[85px] bg-black/40 border-zinc-850 text-zinc-200 h-10 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <SelectItem value="USD" className="text-xs">USD ($)</SelectItem>
                                        <SelectItem value="IDR" className="text-xs">IDR (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="flex-1 bg-black/40 border-zinc-850 text-zinc-200 focus-visible:ring-indigo-500/20 h-10 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interval" className="text-xs text-zinc-400 uppercase tracking-wider">{t("interval")}</Label>
                            <Select value={interval} onValueChange={(val: "one_time" | "monthly" | "yearly") => setIntervalVal(val)}>
                                <SelectTrigger className="w-full bg-black/40 border-zinc-850 text-zinc-200 h-10 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                    <SelectItem value="one_time" className="text-xs">{t("oneTime")}</SelectItem>
                                    <SelectItem value="monthly" className="text-xs">{t("monthly")}</SelectItem>
                                    <SelectItem value="yearly" className="text-xs">{t("yearly")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-850 pt-4 mt-2">
                        <div className="flex flex-col space-y-0.5">
                            <Label htmlFor="isActive" className="text-xs text-zinc-400 uppercase tracking-wider">{t("isActive")}</Label>
                            <span className="text-[10px] text-zinc-500">Tentukan apakah addon ini langsung aktif dan bisa dipesan.</span>
                        </div>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                    </div>

                    <DialogFooter className="border-t border-zinc-850 pt-4 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {t("createAddon")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
