
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/db";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { slugify } from "@/lib/shared/utils";
import { Prisma } from "@prisma/client";


export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 50
        });
        return NextResponse.json(services, {
            headers: {
                "Cache-Control": "public, max-age=3600"
            }
        });
    } catch (error) {
        console.error("Service API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const user = await hexclaveServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();

        // CREATE LOGIC
        const title = formData.get("title")?.toString();
        const title_id = formData.get("title_id")?.toString();
        const description = formData.get("description")?.toString();
        const description_id = formData.get("description_id")?.toString();
        const priceRaw = formData.get("price")?.toString();
        const currency = formData.get("currency")?.toString() || "USD";
        const interval = formData.get("interval")?.toString() || "one_time";
        const featuresRaw = formData.get("features")?.toString() || "";
        const featuresIdRaw = formData.get("features_id")?.toString() || "";
        const imageFile = formData.get("image") as File;
        const slugInput = formData.get("slug")?.toString();

        // Validation
        if (!title || !description || !title_id || !description_id || !priceRaw) {
            console.error("Missing required fields in POST /api/services", { title, title_id, hasDescription: !!description, hasDescriptionId: !!description_id, priceRaw });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const price = parseFloat(priceRaw);
        if (isNaN(price)) {
            return NextResponse.json({ error: "Invalid price format" }, { status: 400 });
        }

        const features = featuresRaw.split('\n').map(f => f.trim()).filter(f => f !== '');
        const features_id = featuresIdRaw.split('\n').map(f => f.trim()).filter(f => f !== '');

        let imageUrl = null;
        if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
            try {
                const { uploadFile } = await import("@/lib/integrations/storage");
                imageUrl = await uploadFile(imageFile, `services/${Date.now()}-${imageFile.name}`);
            } catch (storageError) {
                console.error("Storage upload failed:", storageError);
                // Continue without image or handle as error? For now continue.
            }
        }

        const service = await prisma.service.create({
            data: {
                title,
                title_id,
                description,
                description_id,
                price,
                priceType: formData.get("priceType")?.toString() || "FIXED",
                currency,
                interval,
                category: formData.get("category")?.toString() || "Uncategorized",
                visibility: formData.get("visibility")?.toString() || "PUBLIC",
                features,
                features_id,
                image: imageUrl,
                slug: slugInput ? slugify(slugInput) : slugify(title)
            } as Prisma.ServiceCreateInput
        });

        return NextResponse.json(service, { status: 201 });

    } catch (error) {
        console.error("CRITICAL Service API Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
