
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getClient } from "@/lib/integrations/storage";



export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        return new NextResponse("Missing key", { status: 400 });
    }

    try {
        const s3 = await getClient();
        if (!s3) {
            return new NextResponse("Storage not configured", { status: 500 });
        }

        const command = new GetObjectCommand({
            Bucket: s3.bucketName,
            Key: key,
        });

        const response = await s3.client.send(command);

        if (!response.Body) {
            return new NextResponse("File not found", { status: 404 });
        }

        // Convert stream to Web Response
        const stream = response.Body.transformToWebStream();

        return new NextResponse(stream, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
                "CDN-Cache-Control": "public, max-age=31536000, immutable",
                "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Failed to fetch image", { status: 500 });
    }
}
