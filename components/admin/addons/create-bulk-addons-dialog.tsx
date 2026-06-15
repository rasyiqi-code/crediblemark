"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, CheckSquare, Square, Save } from "lucide-react";
import { createAddons } from "@/app/actions/addons";

interface DraftAddon {
    name: string;
    name_id: string;
    price: number;
    currency: "USD" | "IDR";
    interval: "one_time" | "monthly" | "yearly";
}

interface CreateBulkAddonsDialogProps {
    existingAddonNames: string[];
}

export function CreateBulkAddonsDialog({ existingAddonNames }: CreateBulkAddonsDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form states
    const [prompt, setPrompt] = useState("");
    const [currency, setCurrency] = useState<"USD" | "IDR">("IDR");

    // Draft state
    const [drafts, setDrafts] = useState<DraftAddon[]>([]);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        setDrafts([]);
        setSelectedIndexes([]);
        
        try {
            const response = await fetch("/api/genkit/generate-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "bulk-addons",
                    prompt: prompt.trim(),
                    currency,
                    existingAddons: existingAddonNames,
                    count: 10
                }),
            });

            const result = await response.json();
            if (result.success && result.data?.addons) {
                const generated: DraftAddon[] = result.data.addons;
                setDrafts(generated);
                // Secara default, pilih semua draf addon hasil generate
                setSelectedIndexes(generated.map((_, idx) => idx));
                toast.success("AI berhasil membuat 10 draf addon unik!");
            } else {
                toast.error(result.error || "Gagal membuat draf addon massal.");
            }
        } catch (error) {
            console.error("AI Bulk Addon Generation error:", error);
            toast.error("Terjadi kesalahan sistem saat memproses rekomendasi AI.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectChange = (index: number, checked: boolean) => {
        if (checked) {
            setSelectedIndexes((prev) => [...prev, index]);
        } else {
            setSelectedIndexes((prev) => prev.filter((i) => i !== index));
        }
    };

    const handleToggleSelectAll = () => {
        if (selectedIndexes.length === drafts.length) {
            setSelectedIndexes([]);
        } else {
            setSelectedIndexes(drafts.map((_, idx) => idx));
        }
    };

    const handleSaveSelected = () => {
        if (selectedIndexes.length === 0) {
            toast.error("Pilih minimal satu draf addon untuk disimpan");
            return;
        }

        const selectedDrafts = drafts.filter((_, idx) => selectedIndexes.includes(idx));

        startTransition(async () => {
            try {
                const res = await createAddons(selectedDrafts);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success(`${res.count} addon berhasil disimpan ke database!`);
                    setOpen(false);
                    // Reset modal state
                    setPrompt("");
                    setCurrency("IDR");
                    setDrafts([]);
                    setSelectedIndexes([]);
                    router.refresh();
                }
            } catch (error) {
                console.error("Failed to save draft addons:", error);
                toast.error("Terjadi kesalahan sistem saat menyimpan addon");
            }
        });
    };

    const allSelected = drafts.length > 0 && selectedIndexes.length === drafts.length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-auto bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-white h-9 text-xs font-bold px-3 flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm shadow-black/20 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Magic Draft</span>
                </Button>
            </DialogTrigger>
            <DialogContent className={`bg-zinc-950 border-zinc-800 text-zinc-200 transition-all duration-300 ${drafts.length > 0 ? "sm:max-w-[750px]" : "sm:max-w-[500px]"}`}>
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span>AI Magic Draft Addons</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Hasilkan 10 addon baru secara massal menggunakan kecerdasan buatan, dijamin unik dari yang sudah terdaftar.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Panel Input Prompt & Parameter */}
                    <div className="space-y-3 bg-zinc-900/40 p-4 border border-zinc-900 rounded-xl">
                        <div className="space-y-2">
                            <Label htmlFor="bulk-prompt" className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Topik / Tema Panduan (Opsional)</Label>
                            <Input
                                id="bulk-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Contoh: Optimasi web, keamanan data, SEO, integrasi AI..."
                                className="bg-black/40 border-zinc-850 text-zinc-200 focus-visible:ring-indigo-500/20 h-10 text-sm"
                                disabled={isGenerating || isPending}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bulk-currency" className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Mata Uang Target</Label>
                                <Select value={currency} onValueChange={(val: "USD" | "IDR") => setCurrency(val)} disabled={isGenerating || isPending}>
                                    <SelectTrigger className="w-full bg-black/40 border-zinc-850 text-zinc-200 h-10 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <SelectItem value="USD" className="text-xs">USD ($)</SelectItem>
                                        <SelectItem value="IDR" className="text-xs">IDR (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating || isPending}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider h-10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/15"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Menganalisis...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Generate 10 Addons</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Panel Hasil Draf Addon */}
                    {drafts.length > 0 && (
                        <div className="space-y-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                    Hasil Draf AI ({selectedIndexes.length}/{drafts.length} Terpilih)
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleSelectAll}
                                    className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider flex items-center gap-1.5 h-6 px-2 bg-zinc-900/30 hover:bg-zinc-900/80 rounded-md"
                                >
                                    {allSelected ? (
                                        <>
                                            <Square className="w-3 h-3 text-zinc-500" />
                                            <span>Deselect All</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-3 h-3 text-amber-400" />
                                            <span>Select All</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto border border-zinc-850 rounded-xl bg-zinc-950/60 divide-y divide-zinc-900 scrollbar-thin">
                                <table className="w-full text-left border-collapse text-zinc-300">
                                    <thead>
                                        <tr className="bg-zinc-900/20 border-b border-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
                                            <th className="py-2.5 px-3 w-8"></th>
                                            <th className="py-2.5 px-3">Nama Addon</th>
                                            <th className="py-2.5 px-3">Harga</th>
                                            <th className="py-2.5 px-3">Interval</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900 text-xs">
                                        {drafts.map((draft, idx) => {
                                            const isSelected = selectedIndexes.includes(idx);
                                            return (
                                                <tr
                                                    key={idx}
                                                    onClick={() => handleSelectChange(idx, !isSelected)}
                                                    className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${isSelected ? "bg-amber-500/5 hover:bg-amber-500/5" : ""}`}
                                                >
                                                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleSelectChange(idx, e.target.checked)}
                                                            className="rounded border-zinc-800 text-amber-500 focus:ring-amber-500/20 bg-black/40 w-4 h-4 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-zinc-200">{draft.name}</span>
                                                            <span className="text-[10px] text-zinc-500 italic mt-0.5">{draft.name_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 font-semibold text-zinc-200">
                                                        {draft.currency === "IDR"
                                                            ? `Rp ${draft.price.toLocaleString("id-ID")}`
                                                            : `$${draft.price.toFixed(2)}`}
                                                    </td>
                                                    <td className="py-3 px-3 uppercase text-[10px] tracking-wide text-zinc-500">
                                                        {draft.interval === "monthly"
                                                            ? "Monthly"
                                                            : draft.interval === "yearly"
                                                            ? "Yearly"
                                                            : "One-time"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-zinc-850 pt-4 gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setOpen(false);
                            setDrafts([]);
                            setSelectedIndexes([]);
                        }}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold h-9 rounded-lg"
                        disabled={isPending}
                    >
                        Tutup
                    </Button>

                    {drafts.length > 0 && (
                        <Button
                            type="button"
                            onClick={handleSaveSelected}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-4 h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                            disabled={isPending || selectedIndexes.length === 0}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>Simpan Terpilih ({selectedIndexes.length})</span>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
