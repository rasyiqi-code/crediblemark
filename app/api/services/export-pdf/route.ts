import { NextRequest, NextResponse } from "next/server";
import { generateProposalHtml, ProposalMessages } from "@/lib/pdf/proposal-template";
import { getAgencyLogo, getCompanyStamp, getDirectorSignature } from "@/app/actions/system-admin";
import { getSystemSettings } from "@/lib/server/settings";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";
import type { Browser } from "puppeteer";

// Cache memori untuk stempel dan tanda tangan guna menghindari operasi pembacaan disk (I/O) berulang pada setiap request
let cachedStamp: string | null = null;
let cachedSignature: string | null = null;

const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

// Endpoint API untuk mengekspor proposal ke PDF dari sisi server menggunakan Puppeteer
// Menghindari kendala rendering layout responsif pada perangkat seluler (HP)
export async function POST(req: NextRequest) {
    let browser: Browser | null = null;

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

        const htmlContent = generateProposalHtml({
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

        // Jalankan Chromium headless menggunakan Puppeteer dengan opsi sesuai environment
        if (isProd) {
            // Di Vercel/Produksi: Gunakan puppeteer-core dan @sparticuz/chromium secara dinamis (asinkron)
            const puppeteerCore = await import("puppeteer-core");
            const chromium = (await import("@sparticuz/chromium")).default;
            const executablePath = await chromium.executablePath();
            
            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: executablePath,
                headless: chromium.headless,
            }) as unknown as Browser;
        } else {
            // Di Lokal: Gunakan puppeteer standar
            const puppeteerLocal = await import("puppeteer");
            browser = await puppeteerLocal.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage", // Menghindari crash memori pada docker/linux (/dev/shm)
                    "--disable-gpu", // Menonaktifkan render hardware GPU untuk hemat CPU & RAM di server
                    "--no-zygote", // Menonaktifkan proses zygote ekstra demi hemat memori
                    "--single-process", // Menjalankan di dalam satu proses utama Chromium
                    "--disable-extensions", // Menonaktifkan pemuatan ekstensi
                    "--disable-audio-output" // Mencegah pemuatan driver suara
                ]
            });
        }
        
        const page = await browser.newPage();
        
        // Atur ukuran viewport agar merender layout desktop (A4 lebar 794px @ 96 DPI)
        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 2 // Menghasilkan kualitas rendering teks dan gambar lebih tajam
        });

        // Set konten HTML proposal dan tunggu hingga resources selesai dimuat
        await page.setContent(htmlContent, { 
            waitUntil: "networkidle0" as "load"
        });

        // Generate PDF buffer dengan format A4 dan background aktif
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "0px",
                bottom: "0px",
                left: "0px",
                right: "0px"
            }
        });

        await browser.close();
        browser = null; // Set null agar tidak ditutup ganda di blok finally

        const fileName = `${service.title.replace(/[^a-z0-9]/gi, '_')}_Proposal.pdf`;

        // Bungkus buffer dengan Blob agar kompatibel dengan constructor NextResponse (BodyInit) tanpa type error
        const pdfBlob = new Blob([pdfBuffer as unknown as BlobPart], { type: "application/pdf" });

        // Kirimkan Blob PDF sebagai unduhan langsung
        return new NextResponse(pdfBlob, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Content-Length": pdfBuffer.length.toString()
            }
        });
    } catch (error) {
        console.error("Gagal mengekspor PDF proposal via server:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    } finally {
        // PERTAHANAN UTAMA: Menjamin browser selalu ditutup pada skenario error apa pun
        // Mencegah penumpukan proses zombie Chromium yang dapat menghabiskan memori RAM server (OOM)
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error("Gagal menutup browser Puppeteer di blok finally:", closeError);
            }
        }
    }
}
