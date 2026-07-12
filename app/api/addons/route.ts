import { NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";

export const revalidate = 86400; // Cache static selama 24 jam

export async function GET() {
    try {
        const addons = await prisma.addon.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" }
        });
        return NextResponse.json(addons, {
            headers: {
                "Cache-Control": "public, max-age=600"
            }
        });
    } catch (error) {
        console.error("GET ADDONS API ERROR:", error);
        return NextResponse.json({ error: "Gagal mengambil data addon" }, { status: 500 });
    }
}
