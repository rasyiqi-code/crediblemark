"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";
import { useLocale } from "next-intl";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";
import { getAgencyLogo, getCompanyStamp, getDirectorSignature } from "@/app/actions/system-admin";
import { useSafeUser } from "@/hooks/use-safe-user";
import { generateProposalHtml, ServiceDataForPdf } from "@/lib/pdf/proposal-template";

export function ExportPdfButton({
    service,
    variant = "icon",
    globalAddons = []
}: {
    service: ServiceDataForPdf;
    variant?: "icon" | "button";
    globalAddons?: ServiceAddon[];
}) {
    const { user } = useSafeUser();
    const [isGenerating, setIsGenerating] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [stampUrl, setStampUrl] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState<{
        email: string;
        phone: string;
        telegram: string;
        address: string;
        hours: string;
    } | null>(null);
    const locale = useLocale();

    useEffect(() => {
        getAgencyLogo().then(setLogoUrl).catch(console.error);
        getCompanyStamp().then(setStampUrl).catch(console.error);
        getDirectorSignature().then(setSignatureUrl).catch(console.error);
        fetch("/api/system/contact")
            .then(res => res.json())
            .then(setContactInfo)
            .catch(console.error);
    }, []);

    const handleExport = async () => {
        setIsGenerating(true);

        try {
            // Impor html2pdf.js secara dinamis untuk menghindari masalah SSR di Next.js
            const html2pdf = (await import("html2pdf.js")).default;

            // Membuat iframe tersembunyi untuk proses rendering HTML
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "none";
            iframe.style.visibility = "hidden";

            document.body.appendChild(iframe);

            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                document.body.removeChild(iframe);
                setIsGenerating(false);
                return;
            }

            const messages = locale.startsWith("en") ? enMessages : idMessages;

            const htmlContent = generateProposalHtml({
                service,
                logoUrl,
                signatureUrl,
                stampUrl,
                contactInfo,
                locale,
                user,
                globalAddons,
                messages
            });

            doc.open();
            doc.write(htmlContent);
            doc.close();

            const fileName = `${service.title.replace(/[^a-z0-9]/gi, '_')}_Proposal.pdf`;

            const opt = {
                margin: 0,
                filename: fileName,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
            };

            // Menunggu styles, gambar, dan fonts dimuat di dalam iframe sebelum konversi
            setTimeout(() => {
                if (iframe.contentDocument?.body) {
                    html2pdf()
                        .set(opt)
                        .from(iframe.contentDocument.body)
                        .save()
                        .then(() => {
                            document.body.removeChild(iframe);
                            setIsGenerating(false);
                        })
                        .catch((err: unknown) => {
                            console.error("Gagal memproses PDF via html2pdf:", err);
                            document.body.removeChild(iframe);
                            setIsGenerating(false);
                        });
                } else {
                    document.body.removeChild(iframe);
                    setIsGenerating(false);
                }
            }, 1000);
        } catch (error) {
            console.error("Ekspor PDF gagal:", error);
            setIsGenerating(false);
        }
    };

    const isEn = locale.startsWith("en");
    const buttonLabel = isGenerating
        ? (isEn ? "Generating Proposal..." : "Membuat Proposal...")
        : (isEn ? "Download Proposal" : "Unduh Proposal");

    if (variant === "button") {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-none bg-zinc-950 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-brand-yellow/30 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(254,215,0,0.1)]"
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-yellow" />
                ) : (
                    <FileDown className="w-4 h-4 text-brand-yellow" />
                )}
                <span>{buttonLabel}</span>
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleExport}
            disabled={isGenerating}
            title="Ekspor ke PDF"
            className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
            {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <FileDown className="w-3.5 h-3.5" />
            )}
        </Button>
    );
}
