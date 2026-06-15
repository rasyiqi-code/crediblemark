"use client";

import { CheckCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExtendedEstimate, ServiceAddon } from "@/lib/shared/types";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTranslations } from "next-intl";
import { PaymentSelector } from "@/components/payment/payment-selector";
import { type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";

export function PaymentPanel({
    estimate,
    amountToPay,
    paymentType,
    onChangePaymentType,
    bankDetails,
    hasActiveGateway = true,
    gatewayStatus,
    defaultPaymentType,
    user,
    activeOrderId,
    onChangeActiveOrderId,
    activeOrderStatus,
    countdown,
    selectedAddons = [],
    globalAddons = [],
    onToggleAddon,
    agencySettings,
    onPaymentInitiated,
    onPaymentClosed,
    onPaymentStatusChange,
    shouldSubscribe,
    onToggleSubscribe,
    _leftHeight
}: {
    estimate: ExtendedEstimate,
    bankDetails?: { bank_name?: string, bank_account?: string, bank_holder?: string } | null,
    amountToPay: number,
    paymentType: "FULL" | "DP" | "REPAYMENT",
    onChangePaymentType: (type: "FULL" | "DP" | "REPAYMENT") => void,
    hasActiveGateway?: boolean,
    gatewayStatus?: { midtrans: boolean },
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    user?: { displayName: string | null, email: string | null },
    activeOrderId: string | null,
    onChangeActiveOrderId: (orderId: string | null) => void,
    activeOrderStatus: string,
    countdown: number,
    selectedAddons?: ServiceAddon[],
    globalAddons?: ServiceAddon[],
    onToggleAddon?: (addon: ServiceAddon) => void,
    agencySettings?: AgencyInvoiceSettings,
    onPaymentInitiated?: () => void,
    onPaymentClosed?: () => void,
    onPaymentStatusChange?: (status: string) => void,
    shouldSubscribe?: boolean,
    onToggleSubscribe?: () => void,
    _leftHeight?: number | null
}) {
    const t = useTranslations("Checkout");
    const ti = useTranslations("Invoice");
    const tc = useTranslations("Common");

    const { currency } = useCurrency();

    // Get available addons from global pool
    const serviceAddons = globalAddons;

    // Menggunakan bankDetails secara langsung karena agencySettings tidak memiliki informasi rekening bank
    const formattedBankDetails = bankDetails ? {
        bank_name: bankDetails.bank_name || undefined,
        bank_account: bankDetails.bank_account || undefined,
        bank_holder: bankDetails.bank_holder || undefined
    } : undefined;

    const isPaid = estimate.status === 'paid';

    // 1. Tampilan jika transaksi sudah lunas (PAID)
    if (isPaid) {
        return (
            <div className="w-full text-center space-y-8 py-16 animate-in fade-in zoom-in duration-700 max-w-md mx-auto">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center mb-2">
                        <CheckCircle className="w-10 h-10 text-brand-yellow" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-yellow tracking-tighter">
                        {t("confirmed")}
                    </h2>
                    <p className="text-brand-yellow/60 text-sm max-w-xs mx-auto">
                        {t("confirmedDesc")}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="inline-block px-6 py-2 rounded-full bg-brand-yellow/5 border border-brand-yellow/10 text-xs font-bold text-brand-yellow/40 uppercase tracking-[0.2em]">
                        {t('transactionId')}: #{estimate.id.slice(-8).toUpperCase()}
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        {countdown > 0 && activeOrderId ? (
                            <div className="space-y-4">
                                <div className="text-8xl font-black text-brand-yellow tracking-tighter drop-shadow-[0_0_30px_rgba(254,215,0,0.3)]">
                                    {countdown}
                                </div>
                                <div className="text-[12px] font-black text-brand-yellow/40 uppercase tracking-[0.4em] animate-pulse">
                                    {t("redirectingToInvoice")}
                                </div>
                            </div>
                        ) : (
                            <div className="px-8 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold tracking-widest uppercase text-sm">
                                {t("paymentVerified")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Tampilan Form & Konfigurasi Aktif (Minecraft Server Style Redesign)
    return (
        <div className="h-full lg:h-[var(--left-height)] flex flex-col justify-between px-0 pt-0 pb-6 sm:p-8 sm:pr-0 lg:pl-12 lg:py-4 bg-transparent border-0 lg:overflow-hidden">
            
            {/* Scrollable Main Area */}
            <div className="space-y-6 flex-grow flex flex-col min-h-0">

                {/* Tombol Kembali ke step sebelumnya (hanya muncul saat sudah di step payment method) */}
                {activeOrderId && (
                    <button
                        onClick={() => onChangeActiveOrderId(null)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest group cursor-pointer bg-transparent border-0 p-0"
                    >
                        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        {tc("back")}
                    </button>
                )}

                {/* Tipe Pembayaran (DP vs FULL) - Selektor Paket Horizontal Minecraft Style */}
                <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                        {t("selectPaymentPlan")}
                    </span>
                    
                    {activeOrderId ? (
                        <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-md">
                            <span className="text-xs font-bold text-zinc-400">
                                {t("selectedPlan")}
                            </span>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-extrabold bg-white/10 text-white px-3.5 py-1.5 rounded-full border border-white/5">
                                    {paymentType === "FULL" ? t("fullPayment") : paymentType === "DP" ? t("dp") : t("repayment")}
                                </span>
                                <button
                                    onClick={() => onChangeActiveOrderId(null)}
                                    className="text-xs text-brand-yellow hover:text-yellow-300 font-bold transition-colors hover:underline bg-transparent border-0 cursor-pointer"
                                >
                                    {t("change")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        defaultPaymentType === 'REPAYMENT' ? (
                            <div className="p-3.5 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow text-sm font-bold text-center">
                                {t("repayment")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Option 1: Full Payment */}
                                <div 
                                    onClick={() => onChangePaymentType("FULL")}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-start gap-1 min-h-[82px] relative overflow-hidden group transform active:scale-[0.99] hover:scale-[1.005] ${
                                        paymentType === "FULL" 
                                            ? 'bg-gradient-to-r from-brand-yellow/[0.03] to-amber-500/[0.03] border-brand-yellow/50 shadow-[0_0_20px_rgba(254,215,0,0.08)] z-10' 
                                            : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                                    }`}
                                >
                                    <div className="pr-6">
                                        <span className={`text-xs font-bold transition-colors duration-300 ${paymentType === "FULL" ? 'text-brand-yellow font-extrabold' : 'text-zinc-200 group-hover:text-white'}`}>
                                            {t("fullPayment") || "Pembayaran Penuh"}
                                        </span>
                                    </div>
                                    <div className={`absolute top-0 right-0 w-5 h-5 rounded-tr-xl rounded-bl-lg border-b border-l flex items-center justify-center transition-all duration-300 ${
                                        paymentType === "FULL" 
                                            ? 'border-brand-yellow bg-brand-yellow/20 shadow-[0_0_10px_rgba(254,215,0,0.2)]' 
                                            : 'border-zinc-800 bg-zinc-950/80 group-hover:border-zinc-700'
                                    }`}>
                                        {paymentType === "FULL" && (
                                            <div className="w-2 h-2 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(254,215,0,1)] flex items-center justify-center">
                                                <Check className="w-1.5 h-1.5 text-black stroke-[3.5]" />
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[10px] font-medium leading-normal transition-colors duration-300 ${paymentType === "FULL" ? 'text-brand-yellow/60' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                        {t("fullPaymentDesc")}
                                    </p>
                                </div>

                                {/* Option 2: DP Payment */}
                                <div 
                                    onClick={() => onChangePaymentType("DP")}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-start gap-1 min-h-[82px] relative overflow-hidden group transform active:scale-[0.99] hover:scale-[1.005] ${
                                        paymentType === "DP" 
                                            ? 'bg-gradient-to-r from-brand-yellow/[0.03] to-amber-500/[0.03] border-brand-yellow/50 shadow-[0_0_20px_rgba(254,215,0,0.08)] z-10' 
                                            : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                                    }`}
                                >
                                    <div className="pr-6">
                                        <span className={`text-xs font-bold transition-colors duration-300 ${paymentType === "DP" ? 'text-brand-yellow font-extrabold' : 'text-zinc-200 group-hover:text-white'}`}>
                                            {t("dp") || "Pembayaran DP (50%)"}
                                        </span>
                                    </div>
                                    <div className={`absolute top-0 right-0 w-5 h-5 rounded-tr-xl rounded-bl-lg border-b border-l flex items-center justify-center transition-all duration-300 ${
                                        paymentType === "DP" 
                                            ? 'border-brand-yellow bg-brand-yellow/20 shadow-[0_0_10px_rgba(254,215,0,0.2)]' 
                                            : 'border-zinc-800 bg-zinc-950/80 group-hover:border-zinc-700'
                                    }`}>
                                        {paymentType === "DP" && (
                                            <div className="w-2 h-2 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(254,215,0,1)] flex items-center justify-center">
                                                <Check className="w-1.5 h-1.5 text-black stroke-[3.5]" />
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[10px] font-medium leading-normal transition-colors duration-300 ${paymentType === "DP" ? 'text-brand-yellow/60' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                        {t("dpDesc")}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Bill To Info */}
                {user && (
                    <div className="space-y-2.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                            {ti("billTo")}
                        </span>
                        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="text-sm font-bold text-white tracking-tight">{user.displayName || "Valued Client"}</div>
                                <div className="text-xs text-zinc-400 font-mono tracking-tight">{user.email}</div>
                            </div>
                            {!activeOrderId && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2.5 text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-lg border border-white/5" 
                                    onClick={() => window.location.href = '/handler/sign-in'}
                                >
                                    {t("change")}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Subscribe Checkbox */}
                {user && !activeOrderId && (
                    <div 
                        onClick={onToggleSubscribe}
                        className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 transform active:scale-[0.99] group ${
                            shouldSubscribe 
                                ? 'bg-brand-yellow/5 border-brand-yellow/30 shadow-[0_0_15px_rgba(254,215,0,0.04)]' 
                                : 'bg-zinc-950/40 border-white/5 hover:bg-zinc-950/70 hover:border-white/10'
                        }`}
                    >
                        <div className={`w-4.5 h-4.5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 ${
                            shouldSubscribe 
                                ? 'bg-brand-yellow border-brand-yellow text-black shadow-[0_0_8px_rgba(254,215,0,0.3)]' 
                                : 'border-zinc-700 group-hover:border-zinc-400'
                        }`}>
                            {shouldSubscribe && <Check className="w-3 h-3 stroke-[3px]" />}
                        </div>
                        <div className="flex flex-col gap-0.5 select-none">
                            <span className={`text-xs font-bold transition-colors ${shouldSubscribe ? 'text-brand-yellow' : 'text-zinc-200 group-hover:text-white'}`}>
                                {t("subscribeNewsletter")}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                                {t("subscribeNewsletterDesc")}
                            </span>
                        </div>
                    </div>
                )}

                {/* Konfigurasi Add-ons (Pemilihan checkbox dengan scroll independen) */}
                {!activeOrderId && serviceAddons && serviceAddons.length > 0 && (
                    <div className="space-y-2.5 flex-1 min-h-0 flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                            {t("configureAddons")}
                        </span>
                        {/* Memberikan scroll independen dengan tinggi yang otomatis menyesuaikan kolom kiri pada desktop (lg) */}
                        <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1 max-h-[250px] lg:max-h-none flex-grow min-h-0">
                            {serviceAddons.map((addon, i) => {
                                const isSelected = selectedAddons.some(a => a.name === addon.name);
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => onToggleAddon && onToggleAddon(addon)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform active:scale-[0.99] group ${
                                            isSelected 
                                                ? 'bg-brand-yellow/5 border-brand-yellow/30 shadow-[0_0_15px_rgba(254,215,0,0.04)]' 
                                                : 'bg-zinc-950/40 border-white/5 hover:bg-zinc-950/70 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4.5 h-4.5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                isSelected 
                                                    ? 'bg-brand-yellow border-brand-yellow text-black shadow-[0_0_8px_rgba(254,215,0,0.3)]' 
                                                    : 'border-zinc-700 group-hover:border-zinc-500'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                                            </div>
                                            <div>
                                                <div className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                                                    isSelected ? 'text-brand-yellow' : 'text-zinc-200 group-hover:text-white'
                                                }`}>
                                                    {addon.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-mono font-bold text-zinc-300">
                                                {addon.currency === 'IDR' ? 'Rp' : '$'} {addon.price.toLocaleString()}
                                            </span>
                                            {addon.interval && (
                                                <span className="text-[10px] text-zinc-500 font-medium ml-1">
                                                    {addon.interval === 'monthly' ? '/bln' : addon.interval === 'yearly' ? '/thn' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Gateway Payment Selector (Muncul secara dinamis setelah order id dibuat) */}
                {activeOrderId && (
                    <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block pl-1">
                            {t("selectPaymentMethod")}
                        </span>
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                            <PaymentSelector
                                orderId={activeOrderId}
                                amount={amountToPay}
                                currency={currency as 'USD' | 'IDR'}
                                bankDetails={formattedBankDetails}
                                orderStatus={activeOrderStatus}
                                contactWA={agencySettings?.phone}
                                contactTele={agencySettings?.telegram}
                                hasActiveGateway={hasActiveGateway}
                                gatewayStatus={gatewayStatus}
                                noCard={true}
                                onPaymentInitiated={onPaymentInitiated}
                                onPaymentClosed={onPaymentClosed}
                                onPaymentStatusChange={onPaymentStatusChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
