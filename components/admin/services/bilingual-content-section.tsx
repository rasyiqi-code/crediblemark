"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { RichTextEditorClient } from "@/components/ui/rich-text-editor-client";
import { DynamicListInput } from "@/components/ui/dynamic-list-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, ListChecks, Flag, Link as LinkIcon } from "lucide-react";
import { slugify } from "@/lib/shared/utils";

interface BilingualContentSectionProps {
    generatedData: {
        title?: string | null;
        title_id?: string | null;
        description?: string | null;
        description_id?: string | null;
        features?: string[] | null;
        features_id?: string[] | null;
    } | null;
    slug: string;
    setSlug: (value: string) => void;
    isCustomSlug: boolean;
    setIsCustomSlug: (value: boolean) => void;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultFeatures?: string[];
    defaultTitleId?: string;
    defaultDescriptionId?: string;
    defaultFeaturesId?: string[];
}

export function BilingualContentSection({
    generatedData,
    slug,
    setSlug,
    isCustomSlug,
    setIsCustomSlug,
    defaultTitle = "",
    defaultDescription = "",
    defaultFeatures = [],
    defaultTitleId = "",
    defaultDescriptionId = "",
    defaultFeaturesId = []
}: BilingualContentSectionProps) {
    const tAdmin = useTranslations("Admin.Services");

    return (
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
                                defaultValue={generatedData?.title ?? defaultTitle}
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
                                defaultValue={generatedData?.description ?? defaultDescription}
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
                                defaultValue={generatedData?.features || defaultFeatures}
                                placeholder={tAdmin("featurePlaceholderEn")}
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
                                defaultValue={generatedData?.title_id ?? defaultTitleId}
                                placeholder={tAdmin("titlePlaceholderId")}
                                required
                                className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-red-500/20 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{tAdmin("description")}</label>
                            <RichTextEditorClient
                                name="description_id"
                                defaultValue={generatedData?.description_id ?? defaultDescriptionId}
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
                                defaultValue={generatedData?.features_id || defaultFeaturesId}
                                placeholder={tAdmin("featurePlaceholderId")}
                            />
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
