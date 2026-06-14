"use server";

import { prisma } from "@/lib/config/db";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { currencyService } from "@/lib/server/currency-service";
import { paymentGatewayService } from "@/lib/server/payment-gateway-service";
import { resetMidtransInstances } from "@/lib/integrations/midtrans";
import { revalidatePath, revalidateTag } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { getResendClient, getAdminEmailTarget, getSenderConfig } from "@/lib/email/client";

export async function getCurrencyConfig() {
    if (!await isAdmin()) throw new Error("Unauthorized");
    const [config, rates] = await Promise.all([
        currencyService.getConfig(),
        currencyService.getRates()
    ]);
    return {
        config: config || { apiKey: "", intervalHours: 24 },
        rates
    };
}

export async function saveCurrencyConfig(apiKey: string, intervalHours: number) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    if (!apiKey) throw new Error("API Key required");
    await currencyService.saveConfig(apiKey, Number(intervalHours) || 24);
    revalidatePath("/admin/system/currency");
}

export async function forceUpdateCurrencyRates() {
    if (!await isAdmin()) throw new Error("Unauthorized");
    const config = await currencyService.getConfig();
    if (!config?.apiKey) throw new Error("API Key not configured");
    return await currencyService.fetchAndCacheRates(config.apiKey);
}

export async function getPaymentConfigs() {
    if (!await isAdmin()) throw new Error("Unauthorized");
    const midtrans = await paymentGatewayService.getMidtransConfig();
    return {
        midtrans: {
            ...midtrans,
            serverKey: midtrans.serverKey ? `***${midtrans.serverKey.slice(-4)}` : '',
            clientKey: midtrans.clientKey ? `***${midtrans.clientKey.slice(-4)}` : '',
        }
    };
}

export async function savePaymentConfig(gateway: string, config: Record<string, unknown>) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    if (!gateway || !config) throw new Error("Missing gateway or config");

    if (gateway === "midtrans") {
        if (!config.serverKey || !config.clientKey || !config.merchantId) {
            throw new Error("Missing required Midtrans fields");
        }
        await paymentGatewayService.saveMidtransConfig({
            serverKey: config.serverKey as string,
            clientKey: config.clientKey as string,
            merchantId: config.merchantId as string,
            isProduction: (config.isProduction as boolean) || false,
            isActive: (config.isActive as boolean) || false
        });
        resetMidtransInstances();
        revalidatePath("/admin/system/payment");
        return { message: "Midtrans configuration saved successfully" };
    } else {
        throw new Error("Invalid gateway. Must be 'midtrans'");
    }
}

export async function updateSystemSetting(key: string, value: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminId = process.env.SUPER_ADMIN_ID;
    if (!((user.primaryEmail && adminEmails.includes(user.primaryEmail)) || user.id === superAdminId)) {
        throw new Error("Forbidden");
    }
    await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
    });
    revalidatePath("/admin/system/settings");
}

