"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, ChevronDown, Printer } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";
import { useLocale } from "next-intl";
import { useSafeUser } from "@/hooks/use-safe-user";
import { ServiceDataForPdf } from "@/lib/pdf/proposal-template";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

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

    // 1. Ekspor menggunakan html2pdf.js (Unduh PDF Otomatis - berbasis Canvas)
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

            // Tunggu seluruh @font-face di CSS proposal selesai di-fetch dan diterapkan
            await new Promise<void>((resolve) => {
                const win = iframe.contentWindow;
                if (!win) { resolve(); return; }

                const waitFonts = async () => {
                    try {
                        if (doc.fonts && typeof doc.fonts.ready !== "undefined") {
                            await (doc as Document & { fonts: FontFaceSet }).fonts.ready;
                        }
                        // Force reflow: memaksa browser menghitung ulang layout
                        const body = doc.body;
                        if (body) {
                            void body.offsetHeight;
                        }
                    } catch (e) {
                        console.warn("Penungguan font gagal:", e);
                    }
                    resolve();
                };

                if (doc.readyState === "complete") {
                    waitFonts();
                } else {
                    win.onload = () => waitFonts();
                }
            });

            // Beri jeda 2000ms agar font-display: block stabil
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const opt = {
                margin: 0,
                filename: `${service.title.replace(/[^a-z0-9]/gi, '_')}_Proposal.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    // letterRendering diatur ke false karena merender karakter per karakter
                    // seringkali memicu baseline-shift bermasalah pada subsistem canvas peramban.
                    letterRendering: false,
                    imageTimeout: 0,
                    width: 794,
                    scrollX: 0,
                    scrollY: 0,
                    window: (iframe.contentWindow || window) as Window
                },
                jsPDF: { unit: "px", format: [794, 1123] as [number, number], orientation: "portrait" as const }
            };

            // Jalankan ekstraksi PDF
            await html2pdf().set(opt).from(doc.documentElement).save();

            // Bersihkan iframe dari DOM
            document.body.removeChild(iframe);
        } catch (error) {
            console.error("Ekspor PDF gagal:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 2. Ekspor menggunakan Printer Native Browser (Cetak/Simpan Premium - berbasis Vektor)
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

            // Buat iframe tersembunyi
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.left = "-9999px";
            iframe.style.top = "-9999px";
            iframe.style.width = "210mm"; // Mengikuti standar ukuran A4
            iframe.style.height = "297mm";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                throw new Error("Gagal membuat dokumen dalam iframe");
            }

            doc.open();
            doc.write(data.html);
            doc.close();

            // Tunggu aset dan font termuat sempurna
            await new Promise<void>((resolve) => {
                const win = iframe.contentWindow;
                if (!win) { resolve(); return; }

                const executePrint = () => {
                    setTimeout(() => {
                        win.focus();
                        win.print();
                        resolve();
                    }, 800); // jeda agar peramban merender visual
                };

                if (doc.readyState === "complete") {
                    executePrint();
                } else {
                    win.onload = () => executePrint();
                }
            });

            // Berikan waktu jeda sebelum menghapus iframe agar proses cetak stabil
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1500);
        } catch (error) {
            console.error("Cetak proposal gagal:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const isEn = locale.startsWith("en");
    const buttonLabel = isGenerating
        ? (isEn ? "Preparing..." : "Menyiapkan...")
        : (isEn ? "Download Proposal" : "Unduh Proposal");

    const tAutoPdf = isEn ? "Download PDF (Fast)" : "Unduh PDF Otomatis (Cepat)";
    const tNativePdf = isEn ? "Print / Save PDF (Vector Premium)" : "Cetak / Simpan PDF (Vektor Premium)";

    if (variant === "button") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 min-w-[185px] rounded-none bg-zinc-950 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-brand-yellow/30 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(254,215,0,0.1)]"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-yellow" />
                        ) : (
                            <FileDown className="w-4 h-4 text-brand-yellow" />
                        )}
                        <span>{buttonLabel}</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-1 text-zinc-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-950 border border-white/10 text-zinc-300 rounded-none min-w-[220px]">
                    <DropdownMenuItem 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white cursor-pointer transition-colors"
                    >
                        <FileDown className="w-3.5 h-3.5 text-brand-yellow" />
                        <span>{tAutoPdf}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={handleNativePrint}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white cursor-pointer transition-colors"
                    >
                        <Printer className="w-3.5 h-3.5 text-brand-yellow" />
                        <span>{tNativePdf}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    disabled={isGenerating}
                    title="Ekspor ke PDF"
                    className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <FileDown className="h-3.5 w-3.5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-zinc-950 border border-white/10 text-zinc-300 rounded-none min-w-[200px]">
                <DropdownMenuItem 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white cursor-pointer transition-colors"
                >
                    <FileDown className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>{tAutoPdf}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={handleNativePrint}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white cursor-pointer transition-colors"
                >
                    <Printer className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>{tNativePdf}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
