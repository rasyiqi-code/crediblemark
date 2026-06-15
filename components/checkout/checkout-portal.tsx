"use client";

import { useRef, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductShowcase } from "./product-showcase";
import { PaymentPanel } from "./payment-panel";
import { CheckoutStickyBar } from "./checkout-sticky-bar";
import { InvoiceDocument, type AgencyInvoiceSettings } from "@/components/checkout/invoice-document";
import { useCurrency } from "@/components/providers/currency-provider";
import { ExtendedEstimate, ServiceAddon } from "@/lib/shared/types";

import type { BankDetails } from "@/types/payment";
import { useReactToPrint } from "react-to-print";
import { cleanSummaryText } from "@/lib/shared/utils";

export function CheckoutPortal({
    estimate,
    bankDetails,
    activeRate,
    user,
    agencySettings,
    hasActiveGateway = true,
    gatewayStatus,
    defaultPaymentType,
    projectPaidAmount = 0,
    projectTotalAmount = 0,
    orderId,
    initialOrderStatus
}: {
    estimate: ExtendedEstimate,
    bankDetails: BankDetails | undefined,
    activeRate: number,
    user: { displayName: string | null, email: string | null },
    agencySettings?: AgencyInvoiceSettings,
    hasActiveGateway?: boolean,
    gatewayStatus?: { midtrans: boolean },
    defaultPaymentType?: "FULL" | "DP" | "REPAYMENT",
    projectPaidAmount?: number;
    projectTotalAmount?: number;
    orderId?: string | null;
    initialOrderStatus?: string;
}) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { currency, rate } = useCurrency();
    const locale = useLocale();
    const isId = locale === 'id';
    const router = useRouter();
    const t = useTranslations("Checkout");

    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(orderId || null);
    const [activeOrderStatus, setActiveOrderStatus] = useState<string>(initialOrderStatus || "pending");
    const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(() => 
        initialOrderStatus ? initialOrderStatus !== "pending" : false
    );
    const [shouldSubscribe, setShouldSubscribe] = useState(true);

    const [globalAddons, setGlobalAddons] = useState<ServiceAddon[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>([]);
    const [trueBaseCost, setTrueBaseCost] = useState(estimate.totalCost);
    const hasInitializedAddons = useRef(false);

    useEffect(() => {
        fetch("/api/addons")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted: ServiceAddon[] = data.map((addon: any) => ({
                        id: addon.id,
                        name: isId ? (addon.name_id || addon.name) : addon.name,
                        price: addon.price,
                        currency: addon.currency,
                        interval: addon.interval
                    }));
                    setGlobalAddons(formatted);

                    // Deteksi addon yang awalnya terpilih berdasarkan teks di summary
                    if (!hasInitializedAddons.current) {
                        const initiallySelected = formatted.filter((addon) => {
                            const rawAddon = data.find(d => d.id === addon.id);
                            const enName = rawAddon?.name;
                            return enName && estimate.summary.includes(`+ ${enName}`);
                        });
                        setSelectedAddons(initiallySelected);
                        
                        const initiallySelectedTotal = initiallySelected.reduce((sum: number, a) => sum + (a.price || 0), 0);
                        setTrueBaseCost(estimate.totalCost - initiallySelectedTotal);
                        hasInitializedAddons.current = true;
                    }
                }
            })
            .catch(err => console.error("Failed to load global addons:", err));
    }, [isId, estimate.summary, estimate.totalCost]);

    // Menghubungkan state activeOrderStatus dengan initialOrderStatus jika ada pembaruan dari server
    useEffect(() => {
        if (initialOrderStatus) {
            setActiveOrderStatus(initialOrderStatus);
        }
    }, [initialOrderStatus]);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${estimate.id}`
    });

    // Polling status transaksi di background ketika Order ID aktif terisi dengan safety exponential backoff
    useEffect(() => {
        if (!activeOrderId || estimate.status === 'paid') return;
        // Hanya lakukan polling jika berstatus waiting_verification ATAU pembayaran telah diinisiasi oleh user
        if (activeOrderStatus !== 'waiting_verification' && !isPaymentInitiated) return;

        let timerId: NodeJS.Timeout;
        let delay = 10000; // Mulai polling dari 10 detik untuk efisiensi

        const checkStatus = async () => {
            if (document.hidden) {
                timerId = setTimeout(checkStatus, delay);
                return;
            }
            try {
                const res = await fetch(`/api/payment/status?orderId=${activeOrderId}&mode=json`);
                const data = await res.json();

                if (data.status === 'waiting_verification') {
                    setActiveOrderStatus('waiting_verification');
                } else if (data.status === 'paid' || data.status === 'settled') {
                    router.refresh();
                    return; // Hentikan polling jika sudah lunas
                }

                // Tingkatkan delay secara eksponensial (maksimal 30 detik)
                delay = Math.min(delay * 1.5, 30000);
            } catch (error) {
                console.error("Gagal melakukan polling status pembayaran:", error);
            }
            timerId = setTimeout(checkStatus, delay);
        };

        timerId = setTimeout(checkStatus, delay);

        return () => clearTimeout(timerId);
    }, [activeOrderId, activeOrderStatus, isPaymentInitiated, estimate.status, router]);

    // Efek untuk memantau status lunas (Selesai) guna pengalihan ke Invoice publik
    useEffect(() => {
        if (estimate.status === 'paid' && activeOrderId && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [estimate.status, activeOrderId, countdown]);

    useEffect(() => {
        if (countdown <= 0 && estimate.status === 'paid' && activeOrderId) {
            router.push(`/invoices/${activeOrderId}`);
        }
    }, [countdown, estimate.status, activeOrderId, router]);

    const addonsTotal = selectedAddons.reduce((sum: number, addon) => sum + (addon.price || 0), 0);
    const baseTotal = trueBaseCost + addonsTotal;

    // Reconstruct the summary for the dynamic estimate
    const addonsMarker = "\n\nAdd-ons Selected at Checkout:";
    const cleanSummary = cleanSummaryText(estimate.summary);
    
    let currentAddonsSummary = "";
    if (selectedAddons.length > 0) {
        currentAddonsSummary = addonsMarker;
        selectedAddons.forEach((addon) => {
            const currencySymbol = addon.currency === 'IDR' ? 'Rp' : '$';
            currentAddonsSummary += `\n- + ${addon.name} (${currencySymbol}${addon.price} ${addon.interval === "monthly" ? "Monthly" : addon.interval === "yearly" ? "Yearly" : "One-time"})`;
        });
    }

    const dynamicEstimate = {
        ...estimate,
        totalCost: baseTotal,
        summary: cleanSummary + currentAddonsSummary
    };

    const isPaid = estimate.status === 'paid';


    const [paymentType, setPaymentType] = useState<"FULL" | "DP" | "REPAYMENT">(defaultPaymentType || "FULL");
    const baseCurrency = ((estimate.service as unknown as Record<string, unknown>)?.currency as "USD" | "IDR") || 'USD';

    // Hitung nominal harga berdasarkan tipe pembayaran
    let amountToPay = baseTotal;
    if (paymentType === "DP") {
        amountToPay = baseTotal * 0.5;
    } else if (paymentType === "REPAYMENT") {
        const total = projectTotalAmount && projectTotalAmount > 0 ? projectTotalAmount : baseTotal;
        const paid = projectPaidAmount || 0;
        amountToPay = Math.max(0, total - paid);
    }

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    estimateId: estimate.id,
                    amount: amountToPay,
                    title: estimate.title,
                    paymentType: paymentType,
                    currency: currency,
                    selectedAddons: selectedAddons,
                    shouldSubscribe: shouldSubscribe
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                const errorMessage = err.error || err.message || JSON.stringify(err);
                toast.error(`${t("failProcess")}: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            const { orderId: newOrderId } = await response.json();

            setActiveOrderId(newOrderId);
            toast.success(t("toastCheckoutSuccess"));
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full">
            {/* Main Portal Container: Menyatu langsung dengan latar belakang (borderless & backgroundless) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10 min-h-[500px]">
                
                {/* Left Side: Product Showcase (lg:col-span-5) */}
                <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-white/5">
                    <ProductShowcase 
                        estimate={estimate}
                        selectedAddons={selectedAddons}
                    />
                </div>

                {/* Right Side: Payment configurator & Gateway selector (lg:col-span-7) */}
                <div className="lg:col-span-6">
                    <PaymentPanel 
                        estimate={estimate}
                        onPaymentInitiated={() => setIsPaymentInitiated(true)}
                        onPaymentClosed={() => setIsPaymentInitiated(false)} // Matikan pengecekan status jika kembali ke pilihan metode pembayaran
                        onPaymentStatusChange={(status) => setActiveOrderStatus(status)} // Pemicu perubahan status pada UI
                        amountToPay={amountToPay}
                        paymentType={paymentType}
                        onChangePaymentType={setPaymentType}
                        bankDetails={bankDetails}
                        hasActiveGateway={hasActiveGateway}
                        gatewayStatus={gatewayStatus}
                        defaultPaymentType={defaultPaymentType}
                        user={user}
                        activeOrderId={activeOrderId}
                        onChangeActiveOrderId={setActiveOrderId}
                        activeOrderStatus={activeOrderStatus}
                        countdown={countdown}
                        selectedAddons={selectedAddons}
                        globalAddons={globalAddons}
                        onToggleAddon={(addon) => {
                            setSelectedAddons(prev => 
                                prev.some(a => a.name === addon.name)
                                    ? prev.filter(a => a.name !== addon.name)
                                    : [...prev, addon]
                            );
                        }}
                        agencySettings={agencySettings}
                        shouldSubscribe={shouldSubscribe}
                        onToggleSubscribe={() => setShouldSubscribe(prev => !prev)}
                    />
                </div>
            </div>

            {/* Sticky Bottom Bar untuk ringkasan spesifikasi proyek dan aksi utama */}
            <CheckoutStickyBar
                amountToPay={amountToPay}
                baseCurrency={baseCurrency}
                selectedAddonsCount={selectedAddons.length}
                activeOrderId={activeOrderId}
                isProcessing={isProcessing}
                onPrint={handlePrint}
                onCheckout={handleCheckout}
                isPaid={isPaid}
                isId={isId}
            />

            {/* Hidden Invoice for Printing */}
            <div className="hidden">
                <div className="bg-white">
                    <InvoiceDocument
                        refAction={invoiceRef}
                        estimate={dynamicEstimate}
                        user={user}
                        isPaid={estimate.status === 'paid'}
                        agencySettings={agencySettings}
                        currency={currency}
                        exchangeRate={rate || activeRate}
                        bankDetails={bankDetails}
                        orderId={activeOrderId}
                        selectedAddons={selectedAddons}
                    />
                </div>
            </div>
        </div>
    );
}
