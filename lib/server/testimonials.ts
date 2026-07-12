import { prisma } from "@/lib/config/db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * Fetch active testimonials with caching and memoization.
 */
export const getActiveTestimonials = cache(async (limit = 10) => {
    return unstable_cache(
        async (l: number) => {
            try {
                return await prisma.testimonial.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: l
                });
            } catch (error) {
                console.error("[Testimonials] DB Fetch Error:", error);
                return [];
            }
        },
        ["active-testimonials-singleton", String(limit)],
        {
            tags: ["testimonials"],
            revalidate: 3600, // Cache for 1 hour
        }
    )(limit);
});

export const getAllTestimonials = async (limit?: number) => {
    // Membatasi pengambilan seluruh data testimoni untuk mencegah konsumsi memori berlebih
    return await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit || 100,
    });
};
