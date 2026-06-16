"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";
import { useLocale } from "next-intl";
import { useSafeUser } from "@/hooks/use-safe-user";
import { ServiceDataForPdf } from "@/lib/pdf/proposal-template";

// Tombol ekspor PDF proposal yang memicu download langsung di sisi klien
// menggunakan API route sisi server agar layout merender desktop A4 dengan presisi.
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
    const locale = useLocale();

    const handleExport = async () => {
        setIsGenerating(true);

        try {
            const response = await fetch("/api/services/export-pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    service,
                    locale,
                    user,
                    globalAddons
                })
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil template proposal HTML");
            }

            const data = await response.json();
            if (!data.html) {
                throw new Error("Template proposal kosong");
            }

            // Muat html2pdf secara dinamis di sisi klien
            const html2pdf = (await import("html2pdf.js")).default;

            // Buat iframe tersembunyi beresolusi A4 desktop (794px)
            // agar layout A4 ter-render secara terisolasi tanpa interferensi CSS parent page
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.left = "-9999px";
            iframe.style.top = "-9999px";
            iframe.style.width = "794px";
            iframe.style.height = "1123px";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                throw new Error("Gagal membuat dokumen dalam iframe terisolasi");
            }

            doc.open();
            doc.write(data.html);
            doc.close();

            // Tunggu hingga seluruh aset (CSS, Gambar, Google Fonts) selesai dimuat penuh di dalam iframe
            await new Promise<void>((resolve) => {
                const win = iframe.contentWindow;
                if (win) {
                    if (doc.readyState === "complete") {
                        resolve();
                    } else {
                        win.onload = () => resolve();
                    }
                } else {
                    resolve();
                }
            });

            // Beri jeda 500ms tambahan untuk meyakinkan rendering font & layout selesai sempurna
            await new Promise((resolve) => setTimeout(resolve, 500));

            const opt = {
                margin: 0,
                filename: `${service.title.replace(/[^a-z0-9]/gi, '_')}_Proposal.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    letterRendering: true,
                    width: 794
                },
                jsPDF: { unit: "px", format: [794, 1123] as [number, number], orientation: "portrait" as const }
            };

            // Jalankan proses ekstraksi PDF dari body dokumen iframe
            await html2pdf().set(opt).from(doc.body).save();

            // Bersihkan iframe dari DOM
            document.body.removeChild(iframe);
        } catch (error) {
            console.error("Ekspor PDF gagal:", error);
        } finally {
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
