export const dynamic = "force-dynamic";

import { CheckoutPortal } from "@/components/checkout/checkout-portal";
import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { notFound, redirect } from "next/navigation";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { ExtendedEstimate } from "@/lib/shared/types";
import { SystemSetting } from "@prisma/client";
import { getSystemSettings } from "@/lib/server/settings";
import { MidtransScript } from "@/components/payment/midtrans/script-loader";
import { Metadata, ResolvingMetadata } from "next";
import { getSettingValue } from "@/lib/server/settings";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Halaman checkout bersifat private — noindex + OG image global
export async function generateMetadata(
    _props: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const agencyName = await getSettingValue("AGENCY_NAME", "Crediblemark");
    const previousImages = (await parent).openGraph?.images || [];
    return {
        title: `Checkout | ${agencyName}`,
        robots: "noindex, nofollow",
        openGraph: { images: previousImages },
        twitter: { images: previousImages },
    };
}

/**
 * Halaman Checkout Unified.
 * Menangani checkout Service/Estimate (via Estimate ID) untuk Agensi Jasa.
 */
export default async function CheckoutPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const searchParams = await props.searchParams;
    const paymentType = typeof searchParams.paymentType === 'string' ? (searchParams.paymentType as "FULL" | "DP" | "REPAYMENT") : undefined;

    const { paymentService } = await import("@/lib/server/payment-service");
    const activeRate = await paymentService.getExchangeRate();

    // Pastikan user sudah login
    const user = await hexclaveServerApp.getUser().catch(() => null);

    if (!user) {
        redirect(`/handler/sign-in?after_auth_return_to=${encodeURIComponent(`/checkout/${id}`)}`);
    }
    // Cari data Estimate
    const estimate = await prisma.estimate.findUnique({
        where: { id },
        include: { service: true, project: true }
    });

    if (estimate) {
        // Ambil pengaturan sistem
        const settings = await getSystemSettings(['bank_name', 'bank_account', 'bank_holder', 'manual_payment_active', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM']);

        const getSetting = (key: string) => settings.find((s: SystemSetting) => s.key === key)?.value;

        const gatewayStatus = await paymentGatewayService.getGatewayStatus();
        const hasActiveGateway = gatewayStatus.midtrans;

        const isManualActive = getSetting('manual_payment_active') === 'true';
        const bankDetails = isManualActive ? {
            bank_name: getSetting('bank_name'),
            bank_account: getSetting('bank_account'),
            bank_holder: getSetting('bank_holder')
        } : undefined;

        const agencySettings = {
            agencyName: getSetting('AGENCY_NAME') || "Crediblemark",
            companyName: getSetting('COMPANY_NAME') || "Crediblemark",
            address: getSetting('CONTACT_ADDRESS') || "Tech Valley\nCyberjaya, Malaysia",
            email: getSetting('CONTACT_EMAIL') || "billing@Crediblemark.com",
            phone: getSetting('CONTACT_PHONE'),
            telegram: getSetting('CONTACT_TELEGRAM')
        };

        // Konstruksi ExtendedEstimate
        const extendedEstimate: ExtendedEstimate = {
            ...estimate,
            screens: (estimate.screens as unknown) as ExtendedEstimate['screens'],
            apis: (estimate.apis as unknown) as ExtendedEstimate['apis'],
            service: estimate.service ? {
                ...estimate.service,
                priceType: (estimate.title.includes("Draft Quote") || estimate.title.startsWith("Quote:")) ? "STARTING_AT" : (estimate.service as Record<string, unknown>).priceType as string
            } : null
        };

        // Detail data user untuk invoice
        const userData = {
            displayName: estimate.project?.clientName || user?.displayName || "Valued Client",
            email: "",
        };

        if (estimate.project?.userId) {
            if (estimate.project.userId === 'OFFLINE') {
                const emailMatch = estimate.summary.match(/\(([^)]+)\)/);
                if (emailMatch) {
                    userData.email = emailMatch[1];
                }
            } else if (estimate.project.userId !== user?.id) {
                try {
                    const owner = await hexclaveServerApp.getUser(estimate.project.userId);
                    if (owner) {
                        userData.displayName = owner.displayName || owner.primaryEmail || estimate.project.clientName || "Valued Client";
                        userData.email = owner.primaryEmail || "";
                    }
                } catch (e) {
                    console.error("Gagal mengambil data pemilik estimasi untuk invoice:", e);
                }
            } else {
                userData.email = user.primaryEmail || "";
            }
        } else {
            userData.email = user?.primaryEmail || "";
        }

        // Ambil status awal pesanan
        let initialOrderStatus = "pending";
        if (estimate.project?.invoiceId) {
            const orderObj = await prisma.order.findUnique({
                where: { id: estimate.project.invoiceId },
                select: { status: true }
            });
            if (orderObj) {
                initialOrderStatus = orderObj.status;
            }
        }

        return (
            <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-0 pb-4 md:py-8 w-full">
                    <CheckoutPortal
                        estimate={extendedEstimate}
                        bankDetails={bankDetails}
                        activeRate={activeRate}
                        user={userData}
                        agencySettings={agencySettings}
                        hasActiveGateway={hasActiveGateway}
                        gatewayStatus={gatewayStatus}
                        defaultPaymentType={paymentType}
                        projectPaidAmount={estimate.project?.paidAmount || 0}
                        projectTotalAmount={estimate.project?.totalAmount || estimate.totalCost}
                        orderId={estimate.project?.invoiceId}
                        initialOrderStatus={initialOrderStatus}
                    />
                </div>
                {/* Memuat script pembayaran Midtrans untuk halaman checkout */}
                <MidtransScript />
            </div>
        );
    }

    // 3. Jika ID tidak ditemukan di Product maupun Estimate -> 404
    notFound();
}
