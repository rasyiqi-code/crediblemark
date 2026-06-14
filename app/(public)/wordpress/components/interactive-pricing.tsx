"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFloatingChat } from "@/lib/store/floating-chat-store";

// Tipe data untuk Paket WordPress
interface WPPackage {
    id: "custom" | "eksklusif" | "headless";
    nameEn: string;
    nameId: string;
    descEn: string;
    descId: string;
    priceIdr: number;
    priceUsd: number;
    featuresEn: string[];
    featuresId: string[];
}

// Tipe data untuk Addon
interface Addon {
    id: string;
    nameEn: string;
    nameId: string;
    descEn: string;
    descId: string;
    priceIdr: number;
    priceUsd: number;
    interval: "one_time" | "monthly";
}

interface InteractivePricingProps {
    locale: string;
}

export function InteractivePricing({ locale }: InteractivePricingProps) {
    const isId = locale === "id";
    const router = useRouter();
    const { setIsMenuOpen, setDefaultInput } = useFloatingChat();

    // 1. Definisikan 3 Paket WordPress
    const packagesList: WPPackage[] = [
        {
            id: "custom",
            nameEn: "Custom Builder",
            nameId: "Custom Builder",
            descEn: "Website built using standard page builders (Elementor/Divi) and ready-made themes. Ideal for standard business sites.",
            descId: "Website dibuat dengan page builder standar (Elementor/Divi) dan tema siap pakai. Ideal untuk situs bisnis standar.",
            priceIdr: 7500000,
            priceUsd: 500,
            featuresEn: [
                "Page Builder Integration",
                "Pre-made Theme Adaptation",
                "Standard Plugins Config",
                "Mobile & Tablet Responsive",
                "Basic Security Hardening"
            ],
            featuresId: [
                "Integrasi Page Builder",
                "Adaptasi Tema Siap Pakai",
                "Konfigurasi Plugin Standar",
                "Responsif Seluler & Tablet",
                "Pengerasan Keamanan Dasar"
            ]
        },
        {
            id: "eksklusif",
            nameEn: "Eksklusif Bespoke",
            nameId: "Eksklusif Bespoke",
            descEn: "Bespoke clean-code theme created from scratch. Zero heavy page builders, optimized for maximum speed & stability.",
            descId: "Tema kustom clean-code yang dirancang dari nol. Bebas builder berat, dioptimalkan untuk kecepatan & stabilitas maksimal.",
            priceIdr: 15000000,
            priceUsd: 1000,
            featuresEn: [
                "Bespoke UI/UX Layout from Scratch",
                "95+ Mobile Lighthouse Score",
                "Clean Code (No heavy builders)",
                "Lightweight Gutenberg Blocks",
                "Hardened Multi-layer Security"
            ],
            featuresId: [
                "Desain UI/UX Kustom dari Nol",
                "Skor Lighthouse Mobile 95+",
                "Clean Code (Bebas builder berat)",
                "Kustomisasi Blok Gutenberg",
                "Pengerasan Keamanan Berlapis"
            ]
        },
        {
            id: "headless",
            nameEn: "Headless Enterprise",
            nameId: "Headless Enterprise",
            descEn: "WordPress as Headless API backend, paired with external Next.js/React frontend. Absolute security and performance.",
            descId: "WordPress sebagai Headless API backend, dipadukan dengan frontend Next.js/React eksternal. Keamanan & performa mutlak.",
            priceIdr: 27500000,
            priceUsd: 1800,
            featuresEn: [
                "Next.js / React Frontend Architecture",
                "Headless WordPress API Integration",
                "Sub-second Load Times (SSG)",
                "Absolute Database Isolation",
                "Enterprise GraphQL / REST API setup"
            ],
            featuresId: [
                "Arsitektur Frontend Next.js / React",
                "Integrasi Headless WordPress API",
                "Kecepatan Pemuatan Sub-Detik (SSG)",
                "Isolasi Database Mutlak",
                "Setup API GraphQL / REST Enterprise"
            ]
        }
    ];

    // 2. Definisikan Add-ons
    const addonsList: Addon[] = [
        {
            id: "bespoke-ecommerce",
            nameEn: "Bespoke E-Commerce Engine",
            nameId: "Sistem Toko Online Kustom",
            descEn: "Transactional system built from scratch (no WooCommerce) with secure checkout and local gateway integration.",
            descId: "Sistem transaksi kustom yang dirancang dari nol (tanpa WooCommerce) dengan checkout aman dan integrasi payment gateway lokal.",
            priceIdr: 10000000,
            priceUsd: 700,
            interval: "one_time",
        },
        {
            id: "custom-plugin",
            nameEn: "Custom Plugin Development",
            nameId: "Pembuatan Plugin Kustom",
            descEn: "Build tailored features and third-party CRM integrations for your specific operational needs.",
            descId: "Buat fitur khusus dan integrasi CRM pihak ketiga sesuai kebutuhan operasional spesifik Anda.",
            priceIdr: 6500000,
            priceUsd: 450,
            interval: "one_time",
        },
        {
            id: "maintenance",
            nameEn: "Priority Monthly SLA",
            nameId: "Pemeliharaan Bulanan Prioritas",
            descEn: "Monthly security patches, core updates, database backups, and small styling updates.",
            descId: "Tambalan keamanan bulanan, pembaruan core, cadangan database, dan revisi gaya tampilan minor.",
            priceIdr: 750000,
            priceUsd: 50,
            interval: "monthly",
        },
    ];

    const [selectedPackageId, setSelectedPackageId] = useState<"custom" | "eksklusif" | "headless">("eksklusif");
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

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
            ? `Halo, saya tertarik dengan layanan pembuatan WordPress.\n\nDetail Paket:\n- Paket Utama: Paket ${packageName}\n- Add-ons Terpilih: ${addonNames || "Tidak ada"}\n- Estimasi Investasi: ${formatCurrency(totalIdr, "IDR")}\n\n${currentUrl}`
            : `Hello, I'm interested in the WordPress Development Service.\n\nPackage Details:\n- Chosen Package: ${packageName} Package\n- Selected Addons: ${addonNames || "None"}\n- Estimated Investment: ${formatCurrency(totalUsd, "USD")}\n\n${currentUrl}`;

        setDefaultInput(bodyText);
        setIsMenuOpen(true);
    };

    return (
        <div className="space-y-12 pb-24 relative">
            
            {/* Bagian I: Perbandingan 3 Paket Utama (3-Card Layout) */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 text-center md:text-left">
                    {isId ? "1. Pilih Tipe Paket Utama:" : "1. Select Base Service Tier:"}
                </h4>
                
                <div className="flex overflow-x-auto md:overflow-visible gap-4 pb-4 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:pb-0">
                    {packagesList.map((pkg) => {
                        const isActive = pkg.id === selectedPackageId;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackageId(pkg.id)}
                                className={`relative rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 transform w-[85vw] max-w-[320px] md:w-full md:max-w-full shrink-0 snap-align-start hover:scale-[1.01] ${
                                    isActive
                                        ? "border-brand-yellow bg-zinc-900 shadow-xl shadow-brand-yellow/5 ring-1 ring-brand-yellow"
                                        : "border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900/60"
                                }`}
                            >
                                {pkg.id === "eksklusif" && (
                                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-yellow text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1 shadow">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        {isId ? "Rekomendasi" : "Recommended"}
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    {/* Header Paket */}
                                    <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                                        <h5 className="font-extrabold text-base text-white">
                                            {isId ? pkg.nameId : pkg.nameEn}
                                        </h5>
                                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                                            {pkg.id === "custom" && "Builder"}
                                            {pkg.id === "eksklusif" && "Bespoke"}
                                            {pkg.id === "headless" && "Headless"}
                                        </span>
                                    </div>
                                    
                                    {/* Harga Paket */}
                                    <div>
                                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                                            {isId ? "Investasi Mulai Dari" : "Investment Starts At"}
                                        </span>
                                        <span className="font-black text-xl md:text-2xl text-brand-yellow block">
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
                                                    <div className="w-3.5 h-3.5 rounded-full bg-brand-yellow/10 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Check className="w-2.5 h-2.5 text-brand-yellow" />
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
                                                ? "bg-brand-yellow text-black hover:bg-yellow-400"
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
                                        ? "border-brand-yellow bg-zinc-900/80 shadow-md shadow-brand-yellow/5"
                                        : "border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900"
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {/* Custom Interactive Switch */}
                                            <div
                                                className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-300 flex items-center ${
                                                    isSelected ? "bg-brand-yellow" : "bg-zinc-800"
                                                }`}
                                            >
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full bg-black transition-transform duration-300 transform ${
                                                        isSelected ? "translate-x-3.5" : "translate-x-0"
                                                    }`}
                                                />
                                            </div>
                                            <h5 className="font-extrabold text-xs text-white group-hover:text-yellow-200 transition-colors">
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
                                    <span className="font-bold text-xs text-brand-yellow">
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
                        <span className="text-2xl font-black text-brand-yellow tracking-tight leading-none block mt-0.5">
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
                    className="bg-brand-yellow hover:bg-yellow-400 text-black font-extrabold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-yellow/20 flex items-center justify-center gap-2 group cursor-pointer w-full sm:w-auto text-xs uppercase tracking-wider"
                >
                    <span>{isId ? "Mulai Konsultasi Paket" : "Configure Selected Package"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
            
        </div>
    );
}
