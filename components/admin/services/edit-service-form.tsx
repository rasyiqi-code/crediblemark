"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateService } from "@/app/actions/services";
import { generateServiceContentAction, generateServicePricingAction } from "@/app/actions/genkit";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { slugify } from "@/lib/shared/utils";
import { type ServiceAddon } from "@/components/ui/dynamic-addon-input";
import Link from "next/link";
import { AiDraftSection } from "./ai-draft-section";
import { BilingualContentSection } from "./bilingual-content-section";
import { PricingSection } from "./pricing-section";

export interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    priceType?: string;
    currency?: string;
    interval: string;
    features: string[];
    features_id?: string[] | null;
    image: string | null;
    slug?: string | null;
    visibility?: string;
    addons?: ServiceAddon[] | null;
    addons_id?: ServiceAddon[] | null;
}

interface DraftServiceData extends Partial<ServiceData> {
    recommended_price?: number;
    original_price?: number | null;
}

export function EditServiceForm({
    service,
    features,
    features_id
}: {
    service: ServiceData,
    features: string[],
    features_id: string[]
}) {
    const router = useRouter();
    const t = useTranslations("Service");
    const tAdmin = useTranslations("Admin.Services");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Generation State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPricing, setIsGeneratingPricing] = useState(false);
    
    // Inisialisasi pendingDraft dengan data awal layanan agar tombol Pricing langsung aktif
    const [pendingDraft, setPendingDraft] = useState<DraftServiceData | null>({
        title: service.title,
        title_id: service.title_id || "",
        description: service.description,
        description_id: service.description_id || "",
        features: features,
        features_id: features_id
    });
    const [generatedData, setGeneratedData] = useState<DraftServiceData | null>(null);

    // Key terpisah agar force-remount hanya field yang relevan per step
    const [keyContent, setKeyContent] = useState(0);
    const [keyPricing, setKeyPricing] = useState(0);

    const [slug, setSlug] = useState(service.slug || "");
    const [priceType, setPriceType] = useState<string>(service.priceType || "FIXED");
    const [interval, setInterval] = useState<string>(service.interval || "one_time");
    const [businessScale, setBusinessScale] = useState<string>("AUTO");
    const [currency, setCurrency] = useState<string>(service.currency || "IDR");
    const [isCustomSlug, setIsCustomSlug] = useState(!!service.slug);

    const formRef = useRef<HTMLFormElement>(null);

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
            const result = await updateService(service.id, formData);

            if (result.error) {
                throw new Error(typeof result.error === 'string' ? result.error : "Failed to update service");
            }

            toast.success(tAdmin("updateSuccess"));
            router.push("/admin/pm/services");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to update service");
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
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Service Management</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                            Edit Service
                        </h1>
                    </div>
                    <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
                        Update service details, pricing, and features.
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
                <input type="hidden" name="id" value={service.id} />

                {/* Left Column: Primary Information */}
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
                        defaultTitle={service.title}
                        defaultDescription={service.description}
                        defaultFeatures={features}
                        defaultTitleId={service.title_id || ""}
                        defaultDescriptionId={service.description_id || ""}
                        defaultFeaturesId={features_id}
                    />
                </div>

                {/* Right Column: Configuration & Actions */}
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
                            isEdit={true}
                            generatedData={generatedData}
                            defaultVisibility={service.visibility}
                            defaultPrice={service.price}
                            defaultDiscount={service.discount ?? 0}
                        />
                    </div>
                </div>
            </form>
        </>
    );
}
