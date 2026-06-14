import { NextRequest, NextResponse } from "next/server";
import { 
    serviceContentGeneratorFlow, 
    servicePricingGeneratorFlow, 
    serviceAddonsGeneratorFlow 
} from "@/app/genkit";
import { isAdmin } from "@/lib/shared/auth-helpers";

export async function POST(req: NextRequest) {
    try {
        // Auth check: hanya admin yang boleh generate service content via AI
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
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
            interval
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
            });
        } else if (type === 'addons') {
            if (!title || !description) {
                return NextResponse.json({ error: "Title and description are required for addons generation" }, { status: 400 });
            }
            const addonsResult = await serviceAddonsGeneratorFlow({
                title,
                title_id: title_id || title,
                description,
                description_id: description_id || description,
                features: features || [],
                features_id: features_id || features || [],
                recommended_price: recommended_price ? Number(recommended_price) : 0,
                discount: discount !== undefined ? Number(discount) : 0,
                currency: currency || 'USD',
                priceType: priceType || 'FIXED',
                interval: interval || 'one_time'
            });

            interface AddonItem {
                name: string;
                name_id?: string;
                price: number;
                interval: 'one_time' | 'monthly' | 'yearly';
                currency: 'USD' | 'IDR';
            }

            const addons = addonsResult.addons?.map((a: AddonItem) => ({
                name: a.name,
                price: a.price,
                interval: a.interval,
                currency: a.currency
            })) || [];

            const addons_id = addonsResult.addons?.map((a: AddonItem) => ({
                name: a.name_id || a.name,
                price: a.price,
                interval: a.interval,
                currency: a.currency
            })) || [];

            return NextResponse.json({
                success: true,
                data: {
                    addons,
                    addons_id
                }
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
