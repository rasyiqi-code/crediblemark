"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AiDraftSectionProps {
    prompt: string;
    setPrompt: (value: string) => void;
    businessScale: string;
    setBusinessScale: (value: string) => void;
    handleGenerate: () => Promise<void>;
    isGenerating: boolean;
}

export function AiDraftSection({
    prompt,
    setPrompt,
    businessScale,
    setBusinessScale,
    handleGenerate,
    isGenerating
}: AiDraftSectionProps) {
    const tAdmin = useTranslations("Admin.Services");

    return (
        <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">AI Magic Draft</h3>
            </div>
            <p className="text-xs text-indigo-300/80 leading-normal">
                {tAdmin("magicDraftDesc")}
            </p>
            <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-indigo-300 uppercase tracking-wider">
                        Skala Bisnis Target (Target Business Scale)
                    </label>
                    <Select value={businessScale} onValueChange={setBusinessScale}>
                        <SelectTrigger className="bg-black/40 border-indigo-500/20 text-zinc-300 focus:ring-indigo-500/40 text-xs h-9">
                            <SelectValue placeholder="Pilih Skala Bisnis" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                            <SelectItem value="AUTO">Deteksi Otomatis (Insting AI)</SelectItem>
                            <SelectItem value="ULTRA_MICRO">Ultra Mikro (UMi) - Rp 1.45jt - Rp 2.45jt</SelectItem>
                            <SelectItem value="MICRO">Mikro - Rp 2.45jt - Rp 3.95jt</SelectItem>
                            <SelectItem value="SMALL">Kecil - Rp 3.95jt - Rp 9.95jt</SelectItem>
                            <SelectItem value="MEDIUM">Menengah (SME) - Rp 9.95jt - Rp 24.95jt</SelectItem>
                            <SelectItem value="ENTERPRISE">Besar (Enterprise) - Rp 24.95jt - Rp 49.99jt+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={tAdmin("promptPlaceholder")}
                    className="bg-black/40 border-indigo-500/20 text-zinc-200 focus:ring-indigo-500/40 min-h-[100px] text-xs resize-none"
                />
                <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 h-10 transition-all active:scale-95 text-xs font-semibold"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {tAdmin("crafting")}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {tAdmin("autoFill")}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
