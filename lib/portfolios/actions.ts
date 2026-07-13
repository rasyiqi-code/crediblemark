"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { safeUnstableCache as unstable_cache } from "@/lib/shared/cache";
import { fetchRenderedHtml as fetchFromCloudflare } from "@/lib/server/cloudflare-rendering";
import { prisma } from "@/lib/config/db";

export interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    category: string;
    description?: string;
    externalUrl?: string;
    imageUrl?: string;
    htmlContent?: string;
    createdAt: Date | string;
    source?: "database" | "github";
}

async function fetchGithubReposReal(): Promise<PortfolioItem[]> {
    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };
    if (process.env.GITHUB_PAT) {
        headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
    }

    try {
        // Fetch dari user rasyiqi-code
        const resUser = await fetch("https://api.github.com/users/rasyiqi-code/repos?sort=updated&per_page=10", {
            headers,
            next: { revalidate: 3600 } // Cache 1 jam
        });
        const reposUser = resUser.ok ? await resUser.json() : [];

        // Fetch dari org crediblemark-official
        const resOrg = await fetch("https://api.github.com/orgs/crediblemark-official/repos?sort=updated&per_page=10", {
            headers,
            next: { revalidate: 3600 } // Cache 1 jam
        });
        const reposOrg = resOrg.ok ? await resOrg.json() : [];

        // Gabungkan
        const allRepos = [...reposOrg, ...reposUser];

        // Filter: Hanya tampilkan repositori publik (karena repositori privat akan memicu error muat gambar di browser)
        const publicRepos = allRepos.filter((repo: any) => !repo.private);

        // Map ke PortfolioItem
        return publicRepos.map((repo: any) => ({
            id: repo.id.toString(),
            title: repo.name.split("-").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
            slug: repo.name,
            category: "GitHub " + (repo.language || "Repository"),
            description: repo.description || "No description provided.",
            externalUrl: repo.html_url,
            imageUrl: undefined,
            createdAt: repo.created_at,
            source: "github"
        }));
    } catch (error) {
        console.error("[Portfolios] GitHub API fetch failed:", error);
        return [];
    }
}

export async function getPortfolios(): Promise<PortfolioItem[]> {
    return unstable_cache(
        async () => {
            const dbPortfolios: PortfolioItem[] = [];
            try {
                // Batasi maksimal 50 portfolio item untuk performa RAM server
                const portfolios = await prisma.portfolio.findMany({
                    take: 50,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        category: true,
                        description: true,
                        externalUrl: true,
                        imageUrl: true,
                        createdAt: true,
                    }
                });
                
                dbPortfolios.push(...portfolios.map(p => ({
                    ...p,
                    source: "database"
                })) as unknown as PortfolioItem[]);
            } catch {
                console.error("[Portfolios] Failed to fetch from DB");
            }

            const githubRepos = await fetchGithubReposReal();
            const mappedGithub = githubRepos.map(g => ({
                ...g,
                source: "github"
            })) as unknown as PortfolioItem[];

            return [...dbPortfolios, ...mappedGithub];
        },
        ["portfolios-list-combined"],
        { revalidate: 3600, tags: ["portfolios"] }
    )();
}

/**
 * Khusus untuk admin: hanya mengambil portfolio dari database (tanpa GitHub repos).
 */
export async function getDbPortfolios(): Promise<PortfolioItem[]> {
    try {
        const portfolios = await prisma.portfolio.findMany({
            take: 100,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                description: true,
                externalUrl: true,
                imageUrl: true,
                createdAt: true,
            }
        });
        return portfolios.map(p => ({
            ...p,
            category: p.category ?? "",
            description: p.description ?? undefined,
            externalUrl: p.externalUrl ?? undefined,
            imageUrl: p.imageUrl ?? undefined,
            source: "database" as const
        }));
    } catch {
        console.error("[Portfolios] getDbPortfolios: DB connection failed");
        return [];
    }
}

