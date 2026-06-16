import { NextRequest, NextResponse } from "next/server";
import { generateProposalHtml, ProposalMessages } from "@/lib/pdf/proposal-template";
import { getAgencyLogo, getCompanyStamp, getDirectorSignature } from "@/app/actions/system-admin";
import { getSystemSettings } from "@/lib/server/settings";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";

// Cache memori untuk stempel dan tanda tangan guna menghindari operasi pembacaan disk (I/O) berulang pada setiap request
let cachedStamp: string | null = null;
let cachedSignature: string | null = null;

// Endpoint API untuk menghasilkan HTML proposal dari database.
// HTML ini kemudian akan diunduh sebagai PDF di sisi klien menggunakan html2pdf.js
// guna menghindari beban server (Chromium/Puppeteer) dan menghemat sumber daya.
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { service, locale, user, globalAddons } = body;

        if (!service) {
            return NextResponse.json({ error: "Missing service data" }, { status: 400 });
        }

        // Ambil data logo, stempel, dan tanda tangan (menggunakan cache untuk stempel & tanda tangan)
        const logoUrl = await getAgencyLogo();
        
        if (!cachedStamp) {
            cachedStamp = await getCompanyStamp();
        }
        const stampUrl = cachedStamp;

        if (!cachedSignature) {
            cachedSignature = await getDirectorSignature();
        }
        const signatureUrl = cachedSignature;

        // Ambil detail kontak dari pengaturan sistem
        const settings = await getSystemSettings([
            "CONTACT_EMAIL",
            "CONTACT_PHONE",
            "CONTACT_TELEGRAM",
            "CONTACT_ADDRESS",
            "CONTACT_HOURS"
        ]);
        const getVal = (key: string) => settings.find(s => s.key === key)?.value || null;
        
        const contactInfo = {
            email: getVal("CONTACT_EMAIL") || "",
            phone: getVal("CONTACT_PHONE") || "",
            telegram: getVal("CONTACT_TELEGRAM") || "",
            address: getVal("CONTACT_ADDRESS") || "",
            hours: getVal("CONTACT_HOURS") || ""
        };

        const rawMessages = locale.startsWith("en") ? enMessages : idMessages;
        const messages = rawMessages as unknown as ProposalMessages;

        const html = generateProposalHtml({
            service,
            logoUrl,
            signatureUrl,
            stampUrl,
            contactInfo,
            locale,
            user,
            globalAddons,
            messages,
            baseUrl: req.nextUrl.origin
        });

        // Kembalikan HTML yang telah digenerate kepada client
        return NextResponse.json({ html });
    } catch (error) {
        console.error("Gagal men-generate HTML proposal:", error);
        return NextResponse.json({ error: "Failed to generate proposal HTML" }, { status: 500 });
    }
}
