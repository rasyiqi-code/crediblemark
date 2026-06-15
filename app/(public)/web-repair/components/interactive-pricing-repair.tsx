"use client";

import { useState, useRef } from "react";
import { Check, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useFloatingChat } from "@/lib/store/floating-chat-store";

// Definisikan tipe data untuk Paket Perbaikan
interface RepairPackage {
    id: "quick-fix" | "refactor" | "enterprise";
    nameEn: string;
    nameId: string;
    descEn: string;
    descId: string;
    priceIdr: number;
    priceUsd: number;
    featuresEn: string[];
    featuresId: string[];
}

// Definisikan tipe data untuk Addon Perbaikan
interface RepairAddon {
    id: string;
    nameEn: string;
    nameId: string;
    descEn: string;
    descId: string;
    priceIdr: number;
    priceUsd: number;
    interval: "one_time" | "monthly";
}

interface InteractivePricingRepairProps {
    locale: string;
}

export function InteractivePricingRepair({ locale }: InteractivePricingRepairProps) {
    const isId = locale === "id";
    const { setIsMenuOpen, setDefaultInput } = useFloatingChat();

    // 1. Definisikan 3 Paket Perbaikan Website & Refactoring
    const packagesList: RepairPackage[] = [
        {
            id: "quick-fix",
            nameEn: "Bug Rescue & Diagnostics",
            nameId: "Bug Rescue & Diagnostik",
            descEn: "Targeted diagnostics and fixing specific bugs, crash logs, or console errors on your active website.",
            descId: "Diagnosis terfokus dan perbaikan bug spesifik, log crash, atau error konsol pada website aktif Anda.",
            priceIdr: 1500000,
            priceUsd: 100,
            featuresEn: [
                "Detailed Code Audit & Diagnostics",
                "Fix up to 3 Specific Bugs",
                "Console & Server Error Resolution",
                "Basic Speed Check",
                "90-Day Warranty for Fixed Items"
            ],
            featuresId: [
                "Audit Kode & Diagnosis Detail",
                "Perbaikan Hingga 3 Bug Spesifik",
                "Resolusi Error Konsol & Server",
                "Pemeriksaan Kecepatan Dasar",
                "Garansi 90 Hari untuk Item Diperbaiki"
            ]
        },
        {
            id: "refactor",
            nameEn: "Vibecoding Clean-up & Refactor",
            nameId: "Vibecoding Clean-up & Refactor",
            descEn: "Complete code restructuring to clean up messy AI/spaghetti code. Splitting huge files, modularizing components, and fixing logical loops.",
            descId: "Restrukturisasi kode secara menyeluruh untuk merapikan kode AI/spaghetti yang berantakan. Memisahkan file raksasa, modularisasi komponen, dan mengatasi logic loops.",
            priceIdr: 7500000,
            priceUsd: 500,
            featuresEn: [
                "Clean Code Refactoring (DRY)",
                "Splitting Large Files & Components",
                "Eliminating Duplicate Code",
                "LCP / INP Performance Tuning",
                "90-Day Comprehensive Error-Free Warranty"
            ],
            featuresId: [
                "Refactoring Kode Bersih (DRY)",
                "Pemisahan File & Komponen Besar",
                "Menghilangkan Duplikasi Kode",
                "Optimasi Performa LCP / INP",
                "Garansi Bebas Error Menyeluruh 90 Hari"
            ]
        },
        {
            id: "enterprise",
            nameEn: "Enterprise Hardening & Performance",
            nameId: "Enterprise Hardening & Performa",
            descEn: "High-level optimization and security audit. Resolving database query bottlenecks, fixing critical security loopholes, and configuring DDoS guards.",
            descId: "Optimasi tingkat tinggi dan audit keamanan. Mengatasi bottleneck query database lambat, menutup celah keamanan kritis, dan setup proteksi DDoS.",
            priceIdr: 15000000,
            priceUsd: 1000,
            featuresEn: [
                "Full Security Audit & Hardening",
                "Fixing Exploits (XSS, CSRF, Injection)",
                "Database Query & Index Optimization",
                "DDoS & Bot Shield Configuration",
                "Priority Support SLA & Direct Engineer Hot-line"
            ],
            featuresId: [
                "Audit Keamanan & Pengerasan Penuh",
                "Perbaikan Celah (XSS, CSRF, Injeksi)",
                "Optimasi Query & Indeks Database",
                "Setup Proteksi DDoS & Bot Shield",
                "SLA Dukungan Prioritas & Kontak Engineer Langsung"
            ]
        }
    ];

    // 2. Definisikan Add-ons
    const addonsList: RepairAddon[] = [
        {
            id: "emergency-sla",
            nameEn: "24/7 Emergency Support SLA",
            nameId: "SLA Bantuan Darurat 24/7",
            descEn: "Guaranteed under-2-hour engineer response time for critical server crashes or downtime.",
            descId: "Jaminan respon teknisi kurang dari 2 jam untuk masalah server crash kritis atau website down.",
            priceIdr: 1500000,
            priceUsd: 100,
            interval: "monthly",
        },
        {
            id: "cicd-setup",
            nameEn: "CI/CD & Testing Pipeline Setup",
            nameId: "Setup Pipeline CI/CD & Automated Test",
            descEn: "Establish automated GitHub Actions, code linting rules, and tests to prevent future vibecoding bugs.",
            descId: "Membangun workflow GitHub Actions otomatis, aturan linting kode, dan tes untuk mencegah bug vibecoding di masa mendatang.",
            priceIdr: 3000000,
            priceUsd: 200,
            interval: "one_time",
        },
        {
            id: "cloud-migration",
            nameEn: "Safe Cloud/Server Migration",
            nameId: "Migrasi Server / Cloud Aman",
            descEn: "Migrate your database and site files to a faster host (Vercel, AWS, or VPS) with zero downtime.",
            descId: "Migrasikan database dan file website Anda ke hosting yang lebih cepat (Vercel, AWS, atau VPS) tanpa downtime.",
            priceIdr: 2500000,
            priceUsd: 170,
            interval: "one_time",
        },
    ];

    const [selectedPackageId, setSelectedPackageId] = useState<"quick-fix" | "refactor" | "enterprise">("refactor");
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fungsi scroll ke paket tertentu secara presisi (khusus mobile swipe)
    const scrollToPackage = (id: "quick-fix" | "refactor" | "enterprise") => {
        setSelectedPackageId(id);
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const index = packagesList.findIndex((p) => p.id === id);
            const targetChild = container.children[index] as HTMLElement;
            if (targetChild) {
                container.scrollTo({
                    left: targetChild.offsetLeft - 16,
                    behavior: "smooth"
                });
            }
        }
    };

    // Fungsi navigasi tombol panah di mobile
    const navigatePackage = (direction: "prev" | "next") => {
        const currentIndex = packagesList.findIndex((p) => p.id === selectedPackageId);
        let targetIndex = currentIndex;
        if (direction === "prev") {
            targetIndex = currentIndex > 0 ? currentIndex - 1 : packagesList.length - 1;
        } else {
            targetIndex = currentIndex < packagesList.length - 1 ? currentIndex + 1 : 0;
        }
        const targetPackage = packagesList[targetIndex];
        scrollToPackage(targetPackage.id);
    };

    // Ambil detail paket terpilih
    const activePackage = packagesList.find((p) => p.id === selectedPackageId)!;

    const toggleAddon = (addonId: string) => {
        setSelectedAddons((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
    };

    // Hitung total investasi
    const selectedAddonObjects = addonsList.filter((a) => selectedAddons.includes(a.id));
    const totalIdr = activePackage.priceIdr + selectedAddonObjects.reduce((sum, a) => sum + a.priceIdr, 0);
    const totalUsd = activePackage.priceUsd + selectedAddonObjects.reduce((sum, a) => sum + a.priceUsd, 0);

    // Format mata uang helper
    const formatCurrency = (value: number, currency: "IDR" | "USD") => {
        if (currency === "IDR") {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
            }).format(value);
        } else {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
            }).format(value);
        }
    };

    const handleCTA = () => {
        const packageName = isId ? activePackage.nameId : activePackage.nameEn;
        const addonNames = selectedAddonObjects.map(a => isId ? a.nameId : a.nameEn).join(", ");
        const currentUrl = typeof window !== "undefined" ? window.location.href : "";
        
        const bodyText = isId
            ? `Halo, saya tertarik dengan Layanan Perbaikan Website (Vibecoding Rescue).\n\nDetail Paket:\n- Paket Utama: Paket ${packageName}\n- Add-ons Terpilih: ${addonNames || "Tidak ada"}\n- Estimasi Investasi: ${formatCurrency(totalIdr, "IDR")}\n\n${currentUrl}`
            : `Hello, I'm interested in the Web Repair Service (Vibecoding Rescue).\n\nPackage Details:\n- Chosen Package: ${packageName} Package\n- Selected Addons: ${addonNames || "None"}\n- Estimated Investment: ${formatCurrency(totalUsd, "USD")}\n\n${currentUrl}`;

        setDefaultInput(bodyText);
        setIsMenuOpen(true);
    };

    return (
        <div className="space-y-12 pb-24 relative">
            
            {/* Bagian I: Perbandingan 3 Paket Utama (3-Card Layout) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                        {isId ? "1. Pilih Tipe Paket Perbaikan:" : "1. Select Repair Tier:"}
                    </h4>
                    
                    {/* Petunjuk Swipe & Trigger Navigasi di Mobile */}
                    <div className="flex items-center gap-1.5 md:hidden">
                        <span className="text-[10px] font-bold text-zinc-500 animate-pulse mr-1">
                            {isId ? "Geser" : "Swipe"}
                        </span>
                        <button
                            type="button"
                            onClick={() => navigatePackage("prev")}
                            className="p-1 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 active:scale-90 hover:text-amber-500 transition-all"
                            aria-label="Previous Package"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigatePackage("next")}
                            className="p-1 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 active:scale-90 hover:text-amber-500 transition-all"
                            aria-label="Next Package"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto md:overflow-visible gap-4 pb-4 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:pb-0"
                >
                    {packagesList.map((pkg) => {
                        const isActive = pkg.id === selectedPackageId;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => scrollToPackage(pkg.id)}
                                className={`relative rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 transform w-[85vw] max-w-[320px] md:w-full md:max-w-full shrink-0 snap-align-start hover:scale-[1.01] ${
                                    isActive
                                        ? "border-amber-500 bg-zinc-900 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500"
                                        : "border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900/60"
                                }`}
                            >
                                {pkg.id === "refactor" && (
                                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1 shadow">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        {isId ? "Rekomendasi" : "Recommended"}
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    {/* Header Paket */}
                                    <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                                        <h5 className="font-extrabold text-sm sm:text-base text-white">
                                            {isId ? pkg.nameId : pkg.nameEn}
                                        </h5>
                                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                                            {pkg.id === "quick-fix" && "Rescue"}
                                            {pkg.id === "refactor" && "Clean-up"}
                                            {pkg.id === "enterprise" && "Hardening"}
                                        </span>
                                    </div>
                                    
                                    {/* Harga Paket */}
                                    <div>
                                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                                            {isId ? "Investasi Mulai Dari" : "Investment Starts At"}
                                        </span>
                                        <span className="font-black text-xl md:text-2xl text-amber-500 block">
                                            {isId ? formatCurrency(pkg.priceIdr, "IDR") : formatCurrency(pkg.priceUsd, "USD")}
                                        </span>
                                    </div>
 
                                    {/* Deskripsi Paket */}
                                    <p className="text-zinc-400 text-xs leading-relaxed min-h-[50px]">
                                        {isId ? pkg.descId : pkg.descEn}
                                    </p>
 
                                    {/* Fitur Bawaan Paket */}
                                    <div className="space-y-2.5 pt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                                            {isId ? "Fitur Bawaan:" : "Included Features:"}
                                        </span>
                                        <ul className="space-y-2">
                                            {(isId ? pkg.featuresId : pkg.featuresEn).map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Check className="w-2.5 h-2.5 text-amber-500" />
                                                    </div>
                                                    <span className="leading-snug">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
 
                                {/* Tombol Pilih / Indikator Aktif */}
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                            isActive
                                                ? "bg-amber-500 text-black hover:bg-amber-400"
                                                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5"
                                        }`}
                                    >
                                        <span>{isActive ? (isId ? "Paket Terpilih" : "Active Package") : (isId ? "Pilih Paket" : "Select Package")}</span>
                                        {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
 
                {/* Dots Indicator untuk Mobile */}
                <div className="flex justify-center gap-1.5 md:hidden pt-2">
                    {packagesList.map((pkg, idx) => {
                        const isActive = pkg.id === selectedPackageId;
                        return (
                            <button
                                key={pkg.id}
                                type="button"
                                onClick={() => scrollToPackage(pkg.id)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    isActive ? "w-4 bg-amber-500" : "w-1.5 bg-zinc-700"
                                }`}
                                aria-label={`Go to package ${idx + 1}`}
                            />
                        );
                    })}
                </div>
            </div>
 
            {/* Bagian II: Add-ons Opsional (2-Column Grid Layout) */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 text-center md:text-left">
                    {isId ? "2. Tambahkan Fitur Add-on Opsional:" : "2. Add Optional Extensions:"}
                </h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                    {addonsList.map((addon) => {
                        const isSelected = selectedAddons.includes(addon.id);
                        return (
                            <div
                                key={addon.id}
                                onClick={() => toggleAddon(addon.id)}
                                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                                    isSelected
                                        ? "border-amber-500 bg-zinc-900/80 shadow-md shadow-amber-500/5"
                                        : "border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900"
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {/* Custom Interactive Switch */}
                                            <div
                                                className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-300 flex items-center ${
                                                    isSelected ? "bg-amber-500" : "bg-zinc-800"
                                                }`}
                                            >
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full bg-black transition-transform duration-300 transform ${
                                                        isSelected ? "translate-x-3.5" : "translate-x-0"
                                                    }`}
                                                />
                                            </div>
                                            <h5 className="font-extrabold text-xs text-white group-hover:text-amber-200 transition-colors">
                                                {isId ? addon.nameId : addon.nameEn}
                                            </h5>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 leading-normal min-h-[36px]">
                                        {isId ? addon.descId : addon.descEn}
                                    </p>
                                </div>
                                <div className="flex items-baseline justify-between border-t border-white/5 pt-2.5">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">
                                        {addon.interval === "monthly" ? (isId ? "Bulanan" : "Monthly") : (isId ? "Sekali Bayar" : "One-Time")}
                                    </span>
                                    <span className="font-bold text-xs text-amber-500">
                                        {isId ? formatCurrency(addon.priceIdr, "IDR") : formatCurrency(addon.priceUsd, "USD")}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
 
            {/* Bagian III: Floating Sticky Bottom Summary Bar (Premium UX) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-zinc-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl z-40 animate-hero-fade-up">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-zinc-400 shrink-0">
                        {isId ? "Estimasi Investasi" : "Investment Estimate"}
                    </div>
                    <div>
                        <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">
                            {isId ? "Paket aktif: " : "Base tier: "}
                            <strong className="text-white font-black">{isId ? activePackage.nameId : activePackage.nameEn}</strong>
                            {selectedAddonObjects.length > 0 && ` + ${selectedAddonObjects.length} Add-on`}
                        </span>
                        <span className="text-2xl font-black text-amber-500 tracking-tight leading-none block mt-0.5">
                            {isId ? formatCurrency(totalIdr, "IDR") : formatCurrency(totalUsd, "USD")}
                            {selectedAddonObjects.some((a) => a.interval === "monthly") && (
                                <span className="text-[9px] text-zinc-500 lowercase ml-1">
                                    {isId ? "(termasuk biaya bulanan)" : "(includes SLA retainer)"}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
 
                <button
                    onClick={handleCTA}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group cursor-pointer w-full sm:w-auto text-xs uppercase tracking-wider"
                >
                    <span>{isId ? "Mulai Konsultasi Paket" : "Configure Selected Package"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
            
        </div>
    );
}
