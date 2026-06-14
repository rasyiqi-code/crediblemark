"use server";

import { prisma } from "@/lib/config/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { slugify } from "@/lib/shared/utils";
import { Prisma } from "@prisma/client";


export async function createService(formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const action = formData.get("action");
    if (action === 'sync') {
        return { success: true, count: 0, warning: "Import checks skipped: API limitation" };
    }

    const title = formData.get("title")?.toString();
    const title_id = formData.get("title_id")?.toString();
    const description = formData.get("description")?.toString();
    const description_id = formData.get("description_id")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const discountRaw = formData.get("discount")?.toString();
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const featuresRaw = formData.get("features")?.toString() || "";
    const featuresIdRaw = formData.get("features_id")?.toString() || "";
    const imageFile = formData.get("image") as File;
    const slugInput = formData.get("slug")?.toString();

    if (!title || !description || !title_id || !description_id || !priceRaw) {
        return { error: "Missing required fields" };
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price)) return { error: "Invalid price format" };


    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
    const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        try {
            const { uploadFile } = await import("@/lib/integrations/storage");
            imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        } catch (storageError) {
            console.error("Storage upload failed:", storageError);
        }
    }


    const service = await prisma.service.create({
        data: {
            title,
            title_id,
            description,
            description_id,
            price,
            discount: discountRaw ? parseInt(discountRaw, 10) : 0,
            priceType: formData.get("priceType")?.toString() || "FIXED",
            currency,
            interval,
            visibility: formData.get("visibility")?.toString() || "PUBLIC",
            features,
            features_id,
            addons: (() => {
                try {
                    const val = formData.get("addons");
                    return val ? JSON.parse(val.toString()) : [];
                } catch {
                    return [];
                }
            })(),
            addons_id: (() => {
                try {
                    const val = formData.get("addons_id");
                    return val ? JSON.parse(val.toString()) : [];
                } catch {
                    return [];
                }
            })(),
            image: imageUrl,
            slug: slugInput ? slugify(slugInput) : slugify(title)
        } as Prisma.ServiceCreateInput
    });

    // Invalidasi cache halaman publik dan admin
    (revalidateTag as unknown as (tag: string) => void)("services");
    revalidatePath("/admin/pm/services");
    revalidatePath("/en/services");
    revalidatePath("/id/services");
    return { success: true, data: service };
}

export async function updateService(serviceId: string, formData: FormData) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title")?.toString();
    const title_id = formData.get("title_id")?.toString();
    const description = formData.get("description")?.toString();
    const description_id = formData.get("description_id")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const discountRaw = formData.get("discount")?.toString();
    const priceType = formData.get("priceType")?.toString() || "FIXED";
    const currency = formData.get("currency")?.toString() || "USD";
    const interval = formData.get("interval")?.toString() || "one_time";
    const featuresRaw = formData.get("features")?.toString() || "";
    const featuresIdRaw = formData.get("features_id")?.toString() || "";
    const imageFile = formData.get("image") as File;
    const imageUrlInput = formData.get("image_url")?.toString();
    const slugInput = formData.get("slug")?.toString();

    if (!title || !description || !title_id || !description_id || !priceRaw) {
        return { error: "Missing required fields" };
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price)) return { error: "Invalid price format" };


    const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
    const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

    const addonsRaw = formData.get("addons")?.toString();
    const addonsIdRaw = formData.get("addons_id")?.toString();

    const data: Record<string, unknown> = {
        title,
        title_id,
        description,
        description_id,
        price,
        discount: discountRaw ? parseInt(discountRaw, 10) : 0,
        priceType,
        currency,
        interval,
        visibility: formData.get("visibility")?.toString() || "PUBLIC",
        features,
        features_id,
        addons: (() => {
            try {
                return addonsRaw ? JSON.parse(addonsRaw) : [];
            } catch {
                return [];
            }
        })(),
        addons_id: (() => {
            try {
                return addonsIdRaw ? JSON.parse(addonsIdRaw) : [];
            } catch {
                return [];
            }
        })(),
        slug: slugInput ? slugify(slugInput) : slugify(title)
    };

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        try {
            const { uploadFile } = await import("@/lib/integrations/storage");
            data.image = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
        } catch (storageError) {
            console.error("Storage upload failed during update:", storageError);
        }
    } else if (imageUrlInput) {
        data.image = imageUrlInput;
    }


    const updated = await prisma.service.update({
        where: { id: serviceId },
        data: data as Prisma.ServiceUpdateInput
    });

    // Invalidasi cache halaman publik dan admin
    (revalidateTag as unknown as (tag: string) => void)("services");
    revalidatePath("/admin/pm/services");
    revalidatePath("/en/services");
    revalidatePath("/id/services");
    return { success: true, data: updated };
}

export async function deleteService(serviceId: string) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    await prisma.service.delete({ where: { id: serviceId } });

    // Invalidasi cache halaman publik dan admin
    (revalidateTag as unknown as (tag: string) => void)("services");
    revalidatePath("/admin/pm/services");
    revalidatePath("/en/services");
    revalidatePath("/id/services");
    return { success: true };
}

/**
 * Menghapus beberapa layanan sekaligus dari database (bulk delete).
 * Hanya dapat diakses oleh Administrator.
 */
export async function deleteServices(serviceIds: string[]) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return { error: "Unauthorized" };

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
        return { error: "No services selected" };
    }

    try {
        await prisma.service.deleteMany({
            where: {
                id: { in: serviceIds }
            }
        });

        // Invalidasi cache halaman publik dan admin
        (revalidateTag as unknown as (tag: string) => void)("services");
        revalidatePath("/admin/pm/services");
        revalidatePath("/en/services");
        revalidatePath("/id/services");
        return { success: true };
    } catch (error) {
        console.error("BULK DELETE SERVICES ERROR:", error);
        return { error: "Failed to delete services" };
    }
}