export async function saveContactSettings(data: {
    email?: string; phone?: string; telegram?: string; address?: string;
    agencyName?: string; companyName?: string; logoUrl?: string;
    logoDisplayMode?: string; servicesTitle?: string; servicesSubtitle?: string; hours?: string;
}) {
    if (!await isAdmin()) throw new Error("Unauthorized");

    const CONTACT_EMAIL_KEY = "CONTACT_EMAIL";
    const CONTACT_PHONE_KEY = "CONTACT_PHONE";
    const CONTACT_TELEGRAM_KEY = "CONTACT_TELEGRAM";
    const CONTACT_ADDRESS_KEY = "CONTACT_ADDRESS";
    const AGENCY_NAME_KEY = "AGENCY_NAME";
    const COMPANY_NAME_KEY = "COMPANY_NAME";
    const AGENCY_LOGO_KEY = "AGENCY_LOGO";
    const AGENCY_LOGO_DISPLAY_KEY = "AGENCY_LOGO_DISPLAY";
    const SERVICES_TITLE_KEY = "SERVICES_TITLE";
    const SERVICES_SUBTITLE_KEY = "SERVICES_SUBTITLE";
    const CONTACT_HOURS_KEY = "CONTACT_HOURS";

    const updates = [
        prisma.systemSetting.upsert({ where: { key: CONTACT_EMAIL_KEY }, update: { value: data.email || "" }, create: { key: CONTACT_EMAIL_KEY, value: data.email || "" } }),
        prisma.systemSetting.upsert({ where: { key: CONTACT_PHONE_KEY }, update: { value: data.phone || "" }, create: { key: CONTACT_PHONE_KEY, value: data.phone || "" } }),
        prisma.systemSetting.upsert({ where: { key: CONTACT_TELEGRAM_KEY }, update: { value: data.telegram || "" }, create: { key: CONTACT_TELEGRAM_KEY, value: data.telegram || "" } }),
        prisma.systemSetting.upsert({ where: { key: CONTACT_ADDRESS_KEY }, update: { value: data.address || "" }, create: { key: CONTACT_ADDRESS_KEY, value: data.address || "" } }),
        prisma.systemSetting.upsert({ where: { key: AGENCY_NAME_KEY }, update: { value: data.agencyName || "" }, create: { key: AGENCY_NAME_KEY, value: data.agencyName || "" } }),
        prisma.systemSetting.upsert({ where: { key: COMPANY_NAME_KEY }, update: { value: data.companyName || "" }, create: { key: COMPANY_NAME_KEY, value: data.companyName || "" } }),
        prisma.systemSetting.upsert({ where: { key: AGENCY_LOGO_KEY }, update: { value: data.logoUrl || "" }, create: { key: AGENCY_LOGO_KEY, value: data.logoUrl || "" } }),
        prisma.systemSetting.upsert({ where: { key: AGENCY_LOGO_DISPLAY_KEY }, update: { value: data.logoDisplayMode || "both" }, create: { key: AGENCY_LOGO_DISPLAY_KEY, value: data.logoDisplayMode || "both" } }),
        prisma.systemSetting.upsert({ where: { key: SERVICES_TITLE_KEY }, update: { value: data.servicesTitle || "" }, create: { key: SERVICES_TITLE_KEY, value: data.servicesTitle || "" } }),
        prisma.systemSetting.upsert({ where: { key: SERVICES_SUBTITLE_KEY }, update: { value: data.servicesSubtitle || "" }, create: { key: SERVICES_SUBTITLE_KEY, value: data.servicesSubtitle || "" } }),
        prisma.systemSetting.upsert({ where: { key: CONTACT_HOURS_KEY }, update: { value: data.hours || "" }, create: { key: CONTACT_HOURS_KEY, value: data.hours || "" } }),
    ];

    await prisma.$transaction(updates);
    revalidatePath("/admin/system/settings", "page");
    revalidatePath("/", "layout");
    (revalidateTag as unknown as (tag: string) => void)("system-settings");
}

export async function saveResendConfig(resendKey?: string, adminEmail?: string, senderName?: string, senderEmail?: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");

    if (resendKey !== undefined) {
        await prisma.systemSetting.upsert({
            where: { key: "RESEND_API_KEY" },
            update: { value: resendKey, description: "API Key for Resend email service" },
            create: { key: "RESEND_API_KEY", value: resendKey, description: "API Key for Resend email service" }
        });
    }
    if (adminEmail !== undefined) {
        await prisma.systemSetting.upsert({
            where: { key: "ADMIN_EMAIL_TARGET" },
            update: { value: adminEmail, description: "Target email address for contact form submissions" },
            create: { key: "ADMIN_EMAIL_TARGET", value: adminEmail, description: "Target email address for contact form submissions" }
        });
    }
    if (senderName !== undefined) {
        await prisma.systemSetting.upsert({
            where: { key: "RESEND_SENDER_NAME" },
            update: { value: senderName, description: "Sender name for system emails" },
            create: { key: "RESEND_SENDER_NAME", value: senderName, description: "Sender name for system emails" }
        });
    }
    if (senderEmail !== undefined) {
        await prisma.systemSetting.upsert({
            where: { key: "RESEND_SENDER_EMAIL" },
            update: { value: senderEmail, description: "Sender email address for system emails" },
            create: { key: "RESEND_SENDER_EMAIL", value: senderEmail, description: "Sender email address for system emails" }
        });
    }
    revalidatePath("/admin/system/email");
}

export async function getNotifications() {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");
    return await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

export async function markNotificationRead(id?: string, all?: boolean) {
    const user = await hexclaveServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    if (all) {
        await prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true }
        });
        return;
    }

    if (!id) throw new Error("ID required");

    await prisma.notification.update({
        where: { id, userId: user.id },
        data: { isRead: true }
    });
}

export async function testResendConfiguration(targetEmail?: string) {
    if (!await isAdmin()) throw new Error("Unauthorized");
    
    const resend = await getResendClient();
    if (!resend) throw new Error("Resend API key is not configured.");

    const toEmail = targetEmail || await getAdminEmailTarget();
    const sender = await getSenderConfig();
    
    const { error } = await resend.emails.send({
        from: sender.formatted,
        to: toEmail,
        subject: "Test Email Configuration",
        html: "<p>Ini adalah email test untuk memverifikasi konfigurasi Resend Anda.</p>"
    });

    if (error) {
        throw new Error(error.message);
    }
    
    return { success: true };
}
