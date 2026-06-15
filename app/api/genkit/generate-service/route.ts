import { NextRequest, NextResponse } from "next/server";
import { 
    serviceContentGeneratorFlow, 
    servicePricingGeneratorFlow, 
    singleAddonGeneratorFlow,
    bulkAddonsGeneratorFlow
} from "@/app/genkit";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya admin yang boleh generate service content via AI
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("=== API generate-service Request Body ===", JSON.stringify(body, null, 2));
        const {
            type,
            prompt,
            title,
            title_id,
            description,
            description_id,
            features,
            features_id,
            recommended_price,
            discount,
            currency,
            priceType,
            interval,
            targetBusinessScale
        } = body;

        if (!type) {
            return NextResponse.json({ error: "Type is required" }, { status: 400 });
        }

        let result;

        if (type === 'content') {
            if (!prompt) {
                return NextResponse.json({ error: "Prompt is required for content generation" }, { status: 400 });
            }
            result = await serviceContentGeneratorFlow(prompt);
        } else if (type === 'pricing') {
            if (!title || !description) {
                return NextResponse.json({ error: "Title and description are required for pricing generation" }, { status: 400 });
            }
            result = await servicePricingGeneratorFlow({
                title,
                title_id: title_id || title,
                description,
                description_id: description_id || description,
                features: features || [],
                features_id: features_id || features || [],
                targetBusinessScale: targetBusinessScale || 'AUTO'
            });

        } else if (type === 'single-addon') {
            if (!prompt) {
                return NextResponse.json({ error: "Prompt is required for single addon generation" }, { status: 400 });
            }
            const isEn = body.isEn === true || body.isEn === "true";
            result = await singleAddonGeneratorFlow({
                prompt,
                currency: currency || 'USD',
                targetBusinessScale: targetBusinessScale || 'AUTO',
                isEn
            });
        } else if (type === 'bulk-addons') {
            const existingAddons = Array.isArray(body.existingAddons) ? body.existingAddons : [];
            const count = body.count ? Number(body.count) : 10;
            result = await bulkAddonsGeneratorFlow({
                prompt: prompt || "",
                currency: currency || 'IDR',
                existingAddons,
                count
            });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
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
