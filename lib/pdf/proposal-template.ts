import { ServiceAddon } from "@/lib/shared/types";

export interface ServiceDataForPdf {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    currency?: string | null;
    interval: string;
    priceType?: string | null;
    features?: unknown;
    features_id?: unknown;
    addons?: unknown;
    addons_id?: unknown;
}

export interface ProposalHtmlParams {
    service: ServiceDataForPdf;
    logoUrl: string | null;
    signatureUrl: string | null;
    stampUrl: string | null;
    contactInfo: {
        email: string;
        phone: string;
        telegram: string;
        address: string;
        hours: string;
    } | null;
    locale: string;
    user: {
        displayName?: string | null;
        email?: string | null;
    } | null;
    globalAddons?: ServiceAddon[];
    messages: any; // next-intl messages
}

export function generateProposalHtml({
    service,
    logoUrl,
    signatureUrl,
    stampUrl,
    contactInfo,
    locale,
    user,
    globalAddons = [],
    messages
}: ProposalHtmlParams): string {
    // Teks dan judul layanan asli dari database berdasarkan opsi lokalisasi yang aktif
    const title = service.title_id || service.title;
    const descriptionHtml = service.description_id || service.description;

    // Hitung harga final diskon
    const finalPrice = service.discount && service.discount > 0
        ? service.price * (1 - service.discount / 100)
        : service.price;

    const baseCurrency = service.currency || "USD";

    const formatPriceHelper = (amount: number) => {
        return baseCurrency === "IDR"
            ? `Rp ${amount.toLocaleString("id-ID")}`
            : `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formattedPrice = formatPriceHelper(finalPrice);

    const isEn = locale.startsWith("en");

    // Lokalisasi teks
    const intervalLabel = service.interval === 'one_time'
        ? (isEn ? 'One Time' : 'Sekali Bayar')
        : (service.interval === 'monthly' ? (isEn ? 'Monthly' : 'Bulanan') : (service.interval === 'yearly' ? (isEn ? 'Yearly' : 'Tahunan') : service.interval));

    const priceModel = service.priceType === 'STARTING_AT'
        ? (isEn ? 'Starting at' : 'Mulai dari')
        : (isEn ? 'Fixed Price' : 'Harga Pasti');

    // Tanggal pembuatan proposal hari ini
    const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Format fitur asli dari database (features)
    let featuresList: string[] = [];
    try {
        const rawFeatures = service.features_id || service.features || [];
        if (typeof rawFeatures === "string") {
            featuresList = rawFeatures.split('\n');
        } else if (Array.isArray(rawFeatures)) {
            featuresList = rawFeatures as string[];
        }
    } catch {
        featuresList = [];
    }

    const featuresListHtml = featuresList.map(feature => `
        <div class="feature-card-item">
            <div class="feature-card-dot"></div>
            <div class="feature-card-text">${feature}</div>
        </div>
    `).join("");

    // Format Addons dari database global (atau fallback ke addons lama jika kosong)
    let addonsList: ServiceAddon[] = [];
    if (globalAddons && globalAddons.length > 0) {
        addonsList = globalAddons;
    } else {
        try {
            const rawAddons = service.addons_id || service.addons || [];
            if (typeof rawAddons === "string") {
                addonsList = JSON.parse(rawAddons) as ServiceAddon[];
            } else if (Array.isArray(rawAddons)) {
                addonsList = rawAddons as ServiceAddon[];
            }
        } catch {
            addonsList = [];
        }
    }

    const generateAddonsTableRows = (addonsSubList: ServiceAddon[]) => {
        return addonsSubList.map(addon => {
            const addPrice = typeof addon.price === "string" ? parseFloat(addon.price) : (typeof addon.price === "number" ? addon.price : 0);
            const addonFormattedPrice = (addon.currency || baseCurrency) === "IDR"
                ? `Rp ${addPrice.toLocaleString("id-ID")}`
                : `$${addPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const addInterval = addon.interval === "one_time"
                ? (isEn ? "One Time" : "Sekali Bayar")
                : (addon.interval === "monthly" ? (isEn ? "Monthly" : "Bulanan") : (addon.interval === "yearly" ? (isEn ? "Yearly" : "Tahunan") : addon.interval));

            const displayName = !isEn ? (addon.name_id || addon.name) : addon.name;

            return `
                <tr>
                    <td><strong>${displayName}</strong><br><small style="color: #a1a1aa; font-size: 11px;">${addon.description || ''}</small></td>
                    <td>${addInterval}</td>
                    <td style="text-align: right; font-weight: 600; color: #fbbf24;">${addonFormattedPrice}</td>
                </tr>
            `;
        }).join("");
    };

    // Helper function to chunk array
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    // Chunk list addon per 6 item untuk mencegah overflow halaman
    const addonChunks = chunkArray(addonsList, 6);
    const addonsNeedNewPage = addonsList.length > 3;
    const addonPageCount = addonsNeedNewPage ? addonChunks.length : 0;

    // Data Filosofi & Slogan dari Landing Page / Lokalisasi
    const quoteText = messages.About.quote;
    const aboutDesc = messages.About.description;
    const heroDesc = messages.Hero.description;

    // Gabungkan deskripsi About dan Hero dengan tanda titik yang sesuai
    const formattedAboutDesc = aboutDesc.endsWith(".") ? aboutDesc : `${aboutDesc}.`;
    const combinedText = `${formattedAboutDesc} ${heroDesc}`;

    // Lokalisasi dinamis untuk Cover
    const tBusinessProposal = messages.ProposalExport.businessProposal;
    const tCoverSub = messages.ProposalExport.coverSub;
    const tPreparedFor = messages.ProposalExport.preparedFor;
    const tValuedClient = messages.ProposalExport.valuedClient;
    const clientName = user?.displayName || tValuedClient;
    const tProposalDate = messages.ProposalExport.proposalDate;

    // Lokalisasi dinamis untuk judul Section
    const tSec1Title = messages.ProposalExport.sec1Title;
    const tSec2Title = messages.ProposalExport.sec2Title;
    const tSec3Title = messages.ProposalExport.sec3Title;
    const tSec4Title = messages.ProposalExport.sec4Title;
    const tSec5Title = messages.ProposalExport.sec5Title;

    const totalPages = 7 + addonPageCount;

    const getPageFooterHtml = (page: number) => {
        const template = messages.ProposalExport.pageFooter;
        return template
            .replace("{page}", page.toString())
            .replace(/\b6\b/, totalPages.toString());
    };

    // Lokalisasi dinamis untuk Halaman 3
    const tFeaturesIntro = messages.ProposalExport.featuresIntro;
    const tFallbackFeature = messages.ProposalExport.fallbackFeature.replace("{title}", title);

    // Lokalisasi dinamis untuk Halaman 4 (Comparison & Premium deliverables)
    const tCompTitle = messages.Comparison.title.replace("{brand}", "Crediblemark");
    const tCompSubtitle = messages.Comparison.subtitle;
    const tCompOldTitle = messages.Comparison.oldTitle;
    const tCompNewTitle = messages.Comparison.newTitle.replace("{brand}", "Crediblemark");

    const old1 = messages.Comparison.old1;
    const old1Sub = messages.Comparison.old1Sub;
    const old2 = messages.Comparison.old2;
    const old2Sub = messages.Comparison.old2Sub;
    const old3 = messages.Comparison.old3;
    const old3Sub = messages.Comparison.old3Sub;
    const old4 = messages.Comparison.old4;
    const old4Sub = messages.Comparison.old4Sub;

    const new1 = messages.Comparison.new1;
    const new1Sub = messages.Comparison.new1Sub;
    const new2 = messages.Comparison.new2;
    const new2Sub = messages.Comparison.new2Sub;
    const new3 = messages.Comparison.new3;
    const new3Sub = messages.Comparison.new3Sub;
    const new4 = messages.Comparison.new4;
    const new4Sub = messages.Comparison.new4Sub;

    const tEverything = messages.Service.everythingToSucceed;
    const tPremiumStandard = messages.Service.premiumStandard;
    const f1 = messages.Service.f1;
    const f2 = messages.Service.f2;
    const f3 = messages.Service.f3;
    const f4 = messages.Service.f4;
    const f5 = messages.Service.f5;
    const f6 = messages.Service.f6;

    // Lokalisasi dinamis untuk Halaman 5 (Financial & Pricing)
    const tFinTitle = messages.Financial.title;
    const tFinSubtitle = messages.Financial.subtitle;
    const tFinHireOld = messages.Financial.hireSenior;
    const tFinHireNew = messages.Financial.hybrid.replace("{brand}", "Crediblemark");

    const tFinOverheadLabel = messages.Financial.salaryOldValue;
    const tFinOverheadDesc = messages.Financial.salaryOld;
    const tFinProjectLabel = messages.Financial.salaryNewValue;
    const tFinProjectDesc = messages.Financial.salaryNew;

    const fin1Old = messages.Financial.comp1Old;
    const fin1New = messages.Financial.comp1New;
    const fin2Old = messages.Financial.comp2Old;
    const fin2New = messages.Financial.comp2New;
    const fin3Old = messages.Financial.comp3Old;
    const fin3New = messages.Financial.comp3New;

    const tInvestTitle = messages.ProposalExport.investTitle;
    const tBaseInvestLabel = messages.ProposalExport.baseInvestLabel.replace("{priceModel}", priceModel);

    const tAddonHeaderModule = messages.ProposalExport.addonHeaderModule;
    const tAddonHeaderScheme = messages.ProposalExport.addonHeaderScheme;
    const tAddonHeaderInvest = messages.ProposalExport.addonHeaderInvest;

    // Lokalisasi dinamis untuk Halaman 6 (FAQ, Guarantee, Otorisasi)
    const tFaqTitle = messages.FAQ.title;
    const tMoreInfoAt = messages.ProposalExport.moreInfoAt;

    const faqQ1 = messages.FAQ.q4;
    const faqA1 = messages.FAQ.a4;
    const faqQ2 = messages.FAQ.q3;
    const faqA2 = messages.FAQ.a3;
    const faqQ3 = messages.FAQ.q13;
    const faqA3 = messages.FAQ.a13;

    const tGuarTitle = messages.Guarantee.title;
    const tGuarSubtitle = messages.Guarantee.subtitle.replace("\n", " ");
    const tGuarDesc = `${messages.Guarantee.desc} ${messages.Guarantee.footer}`;

    const tAgreementText = messages.ProposalExport.agreementText;
    const tClientRepresentative = messages.ProposalExport.clientRepresentative;

    const addonsPagesHtml = addonsNeedNewPage ? addonChunks.map((chunk, chunkIdx) => {
        const pageNum = 6 + chunkIdx;
        
        const pageTitle = chunkIdx === 0
            ? (isEn ? "04.2 / Optional Add-on Modules" : "04.2 / Modul Add-on Opsional")
            : (isEn ? "04.2 / Optional Add-on Modules (Continued)" : "04.2 / Modul Add-on Opsional (Lanjutan)");

        const pageIntro = isEn
            ? "Detailed breakdown of the selected optional add-on modules configured to customize the scalability of your infrastructure and digital system:"
            : "Rincian modul tambahan pilihan yang dikonfigurasi untuk menyesuaikan kebutuhan skalabilitas infrastruktur dan sistem digital Anda:";

        return `
        <!-- HALAMAN ADD-ON: HALAMAN ${chunkIdx + 1} -->
        <div class="page">
            <div class="section-header">
                <h2 class="section-title">${pageTitle}</h2>
                <span class="section-subtitle-badge">${getPageFooterHtml(pageNum)}</span>
            </div>
     
            <div class="body-section" style="margin-top: 10px;">
                ${chunkIdx === 0 ? `
                <p class="paragraph-text" style="font-size: 14px; color: #ffffff; margin-bottom: 20px;">
                    ${pageIntro}
                </p>
                ` : ''}
                <table class="proposal-table">
                    <thead>
                        <tr>
                            <th>${tAddonHeaderModule}</th>
                            <th>${tAddonHeaderScheme}</th>
                            <th style="text-align: right;">${tAddonHeaderInvest}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateAddonsTableRows(chunk)}
                    </tbody>
                </table>
            </div>
     
            <div class="page-footer">
                <span>CREDIBLEMARK &bull; Proposal ${title}</span>
                <span>${getPageFooterHtml(pageNum)}</span>
            </div>
        </div>
        `;
    }).join("") : "";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title} - Proposal Layanan</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #ffffff;
            background: #000000;
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 16px;
        }
        
        @page {
            size: A4 portrait;
            margin: 0;
        }
        
        .page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            position: relative;
            background: #000000;
            overflow: hidden;
            padding: 25mm 20mm;
        }
        
        /* Halaman Cover (Estetika Tinggi - Dark Theme) */
        .page-cover {
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: radial-gradient(circle at top right, rgba(250, 204, 21, 0.15) 0%, transparent 60%), #000000;
        }
        
        .cover-top-accent {
            position: absolute;
            top: -160px;
            right: -160px;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            background: linear-gradient(135deg, #facc15 0%, #fbbf24 100%);
            z-index: 1;
            opacity: 0.85;
            filter: blur(1px);
        }
        
        .cover-top-accent-sub {
            position: absolute;
            top: 60px;
            right: 230px;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            background: #ffffff;
            opacity: 0.1;
            z-index: 2;
        }
        
        .cover-bottom-accent {
            position: absolute;
            bottom: -120px;
            left: -120px;
            width: 380px;
            height: 380px;
            border-radius: 50%;
            background: linear-gradient(45deg, #fbbf24 0%, #000000 100%);
            z-index: 1;
            opacity: 0.6;
            filter: blur(10px);
        }
        
        .cover-bottom-stripes {
            position: absolute;
            bottom: 90px;
            left: 220px;
            width: 140px;
            height: 140px;
            background: radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 40%, transparent 40%, transparent 60%, #facc15 60%, #facc15 80%, transparent 80%);
            background-size: 18px 18px;
            opacity: 0.08;
            z-index: 2;
        }
        
        .cover-content {
            position: relative;
            z-index: 10;
            height: 100%;
            padding: 45mm 20mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex-grow: 1;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15mm;
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 2px;
        }
        
        .main-title-box {
            margin-top: 10mm;
        }
        
        .proposal-badge {
            display: inline-block;
            background: #fbbf24;
            color: #000000;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            padding: 6px 14px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .main-title {
            font-family: 'Playfair Display', serif;
            font-size: 45px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.2;
            margin-bottom: 24px;
        }
        
        .title-divider {
            width: 75mm;
            height: 3px;
            background: #facc15;
            margin-bottom: 28px;
        }
        
        .sub-title {
            font-size: 17px;
            color: #ffffff;
            font-weight: 400;
            max-width: 145mm;
            line-height: 1.7;
        }
        
        .cover-footer {
            margin-top: auto;
            border-top: 1px solid #27272a;
            padding-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .metadata-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #ffffff;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }
        
        .metadata-value {
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
        }
        
        /* Halaman Standar (Dark Theme) */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #27272a;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        
        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 30px;
            font-weight: 700;
            color: #ffffff;
        }
        
        .section-subtitle-badge {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #fbbf24;
            font-weight: 700;
        }
        
        .body-section {
            margin-bottom: 30px;
        }
        
        .body-section-title {
            font-size: 17px;
            font-weight: 700;
            color: #fbbf24;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .desc-content {
            font-size: 16px;
            color: #ffffff;
            line-height: 1.8;
        }
        
        .desc-content p {
            margin-bottom: 16px;
            text-align: justify;
        }
        
        .desc-content ul, .desc-content ol {
            margin-left: 24px;
            margin-bottom: 16px;
        }
        
        .desc-content li {
            margin-bottom: 8px;
        }
        
        /* Scope / Fitur Grid */
        .scope-container {
            background: #09090b;
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 24px;
            margin-top: 15px;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 10px;
        }
        
        .feature-card-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: #18181b;
            border: 1px solid #27272a;
            border-left: 4px solid #fbbf24;
            border-radius: 6px;
            padding: 14px 18px;
        }
        
        .feature-card-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #fbbf24;
            margin-top: 8px;
            flex-shrink: 0;
        }
        
        .feature-card-text {
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.5;
        }
        
        /* Comparison Grid */
        .comp-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 10px;
        }
        
        .comp-box {
            border-radius: 8px;
            padding: 20px;
            font-size: 14.5px;
        }
        
        .comp-box.old {
            border: 1px solid #27272a;
            background: #18181b;
        }
        
        .comp-box.new {
            border: 1.5px solid #d97706;
            background: #1c1917;
        }
        
        .comp-title-bar {
            font-size: 17px;
            font-weight: 800;
            margin-bottom: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .comp-title-bar.old {
            color: #ffffff;
            border-bottom: 1px solid #27272a;
            padding-bottom: 8px;
        }
        
        .comp-title-bar.new {
            color: #fbbf24;
            border-bottom: 1px solid #d97706;
            padding-bottom: 8px;
        }
        
        .comp-item {
            display: flex;
            align-items: start;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .comp-icon {
            font-size: 19px;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 1px;
        }
        
        .comp-icon.old {
            color: #f87171;
        }
        
        .comp-icon.new {
            color: #fbbf24;
        }
        
        .comp-item-text {
            line-height: 1.5;
            color: #ffffff;
        }
        
        /* Jaminan Premium Grid */
        .success-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        
        .success-card {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            align-items: start;
            gap: 14px;
        }
        
        .success-icon-box {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #fbbf24;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14.5px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .success-content {
            display: flex;
            flex-direction: column;
        }
        
        .success-card-title {
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 6px;
        }
        
        .success-card-desc {
            font-size: 13px;
            color: #ffffff;
            line-height: 1.5;
        }
        
        /* Guarantee Box */
        .guarantee-box {
            background: #1c1917;
            border: 1.5px solid #d97706;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            position: relative;
        }
        
        .guarantee-badge {
            display: inline-block;
            background: #fbbf24;
            color: #000000;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 4px 12px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .guarantee-title {
            font-size: 16px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
        }
        
        .guarantee-desc {
            font-size: 14px;
            color: #ffffff;
            line-height: 1.6;
            text-align: justify;
        }
        
        /* Financial Logic Grid Halaman 5 */
        .fin-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 10px;
        }
        
        .fin-box {
            border-radius: 8px;
            padding: 14px 18px;
            font-size: 13.5px;
            display: flex;
            flex-direction: column;
        }
        
        .fin-box.old {
            border: 1px solid #27272a;
            background: #18181b;
        }
        
        .fin-box.new {
            border: 1.5px solid #d97706;
            background: #1c1917;
        }
        
        .fin-title-bar {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .fin-title-bar.old {
            color: #ffffff;
        }
        
        .fin-title-bar.new {
            color: #fbbf24;
        }
        
        .fin-sub-value {
            font-size: 15.5px;
            font-weight: 700;
            margin-top: 4px;
        }
        
        .fin-sub-value.old {
            color: #f87171;
        }
        
        .fin-sub-value.new {
            color: #fbbf24;
        }
        
        .fin-desc {
            font-size: 12px;
            color: #ffffff;
            margin-top: 2px;
            margin-bottom: 10px;
        }
        
        .fin-divider {
            height: 1px;
            background: #27272a;
            margin-bottom: 10px;
        }
        
        .fin-box.new .fin-divider {
            background: #78350f;
        }
        
        .fin-item {
            display: flex;
            align-items: start;
            gap: 8px;
            margin-bottom: 8px;
            line-height: 1.4;
            color: #ffffff;
            font-size: 13.5px;
        }
        
        .fin-icon {
            font-size: 15px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .fin-icon.old {
            color: #f87171;
        }
        
        .fin-icon.new {
            color: #fbbf24;
        }
        
        /* Investasi Section */
        .pricing-banner {
            background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        
        .pricing-info {
            display: flex;
            flex-direction: column;
        }
        
        .pricing-price {
            font-size: 35px;
            font-weight: 700;
            color: #fbbf24;
        }
        
        /* Tables */
        .proposal-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            margin-top: 10px;
        }
        
        .proposal-table th {
            background: #18181b;
            color: #ffffff;
            font-size: 12.5px;
            font-weight: 600;
            text-align: left;
            padding: 12px 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .proposal-table td {
            padding: 12px 14px;
            font-size: 14.5px;
            border-bottom: 1px solid #27272a;
            color: #ffffff;
            vertical-align: middle;
        }
        
        .proposal-table tr:nth-child(even) td {
            background: #09090b;
        }
        
        /* Tanda Tangan */
        .signatures-container {
            margin-top: 8mm;
            display: flex;
            justify-content: space-between;
        }
        
        .sig-box {
            width: 65mm;
            display: flex;
            flex-direction: column;
            padding-top: 28mm;
        }
        
        .sig-line {
            border-bottom: 1px solid #ffffff;
            height: 10mm;
            margin-bottom: 8px;
        }
        
        .sig-name {
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
        }
        
        .sig-title {
            font-size: 13px;
            color: #ffffff;
        }
        
        /* FAQ Section */
        .faq-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
            margin-bottom: 15px;
        }
        
        .faq-item {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            padding: 10px 14px;
        }
        
        .faq-question {
            font-size: 14px;
            font-weight: 700;
            color: #fbbf24;
            margin-bottom: 4px;
        }
        
        .faq-answer {
            font-size: 13px;
            color: #ffffff;
            line-height: 1.5;
        }
        
        /* Footer Halaman */
        .page-footer {
            position: absolute;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #27272a;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #ffffff;
        }
        
        /* Contact Page Styles */
        .contact-container {
            display: flex;
            flex-direction: column;
            gap: 25px;
            margin-top: 30px;
        }
        
        .contact-header-title {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 10px;
        }
        
        .contact-header-desc {
            font-size: 16px;
            color: #a1a1aa;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .contact-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 20px;
            background: #09090b;
            border: 1px solid #27272a;
            padding: 16px 20px;
            border-radius: 12px;
        }
        
        .contact-icon-box {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            background: #18181b;
            border: 1px solid #27272a;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fbbf24;
            flex-shrink: 0;
        }
        
        .contact-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .contact-label {
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
        }
        
        .contact-value {
            font-size: 14.5px;
            color: #a1a1aa;
            line-height: 1.5;
        }
        
        .contact-value a {
            color: #fbbf24;
            text-decoration: none;
            font-weight: 500;
        }
        
        .contact-subvalue {
            color: #71717a;
            font-size: 12.5px;
        }
        
        .page-addons {
            width: 210mm;
            min-height: 297mm;
            page-break-after: always;
            position: relative;
            background: #000000;
            padding: 25mm 20mm 35mm 20mm;
        }
        .page-addons .proposal-table {
            page-break-inside: auto;
        }
        .page-addons .proposal-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        .page-footer-dynamic {
            margin-top: 15mm;
            border-top: 1px solid #27272a;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #ffffff;
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <!-- HALAMAN 1: COVER -->
    <div class="page page-cover">
        <div class="cover-top-accent"></div>
        ${service.discount && service.discount > 0 ? `
        <div style="position: absolute; top: 50px; right: 50px; z-index: 10; text-align: center; color: #000000; transform: rotate(12deg); font-family: 'Plus Jakarta Sans', sans-serif; pointer-events: none; width: 140px;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8;">
                ${isEn ? "EXCLUSIVE" : "DISKON"}
            </div>
            <div style="font-size: 82px; font-weight: 900; line-height: 0.85; letter-spacing: -4px; margin: -2px 0;">
                ${service.discount}%
            </div>
            <div style="font-size: 14px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                ${isEn ? "OFF" : "UNTUK ANDA"}
            </div>
        </div>
        ` : ''}
        <div class="cover-top-accent-sub"></div>
        <div class="cover-bottom-accent"></div>
        <div class="cover-bottom-stripes"></div>
        
        <div class="cover-content">
            <div class="logo-container">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 32px; width: auto; object-fit: contain;" />` : ''}
                <div class="logo-text">CREDIBLEMARK</div>
            </div>
            
            <div class="main-title-box">
                <span class="proposal-badge">${tBusinessProposal}</span>
                <h1 class="main-title">${title}</h1>
                <div class="title-divider"></div>
                <p class="sub-title">${tCoverSub}</p>
            </div>
            
            <div class="cover-footer" style="align-items: center;">
                <div style="background: #ffffff; padding: 16px 22px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25); border: 1.5px solid #e4e4e7; max-width: 110mm;">
                    <div class="metadata-label" style="color: #71717a; font-size: 11px; font-weight: 800; margin-bottom: 6px; letter-spacing: 0.5px;">${tPreparedFor}</div>
                    <div class="metadata-value" style="color: #09090b; font-size: 20px; font-weight: 800; line-height: 1.2;">${clientName}</div>
                </div>
                <div style="text-align: right;">
                    <!-- Area Nomor WA Crediblemark -->
                    <div style="margin-bottom: 12px; display: inline-flex; align-items: center; gap: 6px; background: rgba(37, 211, 102, 0.1); border: 1.5px solid #25D366; padding: 6px 12px; border-radius: 6px; text-align: left;">
                        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #25D366;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        <div>
                            <div style="font-size: 8px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">WhatsApp Support</div>
                            <div style="font-size: 13px; font-weight: 800; color: #25D366; line-height: 1.2; margin-top: 2px;">
                                <a href="https://wa.me/${contactInfo?.phone?.replace(/[^0-9]/g, '') || '6285183131249'}" target="_blank" style="color: #25D366; text-decoration: none;">
                                    ${contactInfo?.phone || '+62 851-8313-1249'}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div style="clear: both;"></div>
                    <div class="metadata-value" style="font-size: 14px; font-weight: 600; color: #ffffff;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.5px; margin-right: 6px; font-weight: 500;">${tProposalDate}:</span>
                        ${dateStr}
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- HALAMAN 2: DESKRIPSI LAYANAN ASLI & FILOSOFI SOLUSI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec1Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(2)}</span>
        </div>
        
        <div class="body-section" style="margin-bottom: 25px;">
            <div class="desc-content">
                ${descriptionHtml}
            </div>
        </div>

        <!-- FILOSOFI SOLUSI -->
        <div class="body-section" style="margin-top: 30px; border-top: 1px solid #27272a; padding-top: 25px;">
            <div style="background: #09090b; border: 1px solid #27272a; border-left: 4px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                <p style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; font-style: italic; color: #ffffff; line-height: 1.5; margin: 0;">
                    &ldquo;${quoteText}&rdquo;
                </p>
            </div>
            
            <p class="paragraph-text" style="font-size: 14.5px; color: #ffffff; line-height: 1.8; text-align: justify; font-weight: 400; margin-bottom: 20px;">
                ${combinedText}
            </p>

            <div style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; font-style: italic; color: #fbbf24; margin-top: 15px; letter-spacing: 0.5px;">
                Build to Scale, Design to Prevail
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(2)}</span>
        </div>
    </div>
    
    <!-- HALAMAN 3: FITUR & DELIVERABLES ASLI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec2Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(3)}</span>
        </div>
 
        <div class="body-section">
            <p class="paragraph-text" style="font-size: 16px; color: #ffffff; margin-bottom: 15px;">
                ${tFeaturesIntro}
            </p>
            
            <div class="scope-container">
                <div class="features-grid">
                    ${featuresListHtml ? featuresListHtml : `
                        <div class="feature-card-item">
                            <div class="feature-card-dot"></div>
                            <div class="feature-card-text">${tFallbackFeature}</div>
                        </div>
                    `}
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(3)}</span>
        </div>
    </div>
 
    <!-- HALAMAN 4: KEMITRAAN & JAMINAN STANDAR PREMIUM -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec3Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(4)}</span>
        </div>
 
        <!-- Kenapa Pilih Kami (Comparison Section) -->
        <div class="body-section" style="margin-bottom: 25px;">
            <h3 class="body-section-title">${tCompTitle}</h3>
            <p class="paragraph-text" style="font-size: 14px; color: #ffffff; margin-bottom: 8px;">
                ${tCompSubtitle}
            </p>
            <div class="comp-container">
                <div class="comp-box old">
                    <div class="comp-title-bar old">${tCompOldTitle}</div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old1}</strong> ${old1Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old2}</strong> ${old2Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old3}</strong> ${old3Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old4}</strong> ${old4Sub}</div>
                    </div>
                </div>
                <div class="comp-box new">
                    <div class="comp-title-bar new">${tCompNewTitle}</div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new1}</strong> ${new1Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new2}</strong> ${new2Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new3}</strong> ${new3Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new4}</strong> ${new4Sub}</div>
                    </div>
                </div>
            </div>
        </div>
 
        <!-- Jaminan Standar Premium (f1 - f6) -->
        <div class="body-section">
            <h3 class="body-section-title">${tEverything}</h3>
            
            <div class="success-grid" style="margin-top: 8px;">
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f1}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f2}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f3}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f4}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f5}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f6}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(4)}</span>
        </div>
    </div>
 
    <!-- HALAMAN 5: INVESTASI & LOGIKA FINANSIAL -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec4Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(5)}</span>
        </div>
 
        <!-- Yang Jarang Disadari (Logika Finansial) -->
        <div class="body-section" style="margin-bottom: 20px;">
            <h3 class="body-section-title">${tFinTitle}</h3>
            <p class="paragraph-text" style="font-size: 14px; color: #ffffff; margin-bottom: 8px;">
                ${tFinSubtitle}
            </p>
            <div class="fin-container">
                <div class="fin-box old">
                    <div class="fin-title-bar old">${tFinHireOld}</div>
                    <div class="fin-sub-value old">${tFinOverheadLabel}</div>
                    <div class="fin-desc old">${tFinOverheadDesc}</div>
                    <div class="fin-divider"></div>
                    <div class="fin-item"><span class="fin-icon old">&times;</span> ${fin1Old}</div>
                    <div class="fin-item"><span class="fin-icon old">&times;</span> ${fin2Old}</div>
                    <div class="fin-item"><span class="fin-icon old">&times;</span> ${fin3Old}</div>
                </div>
                <div class="fin-box new">
                    <div class="fin-title-bar new">${tFinHireNew}</div>
                    <div class="fin-sub-value new">${tFinProjectLabel}</div>
                    <div class="fin-desc new">${tFinProjectDesc}</div>
                    <div class="fin-divider"></div>
                    <div class="fin-item"><span class="fin-icon new">&check;</span> ${fin1New}</div>
                    <div class="fin-item"><span class="fin-icon new">&check;</span> ${fin2New}</div>
                    <div class="fin-item"><span class="fin-icon new">&check;</span> ${fin3New}</div>
                </div>
            </div>
        </div>
 
        <!-- Investasi Layanan -->
        <div class="body-section" style="margin-bottom: 25px;">
            <h3 class="body-section-title">${tInvestTitle}</h3>
            ${service.discount && service.discount > 0 ? `
            <!-- Card Penawaran Eksklusif Terpisah -->
            <div style="margin-bottom: 12px; padding: 12px 16px; border: 1.5px dashed #fbbf24; background: rgba(251, 191, 36, 0.02); border-radius: 8px;">
                <p style="font-size: 12.5px; color: #fbbf24; font-weight: 700; margin: 0; line-height: 1.6; letter-spacing: 0.2px;">
                    <span style="font-size: 11px; font-weight: 800; color: #000000; background: #fbbf24; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; vertical-align: middle; margin-right: 8px; margin-top: -2px;">
                        ${isEn ? `SAVE ${service.discount}%` : `HEMAT ${service.discount}%`}
                    </span>
                    <span style="font-size: 13px; text-decoration: line-through; color: #71717a; font-weight: 500; margin-right: 10px; vertical-align: middle;">
                        ${formatPriceHelper(service.price)}
                    </span>
                    <span style="vertical-align: middle;">
                        ${isEn 
                            ? `✨ Secure this special value today & instantly keep an extra ${formatPriceHelper(service.price - finalPrice)} in your growth budget — SPECIAL VALUE RATE APPLIED DIRECTLY AS A STRATEGIC PARTNER APPRECIATION.` 
                            : `✨ Amankan harga investasi spesial ini sekarang & kunci hemat langsung ${formatPriceHelper(service.price - finalPrice)} untuk dialokasikan ke strategi pertumbuhan bisnis Anda — JAMINAN HARGA TERBAIK SEBAGAI APRESIASI MITRA STRATEGIS.`
                        }
                    </span>
                </p>
            </div>
            ` : ''}
 
            <!-- Card Utama Harga Bersih & Skema Pembayaran -->
            <div class="pricing-banner">
                <div class="pricing-info">
                    <span style="font-size: 12px; text-transform: uppercase; color: #ffffff; letter-spacing: 0.5px;">${tBaseInvestLabel}</span>
                    <span class="pricing-price" style="margin-top: 4px; line-height: 1.1;">${formattedPrice}</span>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 17px; font-weight: 700; color: #ffffff; display: block;">${intervalLabel}</span>
                </div>
            </div>
 
            <!-- Catatan Negosiasi & Kualitas -->
            <div style="margin-top: 15px; padding: 16px 20px; border-left: 3px solid #fbbf24; background: #09090b; border-radius: 0 6px 6px 0;">
                <p style="font-size: 15px; color: #fbbf24; line-height: 1.6; margin: 0;">
                    <strong>${isEn ? "Let's Talk & Partner Up:" : "Diskusikan dengan Kami:"}</strong> 
                    ${isEn 
                        ? "Your business needs are unique, which is why we are completely open to discussing this investment to perfectly fit your budget. If you require a more cost-effective option, we can easily adjust the list of Key Features & Deliverables above — such as simplifying certain functionalities or postponing non-priority modules to a later phase. Let's collaborate to build the most efficient solution for you!"
                        : "Kebutuhan bisnis Anda unik, karena itu nilai investasi ini sangat terbuka untuk kita diskusikan agar pas dengan anggaran Anda. Jika Anda memerlukan opsi investasi yang lebih hemat, kita bisa dengan mudah menyesuaikan kembali daftar Fitur & Deliverables Utama di atas — misalnya dengan menyederhanakan fungsionalitas tertentu atau menunda modul non-prioritas ke fase berikutnya. Mari berkolaborasi merancang solusi terbaik untuk Anda!"
                    }
                </p>
            </div>
 
            <!-- Trigger Lihat Addon Berikutnya -->
            ${addonsList.length > 0 && addonsNeedNewPage ? `
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px; justify-content: flex-end; color: #fbbf24; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                <span>${isEn ? "See next page for optional add-ons" : "Lihat halaman berikutnya untuk modul add-on"}</span>
                <span>&rarr;</span>
            </div>
            ` : ''}
        </div>
  
        ${addonsList.length > 0 && !addonsNeedNewPage ? `
        <div class="body-section" style="margin-bottom: 15px;">
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th>${tAddonHeaderModule}</th>
                        <th>${tAddonHeaderScheme}</th>
                        <th style="text-align: right;">${tAddonHeaderInvest}</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateAddonsTableRows(addonsList)}
                </tbody>
            </table>
        </div>
        ` : ''}
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(5)}</span>
        </div>
    </div>
  
    ${addonsPagesHtml}
 
    <!-- HALAMAN FAQ & OTORISASI PERSETUJUAN -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec5Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(6 + addonPageCount)}</span>
        </div>
  
        <!-- FAQ Section -->
        <div class="body-section" style="margin-bottom: 12px;">
            <h3 class="body-section-title">${tFaqTitle}</h3>
            <p class="paragraph-text" style="font-size: 13px; color: #ffffff; margin-bottom: 12px; margin-top: -5px;">
                ${tMoreInfoAt} <strong style="color: #fbbf24;">crediblemark.com</strong>
            </p>
            <div class="faq-container">
                <div class="faq-item">
                    <div class="faq-question">${faqQ1}</div>
                    <div class="faq-answer">${faqA1}</div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">${faqQ2}</div>
                    <div class="faq-answer">${faqA2}</div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">${faqQ3}</div>
                    <div class="faq-answer">${faqA3}</div>
                </div>
            </div>
        </div>
  
        <!-- GARANSI UANG KEMBALI (Guarantee Box) -->
        <div class="guarantee-box" style="margin-bottom: 15px; padding: 16px;">
            <span class="guarantee-badge">&nbsp; ${tGuarTitle} &nbsp;</span>
            <div class="guarantee-title">${tGuarSubtitle}</div>
            <p class="guarantee-desc">${tGuarDesc}</p>
        </div>
  
        <div class="body-section">
            <p class="paragraph-text" style="font-size: 13px; color: #ffffff; line-height: 1.5; margin-bottom: 15px;">
                ${tAgreementText}
            </p>
            
            <div class="signatures-container">
                <div class="sig-box" style="position: relative;">
                    ${signatureUrl
                        ? `<img src="${signatureUrl}" alt="Tanda Tangan" style="position: absolute; bottom: 55px; left: 0; height: 70px; width: auto; object-fit: contain; z-index: 2;" />`
                        : ``
                    }
                    ${stampUrl
                        ? `<img src="${stampUrl}" alt="Stempel Resmi" style="position: absolute; bottom: 45px; left: 50px; width: 100px; height: 100px; object-fit: contain; opacity: 0.85; filter: brightness(0) invert(1); z-index: 3;" />`
                        : ``
                    }
                    <div class="sig-line"></div>
                    <span class="sig-name">Rasyiqi</span>
                    <span class="sig-title">Crediblemark</span>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <span class="sig-name">...</span>
                    <span class="sig-title">${tClientRepresentative}</span>
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(6 + addonPageCount)}</span>
        </div>
    </div>
 
    <!-- HALAMAN BARU: KONTAK -->
    <div class="page" style="background: radial-gradient(circle at bottom left, rgba(250, 204, 21, 0.05) 0%, transparent 50%), #000000;">
        <div class="section-header">
            <h2 class="section-title">${isEn ? "06 / Contact Us" : "06 / Hubungi Kami"}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(7 + addonPageCount)}</span>
        </div>
 
        <div class="contact-container">
            <div>
                <h1 class="contact-header-title">${isEn ? "Get in Touch" : "Hubungi kami"}</h1>
                <p class="contact-header-desc">
                    ${isEn 
                        ? "Have a project in mind or want to know more about our services? We would love to hear from you. Reach out and our team will get back to you shortly."
                        : "Punya proyek atau ingin tahu lebih banyak tentang layanan kami? Kami ingin mendengar dari Anda. Hubungi kami dan tim kami akan segera menghubungi Anda."
                    }
                </p>
            </div>
 
            <div class="contact-list">
                <!-- Email Item -->
                <div class="contact-item">
                    <div class="contact-icon-box">
                        <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    </div>
                    <div class="contact-details">
                        <div class="contact-label">${isEn ? "Email" : "Email"}</div>
                        <div class="contact-value">
                            <a href="mailto:${contactInfo?.email || 'hello@crediblemark.com'}">${contactInfo?.email || 'hello@crediblemark.com'}</a>
                        </div>
                    </div>
                </div>
 
                <!-- Alamat Kantor Item -->
                <div class="contact-item">
                    <div class="contact-icon-box">
                        <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                    <div class="contact-details">
                        <div class="contact-label">${isEn ? "Office" : "Kantor"}</div>
                        <div class="contact-value">${contactInfo?.address || 'Jl Raya Batang-Batang, No 12, Darmaayu, Andulang, Gapura, Sumenep, Indonesia'}</div>
                    </div>
                </div>
 
                <!-- Telepon Item -->
                <div class="contact-item">
                    <div class="contact-icon-box">
                        <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    </div>
                    <div class="contact-details">
                        <div class="contact-label">${isEn ? "Phone" : "Telepon"}</div>
                        <div class="contact-value">
                            <a href="tel:${contactInfo?.phone || '+6285183131249'}">${contactInfo?.phone || '+6285183131249'}</a>
                        </div>
                        <div class="contact-subvalue">(${contactInfo?.hours || 'Senin - Jumat, 08.00 - 17.00 WIB'})</div>
                    </div>
                </div>
            </div>
        </div>
 
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(7 + addonPageCount)}</span>
        </div>
    </div>
</body>
</html>
    `;
}
