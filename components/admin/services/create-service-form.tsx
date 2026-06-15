"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createService } from "@/app/actions/services";
import { generateServiceContentAction, generateServicePricingAction } from "@/app/actions/genkit";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { slugify } from "@/lib/shared/utils";
import Link from "next/link";
import { ServiceData } from "./edit-service-form";
import { AiDraftSection } from "./ai-draft-section";
import { BilingualContentSection } from "./bilingual-content-section";
import { PricingSection } from "./pricing-section";

interface DraftServiceData extends Partial<ServiceData> {
    recommended_price?: number;
    original_price?: number | null;
}

export function CreateServiceForm() {
    const router = useRouter();
    const t = useTranslations("Service");
    const tAdmin = useTranslations("Admin.Services");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const formRef = useRef<HTMLFormElement>(null);

    // State AI Generation
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPricing, setIsGeneratingPricing] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<DraftServiceData | null>(null);
    const [generatedData, setGeneratedData] = useState<DraftServiceData | null>(null);

    // Key terpisah agar force-remount hanya field yang relevan per step
    const [keyContent, setKeyContent] = useState(0);
    const [keyPricing, setKeyPricing] = useState(0);

    const [slug, setSlug] = useState("");
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [priceType, setPriceType] = useState<string>("FIXED");
    const [interval, setInterval] = useState<string>("one_time");
    const [businessScale, setBusinessScale] = useState<string>("AUTO");
    const [currency, setCurrency] = useState<string>("IDR");

    // Generate AI Step 1: apply judul/deskripsi/fitur langsung ke form
    async function handleGenerate() {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateServiceContentAction(prompt);

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

                if (draft.title) {
                    setSlug(slugify(draft.title));
                }

                setKeyContent(prev => prev + 1);
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

            const result = await generateServicePricingAction({
                title,
                title_id,
                description,
                description_id,
                features,
                features_id,
                targetBusinessScale: businessScale
            });

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
                    <AiDraftSection
                        prompt={prompt}
                        setPrompt={setPrompt}
                        businessScale={businessScale}
                        setBusinessScale={setBusinessScale}
                        handleGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />

                    {/* Bilingual Content Section */}
                    <BilingualContentSection
                        generatedData={generatedData}
                        slug={slug}
                        setSlug={setSlug}
                        isCustomSlug={isCustomSlug}
                        setIsCustomSlug={setIsCustomSlug}
                    />
                </div>

                {/* Right Column: Configuration & Actions (1/3 width) */}
                <div className="lg:col-span-1" key={`pricing-${keyPricing}`}>
                    <div className="sticky top-8 space-y-6">
                        <PricingSection
                            priceType={priceType}
                            setPriceType={setPriceType}
                            interval={interval}
                            setInterval={setInterval}
                            currency={currency}
                            setCurrency={setCurrency}
                            applyStep2={applyStep2}
                            pendingDraft={pendingDraft}
                            isGeneratingPricing={isGeneratingPricing}
                            isSubmitting={isSubmitting}
                            isEdit={false}
                            generatedData={generatedData}
                        />
                    </div>
                </div>
            </form>
        </>
    );
}
