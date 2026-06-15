"use server";

import { 
    serviceContentGeneratorFlow, 
    servicePricingGeneratorFlow, 
    singleAddonGeneratorFlow,
    bulkAddonsGeneratorFlow
} from "@/app/genkit";
import { isAdmin } from "@/lib/shared/auth-helpers";

/**
 * Mengamankan eksekusi dengan pengecekan administrator.
 */
async function ensureAdmin() {
    if (!await isAdmin()) {
        throw new Error("Unauthorized");
    }
}

/**
 * Menangani pembuatan draf konten deskripsi & fitur layanan baru.
 */
export async function generateServiceContentAction(prompt: string) {
    await ensureAdmin();
    if (!prompt.trim()) {
        return { error: "Prompt harus diisi" };
    }

    try {
        const result = await serviceContentGeneratorFlow(prompt.trim());
        return { success: true, data: result };
    } catch (error) {
        console.error("GENERATE CONTENT ACTION ERROR:", error);
        return { error: error instanceof Error ? error.message : "Gagal menghasilkan draf konten layanan" };
    }
}

/**
 * Menangani pembuatan rekomendasi harga layanan berdasarkan kompleksitas fiturnya.
 */
interface PricingInput {
    title: string;
    title_id?: string;
    description: string;
    description_id?: string;
    features: string[];
    features_id?: string[];
    targetBusinessScale?: string;
}

export async function generateServicePricingAction(data: PricingInput) {
    await ensureAdmin();
    if (!data.title || !data.description) {
        return { error: "Judul dan deskripsi harus diisi" };
    }

    try {
        const result = await servicePricingGeneratorFlow({
            title: data.title,
            title_id: data.title_id || data.title,
            description: data.description,
            description_id: data.description_id || data.description,
            features: data.features || [],
            features_id: data.features_id || data.features || [],
            targetBusinessScale: data.targetBusinessScale || "AUTO"
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("GENERATE PRICING ACTION ERROR:", error);
        return { error: error instanceof Error ? error.message : "Gagal menghasilkan rekomendasi harga" };
    }
}

/**
 * Menangani pembuatan rekomendasi detail addon tunggal.
 */
interface SingleAddonInput {
    prompt: string;
    currency?: "USD" | "IDR";
    targetBusinessScale?: string;
    isEn?: boolean;
}

export async function generateSingleAddonAction(data: SingleAddonInput) {
    await ensureAdmin();
    if (!data.prompt.trim()) {
        return { error: "Prompt harus diisi" };
    }

    try {
        const result = await singleAddonGeneratorFlow({
            prompt: data.prompt.trim(),
            currency: data.currency || "IDR",
            targetBusinessScale: data.targetBusinessScale || "AUTO",
            isEn: data.isEn ?? false
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("GENERATE SINGLE ADDON ACTION ERROR:", error);
        return { error: error instanceof Error ? error.message : "Gagal menghasilkan draf addon tunggal" };
    }
}

/**
 * Menangani pembuatan draf 10 addon massal secara unik (tidak menduplikasi addon lama).
 */
interface BulkAddonsInput {
    prompt?: string;
    currency: "USD" | "IDR";
    existingAddons: string[];
    count?: number;
}

export async function generateBulkAddonsAction(data: BulkAddonsInput) {
    await ensureAdmin();
    try {
        const result = await bulkAddonsGeneratorFlow({
            prompt: data.prompt || "",
            currency: data.currency,
            existingAddons: data.existingAddons || [],
            count: data.count || 10
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("GENERATE BULK ADDONS ACTION ERROR:", error);
        return { error: error instanceof Error ? error.message : "Gagal menghasilkan draf addon massal" };
    }
}