export async function getPortfolioHtml(slug: string): Promise<string> {
    return unstable_cache(
        async () => {
            try {
                const portfolio = await prisma.portfolio.findUnique({
                    where: { slug },
                    select: { htmlContent: true },
                });
                return portfolio?.htmlContent || "<h1>Design not found</h1>";
            } catch {
                console.error("[Portfolios] Failed to fetch HTML from DB");
                return "<h1>Error loading design</h1>";
            }
        },
        [`portfolio-html-${slug}`],
        { revalidate: 3600, tags: ["portfolios", `portfolio-${slug}`] }
    )();
}

/**
 * Sanitizes a string to be used as a slug.
 */
function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function savePortfolio(item: Omit<PortfolioItem, "id" | "createdAt">, html: string) {
    try {
        const cleanSlug = sanitizeSlug(item.slug || item.title);
        
        // Ensure URLs are valid or null to prevent crashes in next/image or iframes
        const sanitizedImageUrl = item.imageUrl && item.imageUrl.length > 8 ? item.imageUrl : undefined;
        const sanitizedExternalUrl = item.externalUrl && item.externalUrl.length > 8 ? item.externalUrl : undefined;

        const newItem = await prisma.portfolio.upsert({
            where: { slug: cleanSlug },
            update: {
                title: item.title,
                category: item.category,
                description: item.description,
                externalUrl: sanitizedExternalUrl,
                imageUrl: sanitizedImageUrl,
                htmlContent: html || undefined,
            },
            create: {
                title: item.title,
                slug: cleanSlug,
                category: item.category,
                description: item.description,
                externalUrl: sanitizedExternalUrl,
                imageUrl: sanitizedImageUrl,
                htmlContent: html,
            },
        });

        revalidatePath("/portfolio", "page");
        revalidatePath("/admin/portfolio", "page");
        revalidatePath(`/view-design/${cleanSlug}`, "page");
        revalidateTag("portfolios", "max");

        return newItem as unknown as PortfolioItem;
    } catch (error) {
        console.error("[Portfolios] Save failed:", error);
        throw error instanceof Error ? error : new Error("Unknown error during save");
    }
}

export async function deletePortfolio(id: string) {
    try {
        const item = await prisma.portfolio.delete({
            where: { id },
        });

        revalidatePath("/portfolio", "page");
        revalidatePath("/admin/portfolio", "page");
        revalidatePath(`/view-design/${item.slug}`, "page");
        revalidateTag("portfolios", "max");
    } catch (error) {
        console.error("[Portfolios] Delete failed:", error);
        throw error;
    }
}

// Pending promise map to handle parallel requests for the same URL in the same process
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Fetches rendered HTML with persistent caching and deduplication.
 */
export async function getRenderedHtml(url: string, localBaseUrl?: string): Promise<string> {
    const cacheKey = `portfolio-render-${url}`;

    // 1. Check for a pending request in the current process to avoid redundant calls
    if (pendingRequests.has(url)) {
        return pendingRequests.get(url)!;
    }

    // 2. Define the actual fetch logic
    const fetchAction = async () => {
        // Use unstable_cache to persist across requests/restarts
        return unstable_cache(
            async () => {
                try {
                    return await fetchFromCloudflare(url, localBaseUrl);
                } catch {
                    console.warn(`[ProxyCache] Rendering failed for ${url}, using fallback text.`);
                    return `<html><body><h1>Content currently unavailable</h1><p>${url}</p></body></html>`;
                }
            },
            [cacheKey],
            { revalidate: 3600 * 6, tags: ["portfolio-render"] } // Cache for 6 hours
        )();
    };

    // Bungkus promise dengan timeout race agar tidak bocor di pendingRequests Map jika Cloudflare hang
    const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error("Cloudflare render timeout")), 20000);
        // Izinkan Node process exit jika timer ini adalah satu-satunya active handle
        timer.unref();
    });

    const promise = Promise.race([fetchAction(), timeoutPromise]);
    pendingRequests.set(url, promise);
    
    try {
        return await promise;
    } finally {
        pendingRequests.delete(url);
    }
}
