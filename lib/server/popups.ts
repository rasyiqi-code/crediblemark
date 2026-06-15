import { prisma } from "@/lib/config/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { safeUnstableCache as unstable_cache } from "@/lib/shared/cache";
import { cache } from "react";

export const getPopUps = cache(async () => {
    return unstable_cache(
        async () => {
            return await prisma.popUp.findMany({
                orderBy: { createdAt: "desc" },
                take: 100,
            });
        },
        ["popups-all"],
        { tags: ["popups"], revalidate: 3600 }
    )();
});

export const getActivePopUps = cache(async () => {
    return unstable_cache(
        async () => {
            return await prisma.popUp.findMany({
                where: { isActive: true },
                orderBy: { createdAt: "desc" },
                take: 100,
            });
        },
        ["popups-active"],
        { tags: ["popups"], revalidate: 3600 }
    )();
});

export async function createPopUp(data: {
    headline: string;
    headline_id?: string;
    description: string;
    description_id?: string;
    ctaText?: string;
    ctaText_id?: string;
    ctaUrl?: string;
    isActive?: boolean;
    targetingType?: string;
    targetingPaths?: string[];
    targetingLocales?: string[];
    showFormLead?: boolean;
    formHeadline?: string;
    formHeadline_id?: string;
    delay?: number;
    couponCode?: string;
}) {
    const popup = await prisma.popUp.create({
        data: {
            ...data,
            targetingPaths: data.targetingPaths || [],
            targetingLocales: data.targetingLocales || [],
        },
    });
    revalidatePath("/admin/marketing");
    revalidateTag("popups", "max");
    return popup;
}

export async function updatePopUp(id: string, data: Partial<Parameters<typeof createPopUp>[0]>) {
    const popup = await prisma.popUp.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/marketing");
    revalidateTag("popups", "max");
    return popup;
}

export async function deletePopUp(id: string) {
    await prisma.popUp.deleteMany({ where: { id } });
    revalidatePath("/admin/marketing");
    revalidateTag("popups", "max");
}

export async function togglePopUpStatus(id: string, isActive: boolean) {
    const popup = await prisma.popUp.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath("/admin/marketing");
    revalidateTag("popups", "max");
    return popup;
}
