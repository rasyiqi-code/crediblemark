"use client";

import { useState } from "react";
import { Check, ArrowRight, ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

    // 1. Definisikan 3 Paket WordPress
    const packagesList: WPPackage[] = [
        {
            id: "custom",
            nameEn: "Custom Builder",
            nameId: "Custom Builder",
            descEn: "Website built using standard page builders (Elementor/Divi) and ready-made themes. Focused on speed of delivery and functional requirements.",
            descId: "Website dibuat dengan page builder standar (Elementor/Divi) dan tema siap pakai. Fokus pada kecepatan peluncuran dan pemenuhan fungsi bisnis.",
            priceIdr: 7500000,
            priceUsd: 500,
            featuresEn: [
                "Page Builder Integration (Elementor/Divi)",
                "Pre-made Theme Adaptation",
                "Standard Plugins Configuration",
                "Mobile & Tablet Responsive",
                "Basic Security Hardening",
                "1-Month Support Warranty"
            ],
            featuresId: [
                "Integrasi Page Builder (Elementor/Divi)",
                "Adaptasi Tema Siap Pakai",
                "Konfigurasi Plugin Standar",
                "Responsif Seluler & Tablet",
                "Pengerasan Keamanan Dasar",
                "Garansi Dukungan 1 Bulan"
            ]
        },
        {
            id: "eksklusif",
            nameEn: "Eksklusif Bespoke",
            nameId: "Eksklusif Bespoke",
            descEn: "Bespoke clean-code theme created from scratch. Zero heavy page builders, zero bloatware, optimized for maximum Lighthouse speeds & long-term maintenance.",
            descId: "Tema kustom clean-code yang dirancang dari nol. Bebas page builder berat, zero bloatware, dioptimalkan untuk kecepatan Lighthouse ekstrim & pemeliharaan jangka panjang.",
            priceIdr: 15000000,
            priceUsd: 1000,
            featuresEn: [
                "Bespoke UI/UX Layout from Scratch",
                "95+ Mobile Lighthouse Speed Score",
                "Clean Code (No heavy page builders)",
                "Lightweight Blocks / Gutenberg Customization",
                "Hardened Multi-layer Security",
                "3-Month Dedicated Support Warranty"
            ],
            featuresId: [
                "Desain UI/UX Kustom dari Nol",
                "Skor Kecepatan Lighthouse Mobile 95+",
                "Clean Code (Bebas builder berat)",
                "Kustomisasi Blok Ringan / Gutenberg",
                "Pengerasan Keamanan Berlapis",
                "Garansi Dukungan Khusus 3 Bulan"
            ]
        },
        {
            id: "headless",
            nameEn: "Headless Enterprise",
            nameId: "Headless Enterprise",
            descEn: "WordPress murni as Headless API backend, dipasangkan dengan frontend Next.js/React yang dihosting terpisah. Menjamin keamanan mutlak dan performa tak tertandingi.",
            descId: "WordPress murni sebagai backend Headless API, dipadukan dengan frontend Next.js/React yang dihosting secara terpisah. Keamanan mutlak dan performa puncak.",
            priceIdr: 27500000,
            priceUsd: 1800,
            featuresEn: [
                "Next.js / React Frontend Architecture",
                "Headless WordPress API Integration",
                "Sub-second Load Times (Static Site Generation)",
                "Absolute Database Isolation (Immune to WP exploits)",
                "Enterprise GraphQL / REST API setup",
                "6-Month Priority SLA Support"
            ],
            featuresId: [
                "Arsitektur Frontend Next.js / React",
                "Integrasi Headless WordPress API",
                "Kecepatan Pemuatan Sub-Detik (SSG)",
                "Isolasi Database Mutlak (Aman dari exploit WP)",
                "Setup API GraphQL / REST Enterprise",
                "Garansi SLA Prioritas 6 Bulan"
            ]
        }
    ];

    // 2. Definisikan Add-ons (Menghilangkan WooCommerce, menggantinya dengan Bespoke E-Commerce)
    const addonsList: Addon[] = [
        {
            id: "bespoke-ecommerce",
            nameEn: "Bespoke E-Commerce Engine",
            nameId: "Sistem Toko Online Kustom",
            descEn: "Bespoke transactional and cart system built from scratch (no WooCommerce) with secure checkout and local gateway integrations.",
            descId: "Sistem keranjang belanja dan transaksi kustom yang dirancang dari nol (tanpa WooCommerce) dengan checkout aman dan integrasi payment gateway lokal.",
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
    const [showAddonsMobile, setShowAddonsMobile] = useState(false);
    const [showSummaryMobile, setShowSummaryMobile] = useState(false);
    const [openAddonDetails, setOpenAddonDetails] = useState<string[]>([]);

    const toggleAddonDetail = (addonId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenAddonDetails((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
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
        
        const subject = encodeURIComponent(isId ? `Pemesanan WordPress - Paket ${packageName}` : `WordPress Service Order - ${packageName}`);
        const bodyText = isId
            ? `Halo, saya tertarik dengan layanan pembuatan WordPress.\n\nDetail Paket:\n- Paket Utama: Paket ${packageName}\n- Add-ons Terpilih: ${addonNames || "Tidak ada"}\n- Estimasi Investasi: ${formatCurrency(totalIdr, "IDR")}`
            : `Hello, I'm interested in the WordPress Development Service.\n\nPackage Details:\n- Chosen Package: ${packageName} Package\n- Selected Addons: ${addonNames || "None"}\n- Estimated Investment: ${formatCurrency(totalUsd, "USD")}`;

        const message = encodeURIComponent(bodyText);
        router.push(`/${locale}/contact?subject=${subject}&message=${message}`);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            
            {/* 1. Selector Tipe Paket (Segmented Control iOS/Tesla Style) */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 text-center md:text-left">
                    {isId ? "1. Pilih Tipe Paket Layanan:" : "1. Choose Your Package Tier:"}
                </h4>
                <div className="bg-zinc-950 border border-white/5 p-1 rounded-xl flex w-full relative z-10 gap-1">
                    {packagesList.map((pkg) => {
                        const isActive = pkg.id === selectedPackageId;
                        return (
                            <button
                                key={pkg.id}
                                onClick={() => setSelectedPackageId(pkg.id)}
                                className={`relative flex-1 text-center py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 focus:outline-none cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    isActive
                                        ? "bg-brand-yellow text-black shadow-md shadow-brand-yellow/10"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                            >
                                <span>{isId ? pkg.nameId : pkg.nameEn}</span>
                                {pkg.id === "eksklusif" && (
                                    <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                        isActive ? "bg-black text-brand-yellow" : "bg-brand-yellow text-black"
                                    }`}>
                                        {isId ? "Rekomendasi" : "Recommended"}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Aksi Konfigurasi & Add-ons khusus Mobile (di bawah Selector Tipe Paket) */}
            <div className="md:hidden space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* Tombol Toggle Add-ons */}
                    <button
                        type="button"
                        onClick={() => setShowAddonsMobile(!showAddonsMobile)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
                            showAddonsMobile ? "border-brand-yellow bg-zinc-900" : "border-white/5 bg-zinc-950 hover:bg-zinc-900"
                        }`}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            {isId ? "Tambah Add-on" : "Add-ons"}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${showAddonsMobile ? "rotate-180 text-brand-yellow" : ""}`} />
                    </button>

                    {/* Tombol Lihat Rincian & Harga */}
                    <button
                        type="button"
                        onClick={() => setShowSummaryMobile(true)}
                        className="bg-brand-yellow hover:bg-yellow-400 text-black font-extrabold p-4 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-brand-yellow/10 flex items-center justify-center gap-1.5 cursor-pointer text-[10px] uppercase tracking-wider text-center"
                    >
                        <span>{isId ? "Lihat Harga" : "View Pricing"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Daftar Add-ons Collapsible khusus Mobile */}
                {showAddonsMobile && (
                    <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            {isId ? "Pilih Add-ons Opsional:" : "Select Optional Add-ons:"}
                        </h5>
                        {addonsList.map((addon) => {
                            const selected = selectedAddons.includes(addon.id);
                            const isDetailOpen = openAddonDetails.includes(addon.id);
                            return (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`group relative rounded-xl border p-3 flex justify-between gap-3 cursor-pointer transition-all duration-300 transform active:scale-[0.99] ${
                                            isDetailOpen ? "items-start" : "items-center"
                                        } ${
                                            selected
                                                ? "border-brand-yellow/50 bg-zinc-900"
                                                : "border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900"
                                        }`}
                                    >
                                        <div className={`flex gap-2.5 ${isDetailOpen ? "items-start" : "items-center"}`}>
                                            <div
                                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                                    isDetailOpen ? "mt-0.5" : ""
                                                } ${
                                                    selected
                                                        ? "bg-brand-yellow border-brand-yellow scale-110"
                                                        : "border-zinc-700 bg-transparent group-hover:border-zinc-500 scale-100"
                                                }`}
                                            >
                                                {selected && <Check className="w-2.5 h-2.5 text-black stroke-[3] animate-in zoom-in-50 duration-150" />}
                                            </div>
                                            <div>
                                                <h6 className="font-bold text-xs text-white group-hover:text-yellow-200 transition-colors">
                                                    {isId ? addon.nameId : addon.nameEn}
                                                </h6>
                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleAddonDetail(addon.id, e)}
                                                    className="text-[9px] text-brand-yellow hover:text-brand-yellow/80 underline mt-1 block cursor-pointer"
                                                >
                                                {openAddonDetails.includes(addon.id)
                                                    ? (isId ? "Sembunyikan Detail" : "Hide Details")
                                                    : (isId ? "Lihat Detail" : "View Details")}
                                            </button>
                                            {openAddonDetails.includes(addon.id) && (
                                                <p className="text-[10px] text-zinc-500 mt-1.5 leading-snug animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {isId ? addon.descId : addon.descEn}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-bold text-xs text-white block">
                                            {isId ? formatCurrency(addon.priceIdr, "IDR") : formatCurrency(addon.priceUsd, "USD")}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-wider text-zinc-500 block mt-1">
                                            {addon.interval === "monthly" ? (isId ? "/ bln" : "/ mo") : (isId ? "sekali" : "once")}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 2. Grid Konfigurasi & Total */}
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2 md:pt-3">
                
                {/* Kolom Kiri: Detail Paket Terpilih & Add-ons */}
                <div className="lg:col-span-7 space-y-4 md:space-y-5">
                    
                    {/* Deskripsi Paket Aktif */}
                    <div className="rounded-2xl border border-white/5 bg-zinc-900 p-5 sm:p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-mono font-bold text-brand-yellow bg-brand-yellow/10 px-2 py-1 rounded">
                                    {isId ? "PAKET AKTIF" : "ACTIVE TIER"}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-white">
                                    {isId ? activePackage.nameId : activePackage.nameEn}
                                </h3>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                                    {isId ? "Investasi Dasar:" : "Base Investment:"}
                                </span>
                                <span className="text-xl font-black text-brand-yellow">
                                    {isId ? formatCurrency(activePackage.priceIdr, "IDR") : formatCurrency(activePackage.priceUsd, "USD")}
                                </span>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                            {isId ? activePackage.descId : activePackage.descEn}
                        </p>

                        <div className="pt-1">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                {isId ? "Fitur Bawaan Paket:" : "Included Features:"}
                            </h5>
                            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                                {(isId ? activePackage.featuresId : activePackage.featuresEn).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                                        <div className="w-4 h-4 rounded-full bg-brand-yellow/15 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-brand-yellow" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Selector Add-ons (Hanya muncul di Desktop) */}
                    <div className="hidden md:block space-y-3 border-t border-white/5 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            {isId ? "2. Tambahkan Add-ons Opsional:" : "2. Select Optional Add-ons:"}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {addonsList.map((addon) => {
                                const selected = selectedAddons.includes(addon.id);
                                const isDetailOpen = openAddonDetails.includes(addon.id);
                                return (
                                        <div
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`group relative rounded-2xl border p-3.5 flex justify-between gap-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] ${
                                                isDetailOpen ? "items-start" : "items-center"
                                            } ${
                                                selected
                                                    ? "border-brand-yellow/50 bg-zinc-900 shadow-md"
                                                    : "border-white/5 bg-zinc-950 hover:border-white/10 hover:bg-zinc-900"
                                            }`}
                                        >
                                            <div className={`flex gap-3 ${isDetailOpen ? "items-start" : "items-center"}`}>
                                                <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                                        isDetailOpen ? "mt-0.5" : ""
                                                    } ${
                                                        selected
                                                            ? "bg-brand-yellow border-brand-yellow scale-110"
                                                            : "border-zinc-700 bg-transparent group-hover:border-zinc-500 scale-100"
                                                    }`}
                                                >
                                                    {selected && <Check className="w-3.5 h-3.5 text-black stroke-[3] animate-in zoom-in-50 duration-150" />}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-xs sm:text-sm text-white group-hover:text-yellow-200 transition-colors">
                                                        {isId ? addon.nameId : addon.nameEn}
                                                    </h5>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleAddonDetail(addon.id, e)}
                                                        className="text-[10px] text-brand-yellow hover:text-brand-yellow/80 underline mt-1 block cursor-pointer"
                                                    >
                                                    {openAddonDetails.includes(addon.id)
                                                        ? (isId ? "Sembunyikan Detail" : "Hide Details")
                                                        : (isId ? "Lihat Detail" : "View Details")}
                                                </button>
                                                {openAddonDetails.includes(addon.id) && (
                                                    <p className="text-[11px] text-zinc-500 mt-1.5 leading-normal max-w-md animate-in fade-in slide-in-from-top-1 duration-200">
                                                        {isId ? addon.descId : addon.descEn}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-bold text-xs sm:text-sm text-white block">
                                                {isId ? formatCurrency(addon.priceIdr, "IDR") : formatCurrency(addon.priceUsd, "USD")}
                                            </span>
                                            <span className="text-[8px] uppercase tracking-wider text-zinc-500 block mt-1">
                                                {addon.interval === "monthly" ? (isId ? "/ bln" : "/ mo") : (isId ? "sekali" : "one-time")}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Rincian Harga & Panggilan Aksi */}
                <div className="hidden md:block lg:col-span-5 border-t border-white/5 lg:border-t-0 lg:border-l lg:border-white/5 lg:pl-8 pt-6 lg:pt-0 sticky top-24">
                    <div className="rounded-2xl bg-zinc-900 border border-white/5 p-5 sm:p-6 space-y-5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            {isId ? "3. Rincian Investasi" : "3. Investment Summary"}
                        </h4>

                        <div className="space-y-4">
                            {/* Harga Paket Dasar */}
                            <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 border-b border-white/5 pb-2">
                                <span className="truncate max-w-[150px] sm:max-w-none">
                                    {isId ? activePackage.nameId : activePackage.nameEn} (Base)
                                </span>
                                <span className="font-bold text-white">
                                    {isId ? formatCurrency(activePackage.priceIdr, "IDR") : formatCurrency(activePackage.priceUsd, "USD")}
                                </span>
                            </div>

                            {/* Daftar Add-ons */}
                            {selectedAddonObjects.length > 0 && (
                                <div className="space-y-1.5 border-b border-white/5 pb-2">
                                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 block">
                                        ADD-ONS:
                                    </span>
                                    {selectedAddonObjects.map((addon) => (
                                        <div key={addon.id} className="flex items-center justify-between text-xs text-zinc-400">
                                            <span className="truncate max-w-[150px]">{isId ? addon.nameId : addon.nameEn}</span>
                                            <span className="font-medium text-white">
                                                {isId ? formatCurrency(addon.priceIdr, "IDR") : formatCurrency(addon.priceUsd, "USD")}
                                                {addon.interval === "monthly" && (isId ? "/bln" : "/mo")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total Biaya */}
                            <div className="flex items-baseline justify-between pt-2">
                                <span className="text-sm sm:text-base font-bold text-white">Total</span>
                                <div className="text-right">
                                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-brand-yellow">
                                        {isId ? formatCurrency(totalIdr, "IDR") : formatCurrency(totalUsd, "USD")}
                                    </span>
                                    {selectedAddonObjects.some((a) => a.interval === "monthly") && (
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mt-1">
                                            {isId ? "*Termasuk biaya bulanan SLA" : "*Includes monthly SLA retainer"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleCTA}
                            className="w-full bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-12 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-yellow/20 flex items-center justify-center gap-2 group cursor-pointer text-sm"
                        >
                            <span>{isId ? "Mulai Konsultasi Paket" : "Consult Selected Package"}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>

                        <p className="text-[10px] text-zinc-500 text-center leading-normal">
                            {isId
                                ? "Pembayaran mengikuti termin milestone standar agensi (50% Down Payment + 50% Pelunasan)."
                                : "Payments are structured in milestone increments (50% Deposit + 50% Sign-off)."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Bottom Sheet untuk Rincian Investasi di Mobile */}
            {showSummaryMobile && (
                <div className="fixed inset-0 z-50 md:hidden flex items-end justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowSummaryMobile(false)}
                    />
                    
                    {/* Content Panel */}
                    <div className="relative w-full max-h-[85vh] bg-zinc-950 border-t border-white/10 rounded-t-3xl p-4 pb-5 overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Drag Handle Indicator */}
                        <div className="mx-auto w-10 h-1 rounded-full bg-zinc-800" />
                        
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                {isId ? "Rincian Investasi" : "Investment Summary"}
                            </h4>
                            <button 
                                type="button"
                                onClick={() => setShowSummaryMobile(false)}
                                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Harga Paket Dasar */}
                            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/5 pb-2">
                                <span className="truncate">
                                    {isId ? activePackage.nameId : activePackage.nameEn} (Base)
                                </span>
                                <span className="font-bold text-white">
                                    {isId ? formatCurrency(activePackage.priceIdr, "IDR") : formatCurrency(activePackage.priceUsd, "USD")}
                                </span>
                            </div>

                            {/* Daftar Add-ons */}
                            {selectedAddonObjects.length > 0 && (
                                <div className="space-y-1.5 border-b border-white/5 pb-2">
                                    <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-zinc-500 block">
                                        ADD-ONS:
                                    </span>
                                    {selectedAddonObjects.map((addon) => (
                                        <div key={addon.id} className="flex items-center justify-between text-xs text-zinc-400">
                                            <span className="truncate max-w-[200px]">{isId ? addon.nameId : addon.nameEn}</span>
                                            <span className="font-medium text-white">
                                                {isId ? formatCurrency(addon.priceIdr, "IDR") : formatCurrency(addon.priceUsd, "USD")}
                                                {addon.interval === "monthly" && (isId ? "/bln" : "/mo")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total Biaya */}
                            <div className="flex items-baseline justify-between pt-1">
                                <span className="text-xs font-bold text-white">Total</span>
                                <div className="text-right">
                                    <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-yellow">
                                        {isId ? formatCurrency(totalIdr, "IDR") : formatCurrency(totalUsd, "USD")}
                                    </span>
                                    {selectedAddonObjects.some((a) => a.interval === "monthly") && (
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                                            {isId ? "*Termasuk biaya bulanan SLA" : "*Includes monthly SLA retainer"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowSummaryMobile(false);
                                handleCTA();
                            }}
                            className="w-full bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer text-xs"
                        >
                            <span>{isId ? "Mulai Konsultasi Paket" : "Consult Selected Package"}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>

                        <p className="text-[9px] text-zinc-500 text-center leading-normal">
                            {isId
                                ? "Pembayaran mengikuti termin milestone standar agensi (50% Down Payment + 50% Pelunasan)."
                                : "Payments are structured in milestone increments (50% Deposit + 50% Sign-off)."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
