"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createService } from "@/app/actions/services";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
import { DynamicListInput } from "@/components/ui/dynamic-list-input";
import { DynamicAddonInput } from "@/components/ui/dynamic-addon-input";
import { Button } from "@/components/ui/button";
import { FileText, ListChecks, CreditCard, Link as LinkIcon } from "lucide-react";
import { slugify } from "@/lib/shared/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, Sparkles, Loader2, ArrowLeft, Package, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { ServiceData } from "./edit-service-form";

interface ServiceAddonDraft {
    name: string;
    name_id: string;
    price: number;
    interval: "one_time" | "monthly" | "yearly";
    currency: "USD" | "IDR";
}

interface DraftServiceData extends Partial<ServiceData> {
    recommended_price?: number;
    original_price?: number | null;
}

// Tipe step untuk multi-step magic draft popover
// input = textarea prompt, step2 = apply harga, step3 = apply add-ons
type DraftStep = 'input' | 'step2' | 'step3';

export function CreateServiceForm() {
    const router = useRouter();
    const t = useTranslations("Service");
    const tAdmin = useTranslations("Admin.Services");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State AI Generation
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [draftStep, setDraftStep] = useState<DraftStep>('input');
    const [pendingDraft, setPendingDraft] = useState<DraftServiceData | null>(null);
    const [generatedData, setGeneratedData] = useState<DraftServiceData | null>(null);

    // 3 key terpisah agar force-remount hanya field yang relevan per step
    const [keyContent, setKeyContent] = useState(0);
    const [keyPricing, setKeyPricing] = useState(0);
    const [keyAddons, setKeyAddons] = useState(0);

    const [slug, setSlug] = useState("");
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [priceType, setPriceType] = useState<string>(generatedData?.priceType || "FIXED");
    const [interval, setInterval] = useState<string>(generatedData?.interval || "one_time");

    const handlePriceTypeChange = (value: string) => {
        setPriceType(value);
    };

    // Generate AI: apply judul/deskripsi/fitur langsung ke form, lalu pindah ke step2
    async function handleGenerate() {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch("/api/genkit/generate-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: prompt })
            });
            const result = await res.json();

            if (result.success && result.data) {
                const rawAddons = result.data.addons || [];
                const formattedAddons = rawAddons.map((addon: ServiceAddonDraft) => ({
                    name: addon.name,
                    price: addon.price,
                    interval: addon.interval,
                    currency: addon.currency
                }));
                const formattedAddonsId = rawAddons.map((addon: ServiceAddonDraft) => ({
                    name: addon.name_id || addon.name,
                    price: addon.price,
                    interval: addon.interval,
                    currency: addon.currency
                }));

                const draft = {
                    ...result.data,
                    addons: formattedAddons,
                    addons_id: formattedAddonsId
                };

                // Simpan semua data ke pendingDraft
                setPendingDraft(draft);

                // Langsung apply judul, deskripsi, dan fitur ke form
                setGeneratedData(prev => ({
                    ...prev,
                    title: draft.title,
                    title_id: draft.title_id,
                    description: draft.description,
                    description_id: draft.description_id,
                    features: draft.features,
                    features_id: draft.features_id,
                }));
                if (draft.slug) setSlug(draft.slug as string);
                setKeyContent(prev => prev + 1);

                // Langsung ke step 2 (harga)
                setDraftStep('step2');
            } else {
                toast.error(result.error || tAdmin("aiFail"));
            }
        } catch (error) {
            console.error("AI Generation error:", error);
            toast.error(tAdmin("aiError"));
        } finally {
            setIsGenerating(false);
        }
    }

    // Step 2: apply harga & konfigurasi ke form
    function applyStep2() {
        if (!pendingDraft) return;
        setGeneratedData(prev => ({
            ...prev,
            recommended_price: pendingDraft.recommended_price,
            discount: pendingDraft.discount,
            currency: pendingDraft.currency,
            priceType: pendingDraft.priceType,
            interval: pendingDraft.interval,
        }));
        if (pendingDraft.priceType) setPriceType(pendingDraft.priceType as string);
        if (pendingDraft.interval) setInterval(pendingDraft.interval as string);
        setKeyPricing(prev => prev + 1);
        setDraftStep('step3');
    }

    // Step 3: apply add-ons ke form
    function applyStep3() {
        if (!pendingDraft) return;
        setGeneratedData(prev => ({
            ...prev,
            addons: pendingDraft.addons,
            addons_id: pendingDraft.addons_id,
            currency: pendingDraft.currency,
        }));
        setKeyAddons(prev => prev + 1);
        setDraftStep('input');
        setPendingDraft(null);
        toast.success(tAdmin("aiDraftedSuccess"));
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const title_id = formData.get("title_id") as string;
        const description_id = formData.get("description_id") as string;

        if (!title || !description || !title_id || !description_id) {
            console.error("Validation failed. Missing fields:", { title, description, title_id, description_id });
            toast.error(tAdmin("validationError"));
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createService(formData);

            if (result.error) {
                throw new Error(result.error);
            }

            toast.success(tAdmin("publishSuccess"));
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error("SERVICE CREATE ERROR:", error);
            toast.error(error instanceof Error ? error.message : "Failed to publish service");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">{tAdmin("management")}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Package className="w-6 h-6 text-blue-500" />
                            {tAdmin("createNew")}
                        </h1>

                        {/* AI Assistant Popover - Multi-step Magic Draft */}
                        <Popover onOpenChange={(open) => { if (!open) { setDraftStep('input'); } }}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                    <span className="text-xs font-semibold">{tAdmin("aiAssistant")}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[calc(100vw-2rem)] sm:w-80 p-0 border-indigo-500/20 bg-zinc-900 shadow-2xl shadow-indigo-500/20"
                                align="end"
                                sideOffset={8}
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-white/5 bg-indigo-500/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <h4 className="font-semibold text-white text-sm">{tAdmin("magicDraft")}</h4>
                                    </div>
                                    <p className="text-[10px] text-indigo-300/80">
                                        {draftStep === 'input' && tAdmin("magicDraftDesc")}
                                        {draftStep === 'step2' && 'Step 2/3 — Harga & Konfigurasi'}
                                        {draftStep === 'step3' && 'Step 3/3 — Add-ons'}
                                    </p>
                                    {/* Step progress bar */}
                                    {draftStep !== 'input' && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className="h-1 flex-1 rounded-full bg-indigo-600" />
                                            <div className={`h-1 flex-1 rounded-full transition-all ${draftStep === 'step2' ? 'bg-indigo-400' : 'bg-indigo-600'}`} />
                                            <div className={`h-1 flex-1 rounded-full transition-all ${draftStep === 'step3' ? 'bg-indigo-400' : 'bg-white/10'}`} />
                                        </div>
                                    )}
                                </div>

                                {/* Step 1: Input prompt + Generate */}
                                {draftStep === 'input' && (
                                    <div className="p-4 space-y-4">
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
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 h-9 transition-all active:scale-95"
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
                                )}

                                {/* Step 2: Apply Harga */}
                                {draftStep === 'step2' && pendingDraft && (
                                    <div className="p-4 space-y-3">
                                        <div className="rounded-lg bg-white/5 border border-white/5 p-3 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Harga</p>
                                                <p className="text-sm text-white font-semibold">
                                                    {pendingDraft.currency} {Number(pendingDraft.recommended_price).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Diskon</p>
                                                <p className="text-sm text-white font-semibold">{pendingDraft.discount as number}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Tipe</p>
                                                <p className="text-xs text-zinc-300">{pendingDraft.priceType as string}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Interval</p>
                                                <p className="text-xs text-zinc-300">{pendingDraft.interval as string}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setDraftStep('input')} className="flex-1 text-xs text-zinc-500 hover:text-white h-8">
                                                ← Ulang
                                            </Button>
                                            <Button type="button" onClick={applyStep2} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs">
                                                Terapkan Harga →
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Apply Add-ons */}
                                {draftStep === 'step3' && pendingDraft && (
                                    <div className="p-4 space-y-3">
                                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                            {(pendingDraft.addons as ServiceAddonDraft[] || []).map((addon, i) => (
                                                <div key={i} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-white/5 last:border-0">
                                                    <span className="text-zinc-300 leading-snug truncate">{addon.name}</span>
                                                    <span className="text-indigo-400 font-medium whitespace-nowrap">
                                                        {addon.currency} {Number(addon.price).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setDraftStep('step2')} className="flex-1 text-xs text-zinc-500 hover:text-white h-8">
                                                ← Back
                                            </Button>
                                            <Button type="button" onClick={applyStep3} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs">
                                                Terapkan Add-ons ✓
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                    <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
                        {tAdmin("pageDescCreate")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/pm/services">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t("cancel")}
                        </Button>
                    </Link>
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                {/* Left Column: Primary Information (2/3 width) */}
                <div className="lg:col-span-2 space-y-6" key={`content-${keyContent}`}>



                    <Tabs defaultValue="en" className="w-full">
                        <TabsList className="bg-zinc-900/40 border border-white/5 mb-4">
                            <TabsTrigger value="en">{tAdmin("enDefault")}</TabsTrigger>
                            <TabsTrigger value="id">{tAdmin("idBahasa")}</TabsTrigger>
                        </TabsList>

                        {/* ENGLISH CONTENT */}
                        <TabsContent value="en" forceMount className="space-y-12 data-[state=inactive]:hidden">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <h3 className="text-sm font-semibold text-white">{tAdmin("genInfoEn")}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("serviceTitle")}</label>
                                        <Input
                                            name="title"
                                            defaultValue={generatedData?.title ?? undefined}
                                            placeholder={tAdmin("titlePlaceholderEn")}
                                            required
                                            onChange={(e) => {
                                                if (!isCustomSlug) {
                                                    setSlug(slugify(e.target.value));
                                                }
                                            }}
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("urlSlug")}</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Input
                                                    name="slug"
                                                    value={slug}
                                                    onChange={(e) => {
                                                        setSlug(slugify(e.target.value));
                                                        setIsCustomSlug(true);
                                                    }}
                                                    placeholder={tAdmin("slugPlaceholder")}
                                                    className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20 h-10 pl-9"
                                                />
                                                <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                                            </div>
                                            {isCustomSlug && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsCustomSlug(false)}
                                                    className="text-[10px] text-zinc-500 hover:text-white"
                                                >
                                                    Reset
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 italic">{tAdmin("urlWillBe")}{slug || "..."}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("description")}</label>
                                        <RichTextEditorClient
                                            name="description"
                                            defaultValue={generatedData?.description ?? undefined}
                                            placeholder={tAdmin("descPlaceholderEn")}
                                            required
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                    <ListChecks className="w-4 h-4 text-emerald-400" />
                                    <h3 className="text-sm font-semibold text-white">{tAdmin("deliverablesEn")}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("featureList")}</label>
                                        <DynamicListInput
                                            name="features"
                                            defaultValue={generatedData?.features || []}
                                            placeholder={tAdmin("featurePlaceholderEn")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                    <Plus className="w-4 h-4 text-purple-400" />
                                    <h3 className="text-sm font-semibold text-white">Add-ons (Optional)</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Available Add-ons</label>
                                        <DynamicAddonInput
                                            key={`addons-${keyAddons}`}
                                            name="addons"
                                            defaultValue={generatedData?.addons || []}
                                            currency={generatedData?.currency || "USD"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* INDONESIAN CONTENT */}
                        <TabsContent value="id" forceMount className="space-y-12 data-[state=inactive]:hidden">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                    <Flag className="w-4 h-4 text-red-500" />
                                    <h3 className="text-sm font-semibold text-white">{tAdmin("genInfoId")}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("serviceTitle")}</label>
                                        <Input
                                            name="title_id"
                                            defaultValue={generatedData?.title_id ?? undefined}
                                            placeholder={tAdmin("titlePlaceholderId")}
                                            required
                                            className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-red-500/20 h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("description")}</label>
                                        <RichTextEditorClient
                                            name="description_id"
                                            defaultValue={generatedData?.description_id ?? undefined}
                                            placeholder={tAdmin("descPlaceholderId")}
                                            required
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                    <ListChecks className="w-4 h-4 text-emerald-400" />
                                    <h3 className="text-sm font-semibold text-white">{tAdmin("deliverablesId")}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("featureList")}</label>
                                        <DynamicListInput
                                            name="features_id"
                                            defaultValue={generatedData?.features_id || []}
                                            placeholder={tAdmin("featurePlaceholderId")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                    <Plus className="w-4 h-4 text-purple-400" />
                                    <h3 className="text-sm font-semibold text-white">Add-ons (Opsional)</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Add-on Tersedia</label>
                                        <DynamicAddonInput
                                            key={`addons-id-${keyAddons}`}
                                            name="addons_id"
                                            defaultValue={generatedData?.addons_id || []}
                                            currency={generatedData?.currency || "USD"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Configuration & Actions (1/3 width) */}
                <div className="lg:col-span-1" key={`pricing-${keyPricing}`}>
                    <div className="sticky top-8 space-y-6">


                        <div className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-violet-400" />
                                <h3 className="text-sm font-semibold text-white">{tAdmin("pricingConfig")}</h3>
                            </div>
                            <div className="p-6 space-y-6">

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("visibility")}</label>
                                    <Select name="visibility" defaultValue="PUBLIC">
                                        <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PUBLIC">{tAdmin("public")}</SelectItem>
                                            <SelectItem value="PRIVATE">{tAdmin("private")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("priceType")}</label>
                                    <Select name="priceType" value={priceType} onValueChange={handlePriceTypeChange}>
                                        <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIXED">{t("fixedPrice")}</SelectItem>
                                            <SelectItem value="STARTING_AT">{t("startingAt")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("price")}</label>
                                    <div className="flex gap-2">
                                        <Select name="currency" defaultValue={generatedData?.currency || "USD"}>
                                            <SelectTrigger className="w-[100px] bg-black/20 border-white/10 text-zinc-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            defaultValue={generatedData?.recommended_price ?? undefined}
                                            placeholder="0.00"
                                            required
                                            className="flex-1 bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 text-lg font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("originalPrice")}</label>
                                    <Input
                                        name="discount"
                                        type="number"
                                        min="0"
                                        max="99"
                                        step="1"
                                        defaultValue={generatedData?.discount ?? 0}
                                        placeholder="0"
                                        className="w-full bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-violet-500/20 text-sm font-semibold"
                                    />
                                    <span className="text-[10px] text-zinc-500 block leading-normal">
                                        {tAdmin("originalPriceHelp")}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("billingInterval")}</label>
                                    <Select
                                        name="interval"
                                        value={interval}
                                        onValueChange={setInterval}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one_time">{t("oneTime")}</SelectItem>
                                            <SelectItem value="monthly">{tAdmin("monthlySub")}</SelectItem>
                                            <SelectItem value="yearly">{tAdmin("yearlySub")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="interval" value={interval} />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-zinc-900/60 border-t border-white/5">
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? tAdmin("publishing") : tAdmin("publishService")}
                                </Button>
                                <p className="text-[10px] text-center text-zinc-600 mt-3">
                                    {tAdmin("publishNotice")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
