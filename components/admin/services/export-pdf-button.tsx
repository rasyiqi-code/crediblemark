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

            // Buat kontainer tersembunyi dengan lebar A4 desktop (794px)
            const element = document.createElement("div");
            element.style.position = "fixed";
            element.style.left = "-9999px";
            element.style.top = "-9999px";
            element.style.width = "794px";
            element.style.backgroundColor = "#000000"; // Menyelaraskan dengan background dark theme proposal
            element.innerHTML = data.html;
            document.body.appendChild(element);

            // Tunggu semua gambar (logo, tanda tangan, stempel) selesai dimuat
            const images = element.querySelectorAll("img");
            const imagePromises = Array.from(images).map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Tetap lanjut jika gambar gagal dimuat agar tidak stuck
                });
            });
            await Promise.all(imagePromises);

            const opt = {
                margin: 0,
                filename: `${service.title.replace(/[^a-z0-9]/gi, '_')}_Proposal.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    letterRendering: true,
                    width: 794
                },
                jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" as const }
            };

            // Jalankan proses ekstraksi PDF dan unduh langsung secara native di browser
            await html2pdf().set(opt).from(element).save();

            // Bersihkan kontainer dari DOM
            document.body.removeChild(element);
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
