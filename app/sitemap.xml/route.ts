import { getServices } from "@/lib/server/services";
import { getPortfolios, type PortfolioItem } from "@/lib/portfolios/actions";
import type { Service } from "@prisma/client";

export const revalidate = 3600;

interface SitemapRoute {
    route: string;
    lastModified: Date | string | number;
    changeFrequency: string;
    priority: number;
}

export async function GET() {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://crediblemark.com";
    baseUrl = baseUrl.replace(/\/$/, "");

    const locales = ["id", "en"];
    const now = new Date();

    let portfolios: PortfolioItem[] = [];
    let services: Service[] = [];

    try {
        const [portfoliosRes, servicesRes] = await Promise.all([
            getPortfolios().catch((err) => {
                console.error("[Sitemap] Gagal mengambil portfolio dari DB:", err);
                return [];
            }),
            getServices(true).catch((err) => {
                console.error("[Sitemap] Gagal mengambil layanan dari DB:", err);
                return [];
            }),
        ]);
        portfolios = portfoliosRes;
        services = servicesRes;
    } catch (err) {
        console.error("[Sitemap] Error fatal saat mengambil data database:", err);
    }

    // 2. Definisikan Rute Statis
    const staticPaths = [
        "",
        "/services",
        "/portfolio",
        "/contact",
        "/price-calculator",
        // "/submit-testimonial" dihapus — halaman ini butuh login, tidak perlu diindex
        "/promosi",
        "/privacy",
        "/terms",
    ];

    const baseRoutes: SitemapRoute[] = [];

    // Rute Statis
    for (const route of staticPaths) {
        baseRoutes.push({
            route,
            lastModified: now,
            changeFrequency: "weekly",
            priority: route === "" ? 1 : 0.8,
        });
    }

    // Rute Portfolio
    for (const portfolio of portfolios) {
        if (portfolio && portfolio.slug) {
            baseRoutes.push({
                route: `/view-design/${portfolio.slug}`,
                lastModified: portfolio.createdAt || now,
                changeFrequency: "monthly",
                priority: 0.7,
            });
        }
    }

    // Rute Layanan (Services)
    for (const service of services) {
        if (service && service.slug) {
            baseRoutes.push({
                route: `/services/${service.slug}`,
                lastModified: service.updatedAt || service.createdAt || now,
                changeFrequency: "weekly",
                priority: 0.8,
            });
        }
    }

    // 3. Bangun Dokumen XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    for (const locale of locales) {
        const prefix = `${baseUrl}/${locale}`;
        for (const baseRoute of baseRoutes) {
            const url = `${prefix}${baseRoute.route}`;
            
            // OPTIMASI: Parsing tanggal secara aman untuk menghindari RangeError jika format tanggal di DB tidak valid
            let lastmod = now.toISOString();
            try {
                if (baseRoute.lastModified) {
                    const dateObj = new Date(baseRoute.lastModified);
                    if (!isNaN(dateObj.getTime())) {
                        lastmod = dateObj.toISOString();
                    }
                }
            } catch {
                // Fallback otomatis menggunakan waktu saat ini
            }
            
            xml += `  <url>\n`;
            xml += `    <loc>${url}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>${baseRoute.changeFrequency}</changefreq>\n`;
            xml += `    <priority>${baseRoute.priority}</priority>\n`;
            
            // Tambahkan Alternates Lang (termasuk x-default untuk user tanpa preferensi bahasa)
            for (const altLocale of locales) {
                const altUrl = `${baseUrl}/${altLocale}${baseRoute.route}`;
                xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}"/>\n`;
            }
            // x-default menunjuk ke versi EN sebagai fallback universal
            xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${baseRoute.route}"/>\n`;
            
            xml += `  </url>\n`;
        }
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
        },
    });
}
