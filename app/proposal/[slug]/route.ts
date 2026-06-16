import { NextRequest } from "next/server";
import { prisma } from "@/lib/config/db";
import { generateProposalHtml, ProposalMessages } from "@/lib/pdf/proposal-template";
import { getAgencyLogo, getCompanyStamp, getDirectorSignature } from "@/app/actions/system-admin";
import { getSystemSettings } from "@/lib/server/settings";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";

// Route Handler khusus untuk merender HTML proposal secara terisolasi penuh.
// Membuka route ini secara fisik di tab/window baru menjamin peramban mobile
// memfokuskan context print native secara presisi pada konten proposal saja,
// sehingga terbebas dari kesalahan cetak halaman asal detail layanan.
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Cari data service berdasarkan slug, dengan fallback pencarian berdasarkan ID
        let service = await prisma.service.findUnique({
            where: { slug }
        });

        if (!service) {
            service = await prisma.service.findUnique({
                where: { id: slug }
            });
        }

        if (!service) {
            return new Response("Proposal/Service tidak ditemukan", { status: 404 });
        }

        // Dapatkan parameter bahasa (locale), default ke bahasa Indonesia ('id')
        const { searchParams } = new URL(req.url);
        const locale = searchParams.get("locale") || "id";

        // Ambil data addons dari database
        const globalAddons = await prisma.addon.findMany({
            where: { isActive: true }
        });

        // Ambil logo, stempel, dan tanda tangan digital
        const logoUrl = await getAgencyLogo();
        const stampUrl = await getCompanyStamp();
        const signatureUrl = await getDirectorSignature();

        // Ambil info kontak agensi dari pengaturan sistem
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
            service: {
                id: service.id,
                title: service.title,
                title_id: service.title_id,
                description: service.description,
                description_id: service.description_id,
                price: service.price,
                discount: service.discount,
                currency: service.currency,
                interval: service.interval,
                priceType: service.priceType,
                features: service.features,
                features_id: service.features_id
            },
            logoUrl,
            signatureUrl,
            stampUrl,
            contactInfo,
            locale,
            user: null,
            globalAddons: globalAddons.map(a => ({
                id: a.id,
                name: a.name,
                name_id: a.name_id || "",
                description: "",
                price: Number(a.price),
                currency: a.currency || "USD",
                interval: a.interval
            })),
            messages,
            baseUrl: req.nextUrl.origin
        });

        // Sisipkan skrip pencetakan otomatis native di peramban setelah seluruh aset visual (font & gambar) siap
        const printTriggerScript = `
        <script>
            // Mencegah pergeseran visual dengan memastikan font lokal termuat penuh sebelum dialog cetak tampil
            if (document.fonts && typeof document.fonts.ready !== "undefined") {
                document.fonts.ready.then(function() {
                    setTimeout(function() {
                        window.focus();
                        window.print();
                    }, 1200);
                });
            } else {
                window.onload = function() {
                    setTimeout(function() {
                        window.focus();
                        window.print();
                    }, 1200);
                };
            }
        </script>
        </body>
        `;
        const finalHtml = html.replace("</body>", printTriggerScript);

        return new Response(finalHtml, {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });

    } catch (error) {
        console.error("Gagal men-generate preview proposal:", error);
        return new Response("Terjadi kesalahan internal saat memuat proposal", { status: 500 });
    }
}
