"use client";

import { useState, useRef } from "react";
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
import Link from "next/link";
import { ServiceData } from "./edit-service-form";

interface DraftServiceData extends Partial<ServiceData> {
    recommended_price?: number;
    original_price?: number | null;
}

export function CreateServiceForm() {
    const router = useRouter();
    const t = useTranslations("Service");
    const tAdmin = useTranslations("Admin.Services");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Ref untuk mengakses data teraktual dari form
    const formRef = useRef<HTMLFormElement>(null);

    // State AI Generation
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPricing, setIsGeneratingPricing] = useState(false);
    const [isGeneratingAddons, setIsGeneratingAddons] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<DraftServiceData | null>(null);
    const [isPricingApplied, setIsPricingApplied] = useState(false);
    const [generatedData, setGeneratedData] = useState<DraftServiceData | null>(null);

    // 3 key terpisah agar force-remount hanya field yang relevan per step
    const [keyContent, setKeyContent] = useState(0);
    const [keyPricing, setKeyPricing] = useState(0);
    const [keyAddons, setKeyAddons] = useState(0);

    const [slug, setSlug] = useState("");
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [priceType, setPriceType] = useState<string>(generatedData?.priceType || "FIXED");
    const [interval, setInterval] = useState<string>(generatedData?.interval || "one_time");
    const [businessScale, setBusinessScale] = useState<string>("AUTO");
    const [currency, setCurrency] = useState<string>("IDR");

    const handlePriceTypeChange = (value: string) => {
        setPriceType(value);
    };

    // Generate AI Step 1: apply judul/deskripsi/fitur langsung ke form
    async function handleGenerate() {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch("/api/genkit/generate-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "content", prompt: prompt })
            });
            const result = await res.json();

            if (result.success && result.data) {
                const draft = result.data;

                // Set content di form
                setGeneratedData(prev => ({
                    ...prev,
                    title: draft.title,
                    title_id: draft.title_id,
                    description: draft.description,
                    description_id: draft.description_id,
                    features: draft.features,
                    features_id: draft.features_id,
                }));
                
                // Set pendingDraft untuk menandakan step 1 sukses
                setPendingDraft({
                    title: draft.title,
                    title_id: draft.title_id,
                    description: draft.description,
                    description_id: draft.description_id,
                    features: draft.features,
                    features_id: draft.features_id,
                });

                if (draft.slug) {
                    setSlug(draft.slug as string);
                } else if (draft.title) {
                    setSlug(slugify(draft.title));
                }

                setKeyContent(prev => prev + 1);
                setIsPricingApplied(false); // Reset status harga agar addon dinonaktifkan kembali
                toast.success("Judul, deskripsi, dan fitur berhasil dibuat oleh AI!");
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

    // Generate AI Step 2: Terapkan harga & konfigurasi ke form berdasarkan konten teraktual dari form
    async function applyStep2() {
        if (!formRef.current) return;
        setIsGeneratingPricing(true);

        try {
            const formData = new FormData(formRef.current);
            const title = formData.get("title") as string;
            const title_id = formData.get("title_id") as string;
            const description = formData.get("description") as string;
            const description_id = formData.get("description_id") as string;
            const features = formData.get("features") ? (formData.get("features") as string).split('\n').filter(Boolean) : [];
            const features_id = formData.get("features_id") ? (formData.get("features_id") as string).split('\n').filter(Boolean) : [];

            const res = await fetch("/api/genkit/generate-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "pricing",
                    title,
                    title_id,
                    description,
                    description_id,
                    features,
                    features_id,
                    targetBusinessScale: businessScale
                })
            });
            const result = await res.json();

            if (result.success && result.data) {
                const pricing = result.data;

                // Terapkan harga ke form
                setGeneratedData(prev => ({
                    ...prev,
                    recommended_price: pricing.recommended_price,
                    discount: pricing.discount,
                    currency: pricing.currency,
                    priceType: pricing.priceType,
                    interval: pricing.interval,
                }));

                // Update state lokal untuk sinkronisasi input Radix Select
                if (pricing.priceType) setPriceType(pricing.priceType as string);
                if (pricing.interval) setInterval(pricing.interval as string);
                if (pricing.currency) setCurrency(pricing.currency as string);

                // Update pendingDraft agar menyertakan data harga juga
                setPendingDraft(prev => prev ? {
                    ...prev,
                    recommended_price: pricing.recommended_price,
                    discount: pricing.discount,
                    currency: pricing.currency,
                    priceType: pricing.priceType,
                    interval: pricing.interval,
                } : null);

                setKeyPricing(prev => prev + 1);
                setIsPricingApplied(true);
                toast.success("Rekomendasi harga berhasil dibuat oleh AI!");
            } else {
                toast.error(result.error || "Gagal membuat rekomendasi harga.");
            }
        } catch (error) {
            console.error("AI Pricing Generation error:", error);
            toast.error("Terjadi kesalahan saat memproses harga.");
        } finally {
            setIsGeneratingPricing(false);
        }
    }

    // Generate AI Step 3: Terapkan add-ons ke form berdasarkan konten dan harga teraktual dari form
    async function applyStep3() {
        if (!formRef.current) return;
        setIsGeneratingAddons(true);

        try {
            const formData = new FormData(formRef.current);
            const title = formData.get("title") as string;
            const title_id = formData.get("title_id") as string;
            const description = formData.get("description") as string;
            const description_id = formData.get("description_id") as string;
            const features = formData.get("features") ? (formData.get("features") as string).split('\n').filter(Boolean) : [];
            const features_id = formData.get("features_id") ? (formData.get("features_id") as string).split('\n').filter(Boolean) : [];
            
            const recommended_price = formData.get("price") ? Number(formData.get("price")) : undefined;
            const discount = formData.get("discount") ? Number(formData.get("discount")) : undefined;
            const currencyValue = currency as "USD" | "IDR";
            
            const res = await fetch("/api/genkit/generate-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "addons",
                    title,
                    title_id,
                    description,
                    description_id,
                    features,
                    features_id,
                    recommended_price,
                    discount,
                    currency: currencyValue,
                    priceType,
                    interval,
                    targetBusinessScale: businessScale
                })
            });
            const result = await res.json();

            if (result.success && result.data) {
                const { addons, addons_id } = result.data;

                // Terapkan addons ke form
                setGeneratedData(prev => ({
                    ...prev,
                    addons,
                    addons_id
                }));

                setKeyAddons(prev => prev + 1);
                setPendingDraft(null); // Selesai
                setIsPricingApplied(false);
                toast.success("Daftar add-ons berhasil dibuat oleh AI!");
            } else {
                toast.error(result.error || "Gagal membuat add-ons.");
            }
        } catch (error) {
            console.error("AI Addons Generation error:", error);
            toast.error("Terjadi kesalahan saat memproses add-ons.");
        } finally {
            setIsGeneratingAddons(false);
        }
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

            <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                {/* Left Column: Primary Information (2/3 width) */}
                <div className="lg:col-span-2 space-y-6" key={`content-${keyContent}`}>

                    {/* AI Magic Draft - Box Generator */}
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
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-purple-400" />
                                        <h3 className="text-sm font-semibold text-white">Add-ons (Optional)</h3>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={applyStep3}
                                        disabled={!pendingDraft || !isPricingApplied || isGeneratingAddons}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2.5 text-[10px] gap-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-40 disabled:hover:bg-indigo-500/10 disabled:hover:text-indigo-400"
                                    >
                                        {isGeneratingAddons ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                        Isi dari AI
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Available Add-ons</label>
                                        <DynamicAddonInput
                                            key={`addons-${keyAddons}`}
                                            name="addons"
                                            defaultValue={generatedData?.addons || []}
                                            currency={currency}
                                            targetBusinessScale={businessScale}
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
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-purple-400" />
                                        <h3 className="text-sm font-semibold text-white">Add-ons (Opsional)</h3>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={applyStep3}
                                        disabled={!pendingDraft || !isPricingApplied || isGeneratingAddons}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2.5 text-[10px] gap-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-40 disabled:hover:bg-indigo-500/10 disabled:hover:text-indigo-400"
                                    >
                                        {isGeneratingAddons ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                        Isi dari AI
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Add-on Tersedia</label>
                                        <DynamicAddonInput
                                            key={`addons-id-${keyAddons}`}
                                            name="addons_id"
                                            defaultValue={generatedData?.addons_id || []}
                                            currency={currency}
                                            targetBusinessScale={businessScale}
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
                            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-violet-400" />
                                    <h3 className="text-sm font-semibold text-white">{tAdmin("pricingConfig")}</h3>
                                </div>
                                <Button
                                    type="button"
                                    onClick={applyStep2}
                                    disabled={!pendingDraft || isGeneratingPricing}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-[10px] gap-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-40 disabled:hover:bg-indigo-500/10 disabled:hover:text-indigo-400"
                                >
                                    {isGeneratingPricing ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3 h-3" />
                                    )}
                                    Isi dari AI
                                </Button>
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
                                        <Select name="currency" value={currency} onValueChange={setCurrency}>
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
