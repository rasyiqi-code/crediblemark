
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSystemSettings } from "@/lib/server/settings";

const SEO_TITLE_KEY = "SEO_TITLE";
const SEO_TITLE_ID_KEY = "SEO_TITLE_ID";
const SEO_DESCRIPTION_KEY = "SEO_DESCRIPTION";
const SEO_DESCRIPTION_ID_KEY = "SEO_DESCRIPTION_ID";
const SEO_KEYWORDS_KEY = "SEO_KEYWORDS";
const SEO_KEYWORDS_ID_KEY = "SEO_KEYWORDS_ID";
const SEO_OG_IMAGE_KEY = "SEO_OG_IMAGE";
const SEO_FAVICON_KEY = "SEO_FAVICON";
const SEO_GOOGLE_VERIFICATION_KEY = "SEO_GOOGLE_VERIFICATION";
const SEO_GA_ID_KEY = "SEO_GA_ID";

export async function GET() {
    // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
    // 🎯 Why: Reduces redundant database queries for global settings, mitigating N+1 query problems and reducing database load.
    // 📊 Impact: Faster API response times and less database load by leveraging Next.js caching.
    const settings = await getSystemSettings([SEO_TITLE_KEY, SEO_TITLE_ID_KEY, SEO_DESCRIPTION_KEY, SEO_DESCRIPTION_ID_KEY, SEO_KEYWORDS_KEY, SEO_KEYWORDS_ID_KEY, SEO_OG_IMAGE_KEY, SEO_FAVICON_KEY, SEO_GOOGLE_VERIFICATION_KEY, SEO_GA_ID_KEY]);

    const getVal = (key: string) => settings.find(s => s.key === key)?.value || null;

    return NextResponse.json({
        title: getVal(SEO_TITLE_KEY),
        title_id: getVal(SEO_TITLE_ID_KEY),
        description: getVal(SEO_DESCRIPTION_KEY),
        description_id: getVal(SEO_DESCRIPTION_ID_KEY),
        keywords: getVal(SEO_KEYWORDS_KEY),
        keywords_id: getVal(SEO_KEYWORDS_ID_KEY),
        ogImage: getVal(SEO_OG_IMAGE_KEY),
        favicon: getVal(SEO_FAVICON_KEY),
        googleVerification: getVal(SEO_GOOGLE_VERIFICATION_KEY),
        gaId: getVal(SEO_GA_ID_KEY),
    });
}

export async function POST(req: NextRequest) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { title, title_id, description, description_id, keywords, keywords_id, ogImage, favicon, googleVerification, gaId } = body;

        const updates = [
            prisma.systemSetting.upsert({
                where: { key: SEO_TITLE_KEY },
                update: { value: title || "", description: "Global SEO Title Suffix or Default" },
                create: { key: SEO_TITLE_KEY, value: title || "", description: "Global SEO Title Suffix or Default" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_TITLE_ID_KEY },
                update: { value: title_id || "", description: "Global SEO Title Suffix or Default (ID)" },
                create: { key: SEO_TITLE_ID_KEY, value: title_id || "", description: "Global SEO Title Suffix or Default (ID)" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_DESCRIPTION_KEY },
                update: { value: description || "", description: "Global Meta Description" },
                create: { key: SEO_DESCRIPTION_KEY, value: description || "", description: "Global Meta Description" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_DESCRIPTION_ID_KEY },
                update: { value: description_id || "", description: "Global Meta Description (ID)" },
                create: { key: SEO_DESCRIPTION_ID_KEY, value: description_id || "", description: "Global Meta Description (ID)" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_KEYWORDS_KEY },
                update: { value: keywords || "", description: "Global SEO Keywords" },
                create: { key: SEO_KEYWORDS_KEY, value: keywords || "", description: "Global SEO Keywords" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_KEYWORDS_ID_KEY },
                update: { value: keywords_id || "", description: "Global SEO Keywords (ID)" },
                create: { key: SEO_KEYWORDS_ID_KEY, value: keywords_id || "", description: "Global SEO Keywords (ID)" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_OG_IMAGE_KEY },
                update: { value: ogImage || "", description: "Default Open Graph Image URL" },
                create: { key: SEO_OG_IMAGE_KEY, value: ogImage || "", description: "Default Open Graph Image URL" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_FAVICON_KEY },
                update: { value: favicon || "", description: "Site Favicon URL" },
                create: { key: SEO_FAVICON_KEY, value: favicon || "", description: "Site Favicon URL" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_GOOGLE_VERIFICATION_KEY },
                update: { value: googleVerification || "", description: "Google Site Verification Code" },
                create: { key: SEO_GOOGLE_VERIFICATION_KEY, value: googleVerification || "", description: "Google Site Verification Code" }
            }),
            prisma.systemSetting.upsert({
                where: { key: SEO_GA_ID_KEY },
                update: { value: gaId || "", description: "Google Analytics 4 Measurement ID" },
                create: { key: SEO_GA_ID_KEY, value: gaId || "", description: "Google Analytics 4 Measurement ID" }
            }),
        ];

        await prisma.$transaction(updates);

        revalidatePath("/", "layout");
        revalidatePath("/admin/system/seo", "page");
        revalidateTag("system-settings", "max");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("System SEO API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
