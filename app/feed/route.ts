import { prisma } from "@/lib/config/db";
import { getPortfolios } from "@/lib/portfolios/actions";
import { getChangelogs } from "@/lib/server/changelog";

export const revalidate = 3600; // Cache selama 1 jam (ISR)

interface FeedItem {
    title: string;
    link: string;
    description: string;
    pubDate: Date;
    guid: string;
}

export async function GET() {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://crediblemark.com";
    baseUrl = baseUrl.replace(/\/$/, "");

    // Fetch data secara paralel untuk performa optimal
    const [portfolios, services, changelogs] = await Promise.all([
        getPortfolios().catch((err) => {
            console.error("[RSS Feed] Gagal mengambil portfolio:", err);
            return [];
        }),
        prisma.service.findMany({
            where: { isActive: true, visibility: "PUBLIC" },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                createdAt: true,
            },
        }).catch((err) => {
            console.error("[RSS Feed] Gagal mengambil layanan:", err);
            return [];
        }),
        getChangelogs(true, 20).catch((err) => {
            console.error("[RSS Feed] Gagal mengambil changelog:", err);
            return [];
        }),
    ]);

    const feedItems: FeedItem[] = [];

    // 1. Map Portfolios
    for (const item of portfolios) {
        if (item && item.slug) {
            feedItems.push({
                title: `[Portfolio] ${item.title}`,
                link: `${baseUrl}/view-design/${item.slug}`,
                description: item.description || "Design portfolio showcase.",
                pubDate: item.createdAt ? new Date(item.createdAt) : new Date(),
                guid: `portfolio-${item.id}`,
            });
        }
    }

    // 2. Map Services (Layanan)
    for (const service of services) {
        if (service && service.slug) {
            feedItems.push({
                title: `[Layanan] ${service.title}`,
                link: `${baseUrl}/services/${service.slug}`,
                description: service.description || "Productized service offering.",
                pubDate: service.createdAt ? new Date(service.createdAt) : new Date(),
                guid: `service-${service.id}`,
            });
        }
    }

    // 3. Map Changelogs
    for (const log of changelogs) {
        if (log) {
            feedItems.push({
                title: `[Changelog] ${log.title}`,
                link: `${baseUrl}/changelog`,
                description: log.content || "System update release notes.",
                pubDate: log.publishedAt ? new Date(log.publishedAt) : new Date(log.createdAt),
                guid: `changelog-${log.id}`,
            });
        }
    }

    // Urutkan item gabungan berdasarkan tanggal publikasi terbaru (descending)
    feedItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    // Fungsi pembersihan string XML agar tidak memicu error parsing
    const escapeXml = (unsafe: string) => {
        if (!unsafe) return "";
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    };

    // Bangun dokumen XML RSS 2.0
    let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
    xml += '  <channel>\n';
    xml += '    <title>Crediblemark Feed</title>\n';
    xml += `    <link>${baseUrl}</link>\n`;
    xml += '    <description>Pantau portofolio terbaru, layanan desain &amp; kode, serta log rilis pembaruan dari Crediblemark.</description>\n';
    xml += '    <language>id-id</language>\n';
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    xml += `    <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml" />\n`;

    for (const item of feedItems) {
        xml += '    <item>\n';
        xml += `      <title>${escapeXml(item.title)}</title>\n`;
        xml += `      <link>${item.link}</link>\n`;
        xml += `      <guid isPermaLink="false">${item.guid}</guid>\n`;
        xml += `      <pubDate>${item.pubDate.toUTCString()}</pubDate>\n`;
        xml += `      <description>${escapeXml(item.description)}</description>\n`;
        xml += '    </item>\n';
    }

    xml += '  </channel>\n';
    xml += '</rss>';

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
        },
    });
}
