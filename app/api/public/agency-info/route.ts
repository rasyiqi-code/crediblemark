import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/server/settings";

export async function GET() {
    try {
        // ⚡ Bolt Optimization: Replaced direct Prisma query with cached getSystemSettings
        // 🎯 Why: Prevent redundant database queries for static system settings
        // 📊 Impact: Reduces database load and speeds up API response time
        const settings = await getSystemSettings(["AGENCY_NAME"]);

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap, {
            headers: {
                "Cache-Control": "public, max-age=86400",
                "CDN-Cache-Control": "public, max-age=86400",
                "Vercel-CDN-Cache-Control": "public, max-age=86400",
            }
        });
    } catch (error) {
        console.error("Public Agency Info Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
