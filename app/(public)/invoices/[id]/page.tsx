export const dynamic = "force-dynamic";

import { prisma } from "@/lib/config/db";
import { getSystemSettings } from "@/lib/server/settings";
import { notFound } from "next/navigation";
import { InvoiceClientWrapper } from "@/components/invoice/invoice-client-wrapper";
import { ExtendedEstimate } from "@/lib/shared/types";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { paymentService } from "@/lib/server/payment-service";
import type { InvoiceOrder } from "@/types/payment";
import { getTranslations } from "next-intl/server";
import { Metadata, ResolvingMetadata } from "next";
import { getSettingValue } from "@/lib/server/settings";

type InvoicePageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

// Halaman invoice bersifat private — noindex + OG image global
export async function generateMetadata(
    _props: InvoicePageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const agencyName = await getSettingValue("AGENCY_NAME", "Crediblemark");
    const previousImages = (await parent).openGraph?.images || [];
    return {
        title: `Invoice | ${agencyName}`,
        robots: "noindex, nofollow",
        openGraph: { images: previousImages },
        twitter: { images: previousImages },
    };
}

async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            project: {
                include: {
                    service: true,
                    estimate: {
                        include: { service: true }
                    }
                }
            }
        }
    });
}

export default async function PublicInvoicePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { params } = props;
    const { id } = await params;
    const t = await getTranslations("Invoice");

    const searchParams = (props.searchParams) ? await props.searchParams : {};
    const token = searchParams.token as string | undefined;

    // Auth Guard / Fetch User
    const user = await hexclaveServerApp.getUser().catch(() => null);
    const order = await getOrder(id);

    if (!order) notFound();

    const isOwner = user?.id === order.userId;
    // Allow if owner OR if token matches (for public sharing)
    const isAuthorized = isOwner || (token && token === order.snapToken);

    if (!isAuthorized) {
        // Render simple forbidden or 404 to block access
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
                    <p className="text-zinc-400">{t("noPermission")}</p>
                </div>
            </div>
        );
    }

    const isPaid = order.status === 'settled' || order.status === 'paid';

    // Construct ExtendedEstimate from Order Data
    // We assume the project has an estimate attached
    const estimateData = order.project?.estimate;

    if (!estimateData) {
        return <div>{t("dataIncomplete")}</div>;
    }

    const extendedEstimate: ExtendedEstimate = {
        ...estimateData,
        screens: (estimateData.screens as unknown) as ExtendedEstimate['screens'],
        apis: (estimateData.apis as unknown) as ExtendedEstimate['apis'],
        service: estimateData.service
    };

    // ⚡ Bolt Optimization: Standardize service costs to USD
    // 🎯 Why: To avoid double conversion and ensure consistency when the service was originally in IDR
    if (extendedEstimate.service?.currency === 'IDR') {
        // Use order's exchange rate if available, otherwise get current rate
        const rate = (order.exchangeRate && order.exchangeRate > 1)
            ? order.exchangeRate
            : (await paymentService.convertToIDR(1)).rate;

        // HEURISTIC: Detect legacy mismatched data where USD amount was saved as IDR (e.g. 2014 IDR instead of 32jt)
        const isLegacyMismatched = extendedEstimate.totalCost < 5000;

        // Avoid division by zero
        if (rate > 0) {
            if (!isLegacyMismatched) {
                extendedEstimate.totalCost = extendedEstimate.totalCost / rate;
                if (extendedEstimate.service) {
                    extendedEstimate.service.price = extendedEstimate.service.price / rate;
                }
            }

            // Populate order exchange rate if it was missing/invalid for consistency in client components
            if (!order.exchangeRate || order.exchangeRate <= 1) {
                (order as Record<string, unknown>).exchangeRate = rate;
            }

            // Normalize currency to USD to avoid double conversion in InvoiceDocument
            if (extendedEstimate.service) {
                extendedEstimate.service.currency = 'USD';
            }
        }
    }

    // User data for InvoiceDocument
    // If user is logged in and matches the order owner, use their details. 
    // Otherwise fallback to generic client.

    // User data for InvoiceDocument
    // Priority: 1. Manual Client Name from Project, 2. Account Display Name (if owner & NOT offline), 3. Fallback
    const isOffline = order.userId === 'OFFLINE' || !!order.project?.clientName;

    const userData = {
        displayName: order.project?.clientName || (isOwner && !isOffline ? user?.displayName : null) || "Valued Client",
        email: (isOwner && !isOffline ? user?.primaryEmail : null) || "",
    };

    // Fetch System Settings for Bank and Agency
    // ⚡ Bolt Optimization: Use getSystemSettings (which utilizes unstable_cache) instead of direct prisma query.
    // 🎯 Why: Reduces redundant database queries for static system settings during SSR, mitigating the N+1 query problem.
    // 📊 Impact: Faster page load and reduced DB connections.
    const [settings, gatewayStatus] = await Promise.all([
        getSystemSettings(['bank_name', 'bank_account', 'bank_holder', 'manual_payment_active', 'AGENCY_NAME', 'COMPANY_NAME', 'CONTACT_ADDRESS', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'CONTACT_TELEGRAM']),
        paymentGatewayService.getGatewayStatus()
    ]);
    const hasActiveGateway = gatewayStatus.midtrans;
    const getSetting = (key: string) => settings.find(s => s.key === key)?.value;

    const isManualActive = getSetting('manual_payment_active') === 'true';
    const bankDetails = isManualActive ? {
        bank_name: getSetting('bank_name'),
        bank_account: getSetting('bank_account'),
        bank_holder: getSetting('bank_holder')
    } : undefined;

    const agencySettings = {
        agencyName: getSetting('AGENCY_NAME') || "Crediblemark",
        companyName: getSetting('COMPANY_NAME') || "Crediblemark",
        address: getSetting('CONTACT_ADDRESS') || "Tech Valley, Cyberjaya\nSelangor, Malaysia 63000",
        email: getSetting('CONTACT_EMAIL') || "billing@crediblemark.com",
        phone: getSetting('CONTACT_PHONE'),
        telegram: getSetting('CONTACT_TELEGRAM')
    };

    return (
        <div className="selection:bg-lime-500/30">
            <div className="container mx-auto px-4 pt-2 pb-6 sm:pt-4 sm:pb-12 md:pt-6 md:pb-16 max-w-7xl">



                <InvoiceClientWrapper
                    order={order as unknown as InvoiceOrder}
                    estimate={extendedEstimate}
                    user={userData}
                    isPaid={isPaid}
                    bankDetails={bankDetails}
                    agencySettings={agencySettings}
                    hasActiveGateway={hasActiveGateway}
                    gatewayStatus={gatewayStatus}
                />
            </div>
        </div>
    );
}
