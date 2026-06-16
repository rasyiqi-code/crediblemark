"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";
import { useLocale } from "next-intl";
import { useSafeUser } from "@/hooks/use-safe-user";
import { ServiceDataForPdf } from "@/lib/pdf/proposal-template";

// Tombol ekspor PDF proposal yang memicu pencetakan/penyimpanan PDF native
// menggunakan jendela baru untuk mencegah bug peramban mencetak halaman utama detail layanan.
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

    // Cetak menggunakan Printer Native Browser (Cetak/Simpan Premium - berbasis Vektor)
    // di dalam jendela baru agar terisolasi sempurna dari halaman utama detail layanan
    const handleNativePrint = async () => {
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

            // Buka jendela tab baru kosong agar browser fokus penuh pada cetak proposal
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                throw new Error("Gagal membuka jendela cetak baru. Pastikan pop-up diperbolehkan di peramban Anda.");
            }

            // Tulis HTML proposal ke dalam tab baru
            printWindow.document.open();
            printWindow.document.write(data.html);
            printWindow.document.close();

            const doc = printWindow.document;

            // Tunggu aset dan font termuat sempurna sebelum memicu dialog print
            const executePrint = async () => {
                try {
                    if (doc.fonts && typeof doc.fonts.ready !== "undefined") {
                        await (doc as Document & { fonts: FontFaceSet }).fonts.ready;
                    }
                    // Force reflow
                    const body = doc.body;
                    if (body) {
                        void body.offsetHeight;
                    }
                } catch (e) {
                    console.warn("Penungguan font di jendela baru gagal:", e);
                }

                // Beri jeda kecil agar peramban merender visual proposal secara utuh
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                }, 1000);
            };

            if (doc.readyState === "complete") {
                executePrint();
            } else {
                printWindow.onload = () => executePrint();
            }
        } catch (error) {
            console.error("Cetak proposal gagal:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const isEn = locale.startsWith("en");
    const buttonLabel = isGenerating
        ? (isEn ? "Preparing..." : "Menyiapkan...")
        : (isEn ? "Print / Save PDF" : "Cetak / Simpan PDF");

    if (variant === "button") {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={handleNativePrint}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 min-w-[185px] rounded-none bg-zinc-950 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-brand-yellow/30 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(254,215,0,0.1)]"
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-yellow" />
                ) : (
                    <Printer className="w-4 h-4 text-brand-yellow" />
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
            onClick={handleNativePrint}
            disabled={isGenerating}
            title={isEn ? "Print / Save PDF" : "Cetak / Simpan PDF"}
            className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
            {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Printer className="h-3.5 w-3.5" />
            )}
        </Button>
    );
}
