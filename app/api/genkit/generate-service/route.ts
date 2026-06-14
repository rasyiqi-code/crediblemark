import { NextRequest, NextResponse } from "next/server";
import { serviceGeneratorFlow } from "@/app/genkit";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya admin yang boleh generate service content via AI
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { description } = body;

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        const result = await serviceGeneratorFlow(description);

        // Split unified addons into English (addons) and Indonesian (addons_id) arrays
        const addons = result.addons?.map(a => ({
            name: a.name,
            price: a.price,
            interval: a.interval,
            currency: a.currency
        })) || [];

        const addons_id = result.addons?.map(a => ({
            name: a.name_id,
            price: a.price,
            interval: a.interval,
            currency: a.currency
        })) || [];

        const transformedData = {
            ...result,
            addons,
            addons_id
        };

        return NextResponse.json({ success: true, data: transformedData });
    } catch (error) {
        console.error("Service Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate service content";
        const isConfigError = errorMessage.includes("not configured") || errorMessage.includes("API key");

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: isConfigError ? 412 : 500 }
        );
    }
}
