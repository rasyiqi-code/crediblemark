import { getPortfolioHtml } from "@/lib/portfolios/actions";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const html = await getPortfolioHtml(slug);

    if (html === "<h1>File not found</h1>") {
        return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
            "CDN-Cache-Control": "public, max-age=3600",
            "Vercel-CDN-Cache-Control": "public, max-age=3600",
        },
    });
}
