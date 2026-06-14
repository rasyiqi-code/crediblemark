"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Key, CreditCard, ArrowRight, X } from "lucide-react";

interface SystemAlertsClientProps {
    aiConfigured: boolean;
    gatewayConfigured: boolean;
}

export function SystemAlertsClient({ aiConfigured, gatewayConfigured }: SystemAlertsClientProps) {
    const [isDismissed, setIsDismissed] = useState(true); // Default true untuk menghindari layout shift sebelum memeriksa localStorage
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            const dismissedUntil = localStorage.getItem("system-alerts-dismissed-until");
            if (dismissedUntil) {
                const expireTime = parseInt(dismissedUntil, 10);
                if (Date.now() < expireTime) {
                    setIsDismissed(true);
                    return;
                }
            }
            setIsDismissed(false);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        const oneDayMs = 24 * 60 * 60 * 1000;
        localStorage.setItem("system-alerts-dismissed-until", (Date.now() + oneDayMs).toString());
        setIsDismissed(true);
    };

    if (!mounted || isDismissed) {
        return null;
    }

    return (
        <div className="w-full bg-amber-950/10 border border-amber-500/20 rounded-2xl p-5 mb-6 backdrop-blur-md shadow-xl shadow-amber-950/5 relative group">
            {/* Tombol Tutup Peringatan */}
            <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-amber-500/50 hover:text-amber-500 p-1.5 rounded-full hover:bg-amber-500/10 transition-all cursor-pointer"
                aria-label="Tutup peringatan"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Header Box Peringatan */}
            <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4 mb-4 pr-8">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-amber-500 tracking-wide">
                        Konfigurasi Sistem Belum Lengkap
                    </h2>
                    <p className="text-xs text-amber-500/60 mt-0.5">
                        Beberapa fitur penting dinonaktifkan atau berjalan dalam mode terbatas. Harap selesaikan konfigurasi di bawah ini.
                    </p>
                </div>
            </div>

            {/* Daftar Peringatan */}
            <div className="flex flex-col gap-4">
                {/* Peringatan AI API Key */}
                {!aiConfigured && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:border-amber-500/20 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5 shrink-0">
                                <Key className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-500">
                                    Google AI API Key Belum Aktif
                                </h3>
                                <p className="text-xs text-amber-500/70 mt-1 leading-relaxed">
                                    Fitur Customer Support dan Price Estimator saat ini <strong>offline</strong> untuk pelanggan karena tidak ada Google AI API Key yang aktif di sistem.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 self-end sm:self-center">
                            <Link
                                href="/admin/system/keys"
                                className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20"
                            >
                                Atur AI Key
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Peringatan Payment Gateway */}
                {!gatewayConfigured && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:border-amber-500/20 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5 shrink-0">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-500">
                                    Gateway Pembayaran Belum Aktif
                                </h3>
                                <p className="text-xs text-amber-500/70 mt-1 leading-relaxed">
                                    Midtrans belum dikonfigurasi secara lengkap. Pelanggan akan dialihkan ke metode pembayaran <strong>transfer bank manual</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 self-end sm:self-center">
                            <Link
                                href="/admin/system/payment"
                                className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20"
                            >
                                Atur Gateway
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
