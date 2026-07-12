export const revalidate = 86400; // Cache selama 24 jam (Static/ISR)

export async function GET() {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api
Disallow: /handler/
Disallow: /verify/
Disallow: /client-dashboard

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/sitemap.xml
`;

    return new Response(robots, {
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
        },
    });
}
