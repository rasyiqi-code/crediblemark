"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";
import { useLocale } from "next-intl";
import { ServiceDataForPdf } from "@/lib/pdf/proposal-template";

// Tombol ekspor PDF proposal yang mengarahkan pengguna ke route fisik proposal terisolasi.
// Membuka route ini secara fisik di tab/window baru menjamin peramban (baik mobile maupun desktop)
// memfokuskan dialog cetak native hanya pada dokumen proposal saja, bebas dari risiko salah cetak halaman asal.
export function ExportPdfButton({
    service,
    variant = "icon"
}: {
    service: ServiceDataForPdf;
    variant?: "icon" | "button";
    globalAddons?: ServiceAddon[];
}) {
    const locale = useLocale();

    const handlePrintRedirect = () => {
        // Gunakan ID aslinya untuk mengambil proposal terisolasi di route handler
        const targetIdentifier = service.id;

        // Buka route proposal terisolasi di jendela tab baru
        const url = `/proposal/${targetIdentifier}?locale=${locale}`;
        window.open(url, "_blank");
    };

    const isEn = locale.startsWith("en");
    const buttonLabel = isEn ? "Print / Save PDF" : "Cetak / Simpan PDF";

    if (variant === "button") {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={handlePrintRedirect}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 min-w-[185px] rounded-none bg-zinc-950 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-brand-yellow/30 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(254,215,0,0.1)]"
            >
                <Printer className="w-4 h-4 text-brand-yellow" />
                <span>{buttonLabel}</span>
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handlePrintRedirect}
            title={isEn ? "Print / Save PDF" : "Cetak / Simpan PDF"}
            className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
            <Printer className="h-3.5 w-3.5" />
        </Button>
    );
}
