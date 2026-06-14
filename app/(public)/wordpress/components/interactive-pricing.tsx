"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

    // Daftar add-ons yang tersedia
    const addonsList: Addon[] = [
        {
            id: "woocommerce",
            nameEn: "WooCommerce E-Commerce",
            nameId: "E-Commerce WooCommerce",
            descEn: "Full online store capabilities with product catalog and secure payment gateway.",
            descId: "Fitur toko online lengkap dengan katalog produk dan gerbang pembayaran aman.",
            priceIdr: 4500000,
            priceUsd: 300,
            interval: "one_time",
        },
        {
            id: "custom-plugin",
            nameEn: "Custom Plugin Development",
            nameId: "Pembuatan Plugin Kustom",
            descEn: "Build tailored features and third-party CRM integrations for your specific needs.",
            descId: "Buat fitur khusus dan integrasi CRM pihak ketiga sesuai kebutuhan spesifik Anda.",
            priceIdr: 6500000,
            priceUsd: 450,
            interval: "one_time",
        },
        {
            id: "maintenance",
            nameEn: "Priority Monthly SLA",
            nameId: "Pemeliharaan Bulanan Prioritas",
            descEn: "Monthly security patch, database backups, uptime checks, and content tweaks.",
            descId: "Tambalan keamanan bulanan, cadangan database, cek uptime, dan revisi konten minor.",
            priceIdr: 750000,
            priceUsd: 50,
            interval: "monthly",
        },
    ];

    const basePriceIdr = 12500000;
    const basePriceUsd = 850;

    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    const toggleAddon = (addonId: string) => {
        setSelectedAddons((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
    };

    // Hitung total harga
    const selectedAddonObjects = addonsList.filter((a) => selectedAddons.includes(a.id));
    const totalIdr = basePriceIdr + selectedAddonObjects.reduce((sum, a) => sum + a.priceIdr, 0);
    const totalUsd = basePriceUsd + selectedAddonObjects.reduce((sum, a) => sum + a.priceUsd, 0);

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
        const addonNames = selectedAddonObjects.map(a => isId ? a.nameId : a.nameEn).join(", ");
        const subject = encodeURIComponent(isId ? "Pemesanan Jasa Pembuatan WordPress" : "WordPress Service Order Inquiry");
        const bodyText = isId
            ? `Halo, saya tertarik dengan layanan pembuatan WordPress Premium.\n\nDetail Paket:\n- Paket Utama: WordPress Premium Launchpad\n- Add-ons Terpilih: ${addonNames || "Tidak ada"}\n- Estimasi Investasi: ${formatCurrency(totalIdr, "IDR")}`
            : `Hello, I'm interested in the Premium WordPress Development Service.\n\nPackage Details:\n- Main Package: WordPress Premium Launchpad\n- Selected Addons: ${addonNames || "None"}\n- Estimated Investment: ${formatCurrency(totalUsd, "USD")}`;

        const message = encodeURIComponent(bodyText);
        router.push(`/${locale}/contact?subject=${subject}&message=${message}`);
    };

    return (
        <div className="relative rounded-3xl border border-white/10 bg-zinc-950/40 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-violet-600/30">
                {isId ? "Populer" : "Popular"}
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
                {/* Kolom Kiri: Ringkasan Paket Utama */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            WordPress Premium Launchpad
                        </h3>
                        <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                            {isId
                                ? "Website WordPress berkinerja tinggi, aman, dan dirancang khusus untuk memperkuat kredibilitas bisnis Anda secara instan tanpa template lambat."
                                : "High-performance, secure, and custom-designed WordPress websites built to elevate your business presence instantly with zero bloated templates."}
                        </p>
                    </div>

                    <div className="border-t border-white/5 pt-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
                            {isId ? "Fitur Bawaan Standar:" : "Standard Features Included:"}
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {(isId
                                ? [
                                      "Desain UI/UX Kustom",
                                      "Kecepatan Mobile 90+ (LCP)",
                                      "Arsitektur Siap SEO & Analitik",
                                      "Proteksi Keamanan & Anti-Spam",
                                      "100% Hak Akses Administrator",
                                      "Garansi & Dukungan 3 Bulan",
                                  ]
                                : [
                                      "Bespoke UI/UX Design",
                                      "90+ Mobile Speed (LCP)",
                                      "SEO-Optimized & Analytics",
                                      "Hardened Security & Spam Shield",
                                      "100% Full Admin Access",
                                      "3-Month Warranty & Support",
                                  ]
                            ).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-violet-400" />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Konfigurator Add-ons */}
                    <div className="border-t border-white/5 pt-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
                            {isId ? "Sesuaikan dengan Fitur Add-ons:" : "Customize with Add-ons:"}
                        </h4>
                        <div className="space-y-4">
                            {addonsList.map((addon) => {
                                const selected = selectedAddons.includes(addon.id);
                                return (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`group relative rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-all duration-300 ${
                                            selected
                                                ? "border-violet-500/50 bg-violet-500/5 shadow-md shadow-violet-500/5"
                                                : "border-white/5 bg-zinc-900/20 hover:border-white/10 hover:bg-zinc-900/40"
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                    selected
                                                        ? "bg-violet-600 border-violet-600"
                                                        : "border-zinc-700 bg-transparent group-hover:border-zinc-500"
                                                }`}
                                            >
                                                {selected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors">
                                                    {isId ? addon.nameId : addon.nameEn}
                                                </h5>
                                                <p className="text-xs text-zinc-500 mt-1 leading-normal max-w-md">
                                                    {isId ? addon.descId : addon.descEn}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-bold text-sm text-white block">
                                                {isId ? formatCurrency(addon.priceIdr, "IDR") : formatCurrency(addon.priceUsd, "USD")}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mt-0.5">
                                                {addon.interval === "monthly" ? (isId ? "/ bulan" : "/ mo") : (isId ? "sekali" : "one-time")}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Perkiraan Biaya Investasi */}
                <div className="lg:col-span-5 border-l border-white/5 lg:pl-12 pt-8 lg:pt-0 space-y-6">
                    <div className="rounded-2xl bg-zinc-900/30 border border-white/5 p-6 space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                            {isId ? "Estimasi Investasi" : "Investment Summary"}
                        </h4>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-zinc-400 border-b border-white/5 pb-3">
                                <span>WordPress Premium Launchpad</span>
                                <span className="font-medium text-white">
                                    {isId ? formatCurrency(basePriceIdr, "IDR") : formatCurrency(basePriceUsd, "USD")}
                                </span>
                            </div>

                            {selectedAddonObjects.length > 0 && (
                                <div className="space-y-2 border-b border-white/5 pb-3">
                                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 block">
                                        Add-ons:
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

                            <div className="flex items-baseline justify-between pt-2">
                                <span className="text-base font-bold text-white">Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black tracking-tight text-brand-yellow">
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

                        <button
                            onClick={handleCTA}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-12 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            <span>{isId ? "Mulai Konsultasi" : "Start Consultation"}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>

                        <p className="text-[11px] text-zinc-500 text-center leading-normal">
                            {isId
                                ? "Pembayaran diproses secara bertahap (DP 50% di awal + 50% setelah serah terima proyek)."
                                : "Payments are split into milestones (50% upfront deposit + 50% on project sign-off)."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
