"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";

/**
 * Mengambil semua data addon dari database.
 * Jika onlyActive bernilai true, hanya addon aktif yang diambil.
 */
export async function getAddons(onlyActive = false) {
    try {
        const addons = await prisma.addon.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: addons };
    } catch (error) {
        console.error("GET ADDONS ERROR:", error);
        return { error: "Gagal mengambil data addon" };
    }
}

/**
 * Membuat data addon baru di database.
 * Hanya dapat diakses oleh user terautentikasi (Admin).
 */
export async function createAddon(formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const name = formData.get("name")?.toString();
    const name_id = formData.get("name_id")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const isActive = formData.get("isActive")?.toString() === "true";

    if (!name || !name_id || !priceRaw) {
        return { error: "Field nama, nama (ID), dan harga harus diisi" };
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
        return { error: "Format harga tidak valid" };
    }

    try {
        const addon = await prisma.addon.create({
            data: {
                name,
                name_id,
                price,
                currency,
                interval,
                isActive
            }
        });

        // Invalidasi cache halaman terkait
        (revalidateTag as unknown as (tag: string) => void)("addons");
        revalidatePath("/admin/pm/addons");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true, data: addon };
    } catch (error) {
        console.error("CREATE ADDON ERROR:", error);
        return { error: "Gagal membuat addon baru" };
    }
}

/**
 * Memperbarui data addon yang sudah ada.
 * Hanya dapat diakses oleh user terautentikasi (Admin).
 */
export async function updateAddon(addonId: string, formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const name = formData.get("name")?.toString();
    const name_id = formData.get("name_id")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const isActive = formData.get("isActive")?.toString() === "true";

    if (!name || !name_id || !priceRaw) {
        return { error: "Field nama, nama (ID), dan harga harus diisi" };
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
        return { error: "Format harga tidak valid" };
    }

    try {
        const updated = await prisma.addon.update({
            where: { id: addonId },
            data: {
                name,
                name_id,
                price,
                currency,
                interval,
                isActive
            }
        });

        // Invalidasi cache halaman terkait
        (revalidateTag as unknown as (tag: string) => void)("addons");
        revalidatePath("/admin/pm/addons");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true, data: updated };
    } catch (error) {
        console.error("UPDATE ADDON ERROR:", error);
        return { error: "Gagal memperbarui data addon" };
    }
}

/**
 * Mengubah status aktif/nonaktif addon secara cepat.
 */
export async function toggleAddonStatus(addonId: string, isActive: boolean) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const updated = await prisma.addon.update({
            where: { id: addonId },
            data: { isActive }
        });

        (revalidateTag as unknown as (tag: string) => void)("addons");
        revalidatePath("/admin/pm/addons");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true, data: updated };
    } catch (error) {
        console.error("TOGGLE ADDON STATUS ERROR:", error);
        return { error: "Gagal mengubah status addon" };
    }
}

/**
 * Menghapus satu addon dari database.
 * Hanya dapat diakses oleh user terautentikasi (Admin).
 */
export async function deleteAddon(addonId: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.addon.delete({
            where: { id: addonId }
        });

        // Invalidasi cache halaman terkait
        (revalidateTag as unknown as (tag: string) => void)("addons");
        revalidatePath("/admin/pm/addons");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true };
    } catch (error) {
        console.error("DELETE ADDON ERROR:", error);
        return { error: "Gagal menghapus addon" };
    }
}

/**
 * Menghapus beberapa addon sekaligus (bulk delete).
 * Hanya dapat diakses oleh user terautentikasi (Admin).
 */
export async function deleteAddons(addonIds: string[]) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    if (!Array.isArray(addonIds) || addonIds.length === 0) {
        return { error: "Tidak ada addon yang dipilih" };
    }

    try {
        await prisma.addon.deleteMany({
            where: {
                id: { in: addonIds }
            }
        });

        // Invalidasi cache halaman terkait
        (revalidateTag as unknown as (tag: string) => void)("addons");
        revalidatePath("/admin/pm/addons");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true };
    } catch (error) {
        console.error("BULK DELETE ADDONS ERROR:", error);
        return { error: "Gagal menghapus addon terpilih" };
    }
}

/**
 * Membuat banyak data addon sekaligus di database (bulk create).
 * Hanya dapat diakses oleh user terautentikasi (Admin).
 */
export async function createAddons(addons: { name: string; name_id: string; price: number; currency: string; interval: string; isActive?: boolean }[]) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    if (!Array.isArray(addons) || addons.length === 0) {
        return { error: "Tidak ada addon yang diberikan" };
    }

    try {
        const created = await prisma.addon.createMany({
            data: addons.map(a => ({
                name: a.name,
                name_id: a.name_id,
                price: a.price,
                currency: a.currency,
                interval: a.interval,
                isActive: a.isActive ?? true
            }))
        });

        // Invalidasi cache halaman terkait
        (revalidateTag as unknown as (tag: string) => void)("addons");
        revalidatePath("/admin/pm/addons");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true, count: created.count };
    } catch (error) {
        console.error("CREATE ADDONS BULK ERROR:", error);
        return { error: "Gagal membuat daftar addon kustom secara massal" };
    }
}

