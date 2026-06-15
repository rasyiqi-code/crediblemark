"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { updateAddon } from "@/app/actions/addons";
import { useRouter } from "next/navigation";

export interface AddonData {
    id: string;
    name: string;
    name_id: string | null;
    price: number;
    currency: string;
    interval: string;
    isActive: boolean;
    createdAt?: string | Date;
}

interface EditAddonDialogProps {
    addon: AddonData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAddonDialog({ addon, open, onOpenChange }: EditAddonDialogProps) {
    const t = useTranslations("Admin.Addons");
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [name, setName] = useState(addon?.name || "");
    const [nameId, setNameId] = useState(addon?.name_id || "");
    const [price, setPrice] = useState(addon?.price.toString() || "");
    const [currency, setCurrency] = useState<string>(addon?.currency || "IDR");
    const [interval, setIntervalVal] = useState<string>(addon?.interval || "one_time");
    const [isActive, setIsActive] = useState(addon?.isActive ?? true);

    // Reset Form states when addon data changes
    useState(() => {
        if (addon) {
            setName(addon.name);
            setNameId(addon.name_id || "");
            setPrice(addon.price.toString());
            setCurrency(addon.currency);
            setIntervalVal(addon.interval);
            setIsActive(addon.isActive);
        }
    });

    // React state synchronization hook (karena dynamic updates)
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && addon) {
            setName(addon.name);
            setNameId(addon.name_id || "");
            setPrice(addon.price.toString());
            setCurrency(addon.currency);
            setIntervalVal(addon.interval);
            setIsActive(addon.isActive);
        }
        onOpenChange(newOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addon) return;

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

            const res = await updateAddon(addon.id, formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(t("updateSuccess"));
                onOpenChange(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update addon:", error);
            toast.error("Gagal memperbarui data addon");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-bold">
                        <span>{t("editAddon")}</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Ubah detail dan konfigurasi addon ini. Perubahan akan langsung berdampak pada halaman pesanan client.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-xs text-zinc-400 uppercase tracking-wider">{t("name")} (EN)</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Dedicated VPS hosting"
                            required
                            className="bg-black/40 border-zinc-850 text-zinc-200 focus-visible:ring-indigo-500/20 h-10 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-name_id" className="text-xs text-zinc-400 uppercase tracking-wider">{t("nameId")} (ID)</Label>
                        <Input
                            id="edit-name_id"
                            value={nameId}
                            onChange={(e) => setNameId(e.target.value)}
                            placeholder="Contoh: VPS Hosting Dedicated"
                            required
                            className="bg-black/40 border-zinc-850 text-zinc-200 focus-visible:ring-indigo-500/20 h-10 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-price" className="text-xs text-zinc-400 uppercase tracking-wider">{t("price")}</Label>
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
                                    id="edit-price"
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
                            <Label htmlFor="edit-interval" className="text-xs text-zinc-400 uppercase tracking-wider">{t("interval")}</Label>
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
                            <Label htmlFor="edit-isActive" className="text-xs text-zinc-400 uppercase tracking-wider">{t("isActive")}</Label>
                            <span className="text-[10px] text-zinc-500">Tentukan apakah addon ini aktif dan bisa dipesan.</span>
                        </div>
                        <Switch
                            id="edit-isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                    </div>

                    <DialogFooter className="border-t border-zinc-850 pt-4 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
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
                            {t("saveChanges")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
