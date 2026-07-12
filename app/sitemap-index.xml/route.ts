import { NextResponse } from "next/server";

/**
 * Sitemap Index — memisahkan sitemap menjadi beberapa file untuk skalabilitas.
 * Berguna ketika jumlah URL melebihi 50.000 (batas Google per sitemap).
 * 
 * Saat ini mendaftarkan:
 * - /sitemap-static.xml  : Halaman statis (homepage, services, portfolio, dll)
 * - /sitemap-services.xml: Halaman detail layanan (dinamis dari DB)
 * - /sitemap-portfolio.xml: Halaman portofolio (dinamis dari DB)
 */
export const revalidate = 86400; // Cache selama 24 jam (Static/ISR)

export async function GET() {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://crediblemark.com").replace(/\/$/, "");

    const now = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
    });
}
