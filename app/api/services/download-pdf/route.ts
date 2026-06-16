import { NextRequest, NextResponse } from "next/server";

// API Route GET untuk memaksa unduhan file PDF di browser (mobile & desktop)
// menggunakan header Content-Disposition: attachment
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const url = searchParams.get("url");
        const filename = searchParams.get("filename") || "Proposal.pdf";

        if (!url) {
            return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
        }

        // Ambil file PDF dari storage (Vercel Blob / R2 / dll)
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Gagal mengambil berkas dari storage: ${response.statusText}`);
        }

        const fileBuffer = await response.arrayBuffer();

        // Kirimkan response unduhan langsung dengan header attachment
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": fileBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error("Gagal memproses unduhan PDF proposal:", error);
        return NextResponse.json({ error: "Failed to download PDF" }, { status: 500 });
    }
}
