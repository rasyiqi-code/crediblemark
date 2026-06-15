
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET() {
    try {
        const pages = await prisma.pageSeo.findMany({
            orderBy: { path: 'asc' }
        });
        return NextResponse.json(pages);
    } catch {
        return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { path, title, title_id, description, description_id, keywords, keywords_id, ogImage } = body;

        if (!path) {
            return NextResponse.json({ error: "Path is required" }, { status: 400 });
        }

        // Ensure path starts with /
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;

        const page = await prisma.pageSeo.upsert({
            where: {
                path: normalizedPath
            },
            create: {
                path: normalizedPath,
                title,
                title_id,
                description,
                description_id,
                keywords,
                keywords_id,
                ogImage
            },
            update: {
                title,
                title_id,
                description,
                description_id,
                keywords,
                keywords_id,
                ogImage
            }
        });

        revalidatePath(normalizedPath, "page");
        revalidateTag("page-seo", "max");
        return NextResponse.json(page);
    } catch (error) {
        console.error("Page SEO upsert error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
