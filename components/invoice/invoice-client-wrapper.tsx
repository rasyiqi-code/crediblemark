"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceDocument, type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";
import { PaymentSelector } from "@/components/payment/payment-selector";
import { ExtendedEstimate } from "@/lib/shared/types";
import type { MidtransPaymentData, BankDetails } from "@/types/payment";
import { useReactToPrint } from "react-to-print";

interface InvoiceClientWrapperProps {
    order: {
        id: string;
        amount: number;
        status: string;
        type: string; // Added type for DP/Repayment check
        currency: string;
        exchangeRate: number;
        projectId: string | null;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        paymentMetadata: MidtransPaymentData | null;
        project: {
            id: string;
            title: string;
            service?: {
                id: string;
                title: string;
            } | null;
        } | null;
    };
    estimate: ExtendedEstimate;
    user: {
        displayName: string;
        email: string;
        phone?: string;
    };
    isPaid: boolean;
    bankDetails?: BankDetails;
    agencySettings?: AgencyInvoiceSettings;
    hasActiveGateway?: boolean;
    gatewayStatus?: { midtrans: boolean };
}

import { useTranslations, useLocale } from "next-intl";

export function InvoiceClientWrapper({ order, estimate, user, isPaid, bankDetails, agencySettings, hasActiveGateway = true, gatewayStatus }: InvoiceClientWrapperProps) {
    const t = useTranslations("Invoice");
    const tc = useTranslations("Checkout");
    const locale = useLocale();
    const isId = locale === 'id';
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // State untuk memantau apakah pembayaran telah diinisiasi oleh user
    const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(() =>
        order.status ? order.status !== "pending" : false
    );

    // State lokal untuk memantau status pesanan (diperlukan untuk update UI instan)
    const [orderStatus, setOrderStatus] = useState<string>(order.status);
    const [prevOrderStatus, setPrevOrderStatus] = useState<string>(order.status);

    if (order.status !== prevOrderStatus) {
        setPrevOrderStatus(order.status);
        setOrderStatus(order.status);
    }

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.clientWidth;
                if (parentWidth < 800) {
                    setScale(parentWidth / 800);
                } else {
                    setScale(1);
                }
            }
        };

        updateScale();
        const observer = new ResizeObserver(() => {
            updateScale();
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        window.addEventListener('resize', updateScale);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    useEffect(() => {
        if (isPaid) return;
        // Hanya lakukan polling jika statusnya waiting_verification atau jika pembayaran telah diinisiasi oleh user
        if (orderStatus !== 'waiting_verification' && !isPaymentInitiated) return;

        const interval = setInterval(async () => {
            if (document.hidden) return;
            try {
                const res = await fetch(`/api/payment/status?orderId=${order.id}&mode=json`);
                const data = await res.json();

                if (data.status === 'paid' || data.status === 'settled') {
                    router.refresh();
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaid, order.id, router, orderStatus, isPaymentInitiated]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice-${order.id}`
    });

    // HEURISTIC: Detect legacy mismatched data where USD amount was saved as IDR (e.g. 2014 IDR instead of 32jt)
    // If currency is IDR and amount is suspiciously small (e.g. < 5000), it's probably USD labeled as IDR
    const isLegacyMismatched = order.currency === 'IDR' && order.amount < 5000;

    // Selalu gunakan currency dan exchange rate asli dari order agar nominal faktur konsisten dan tidak berubah-ubah mengikuti kurs real-time
    const effectiveCurrency = order.currency;
    const effectiveRate = order.exchangeRate;

    // Normalize amount to base USD first for reliable conversion
    const baseAmountUSD = isLegacyMismatched || order.currency === 'USD'
        ? order.amount
        : order.amount / (order.exchangeRate || 1);

    const displayAmount = effectiveCurrency === 'IDR' ? Math.ceil(baseAmountUSD * effectiveRate) : baseAmountUSD;

    return (
        <div className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-8 animate-in fade-in duration-500">

            {/* Invoice Document Card A4 */}
            <div 
                ref={containerRef}
                className="bg-white text-black rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.3)] border border-white/5 overflow-hidden w-full relative"
                style={{ height: `${1130 * scale}px` }}
            >
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: '800px',
                        height: '1130px',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}
                >
                    <InvoiceDocument
                        refAction={componentRef}
                        estimate={estimate}
                        user={user}
                        isPaid={isPaid}
                        agencySettings={agencySettings}
                        paymentType={order.type}
                        currency={effectiveCurrency}
                        exchangeRate={effectiveRate}
                        bankDetails={bankDetails}
                        orderId={order.id}
                    />
                </div>
            </div>


            {/* Status & Payment Action Panel */}
            {orderStatus !== 'waiting_verification' && (
                <div className="space-y-6 pt-2">
                    {/* Status & Summary Box */}
                    <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em] block">
                                {t('status')}
                            </span>
                            <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-bold text-zinc-400">
                                    #{(() => {
                                        const parts = order.id.split("-");
                                        return `CM${parts[parts.length - 1]}`;
                                    })()}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                    {isPaid ? t('paid') : t('unpaid')}
                                </span>
                                {(order.type === 'DP' || order.type === 'REPAYMENT') && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-zinc-800 text-zinc-400 border-zinc-700">
                                        {order.type === 'DP' ? tc('dp') : tc('repayment')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isPaid && (hasActiveGateway || bankDetails) && (
                            <div className="flex flex-col sm:items-end gap-0.5">
                                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em]">
                                    {tc('totalToPay')}
                                </span>
                                <span className="text-xl font-mono font-black text-brand-yellow">
                                    {new Intl.NumberFormat(effectiveCurrency === 'IDR' ? 'id-ID' : 'en-US', { style: 'currency', currency: effectiveCurrency }).format(displayAmount)}
                                </span>
                            </div>
                        )}

                        {isPaid && (
                            <Button
                                onClick={handlePrint}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-9 px-4.5 flex items-center gap-2 rounded-xl cursor-pointer text-xs"
                            >
                                <Download className="w-3.5 h-3.5" />
                                {t('downloadPrint')}
                            </Button>
                        )}
                    </div>



                    {/* Payment Selector Widget */}
                    {!isPaid && (hasActiveGateway || bankDetails) && (
                        <div className="space-y-3 pt-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block pl-1">
                                {isId ? "Pilih Metode Pembayaran" : "Select Payment Method"}
                            </span>
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
                                <PaymentSelector
                                    orderId={order.id}
                                    amount={displayAmount}
                                    paymentMetadata={order.paymentMetadata}
                                    currency={effectiveCurrency as 'USD' | 'IDR'}
                                    allowedGroups={undefined}
                                    bankDetails={bankDetails}
                                    orderStatus={orderStatus}
                                    contactWA={agencySettings?.phone}
                                    contactTele={agencySettings?.telegram}
                                    hasActiveGateway={hasActiveGateway}
                                    gatewayStatus={gatewayStatus}
                                    noCard={true}
                                    onPaymentInitiated={() => setIsPaymentInitiated(true)}
                                    onPaymentClosed={() => setIsPaymentInitiated(false)}
                                    onPaymentStatusChange={(status) => setOrderStatus(status)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}


