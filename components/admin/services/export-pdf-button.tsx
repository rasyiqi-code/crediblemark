"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";
import { useLocale } from "next-intl";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";
import { getAgencyLogo, getCompanyStamp } from "@/app/actions/system-admin";

interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    currency?: string | null;
    interval: string;
    priceType: string;
    features?: unknown;
    features_id?: unknown;
    addons?: unknown;
    addons_id?: unknown;
}

export function ExportPdfButton({ service }: { service: ServiceData }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [stampUrl, setStampUrl] = useState<string | null>(null);
    const locale = useLocale();

    useEffect(() => {
        getAgencyLogo().then(setLogoUrl).catch(console.error);
        getCompanyStamp().then(setStampUrl).catch(console.error);
    }, []);

    const handleExport = () => {
        setIsGenerating(true);

        // Membuat iframe tersembunyi untuk proses printing
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        iframe.style.visibility = "hidden";
        
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
            setIsGenerating(false);
            return;
        }

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

        // Format Addons asli dari database (addons)
        let addonsList: ServiceAddon[] = [];
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

        const addonsHtml = addonsList.map(addon => {
            const addPrice = typeof addon.price === "string" ? parseFloat(addon.price) : (typeof addon.price === "number" ? addon.price : 0);
            const addonFormattedPrice = (addon.currency || baseCurrency) === "IDR"
                ? `Rp ${addPrice.toLocaleString("id-ID")}`
                : `$${addPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const addInterval = addon.interval === "one_time" 
                ? (isEn ? "One Time" : "Sekali Bayar") 
                : (addon.interval === "monthly" ? (isEn ? "Monthly" : "Bulanan") : (addon.interval === "yearly" ? (isEn ? "Yearly" : "Tahunan") : addon.interval));

            return `
                <tr>
                    <td><strong>${addon.name}</strong><br><small style="color: #a1a1aa; font-size: 12px;">${addon.description || ''}</small></td>
                    <td>${addInterval}</td>
                    <td style="text-align: right; font-weight: 600; color: #fbbf24;">${addonFormattedPrice}</td>
                </tr>
            `;
        }).join("");

        // Data Filosofi & Slogan dari Landing Page / Lokalisasi
        const messages = isEn ? enMessages : idMessages;
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
        const tProposalDate = messages.ProposalExport.proposalDate;

        // Lokalisasi dinamis untuk judul Section
        const tSec1Title = messages.ProposalExport.sec1Title;
        const tSec2Title = messages.ProposalExport.sec2Title;
        const tSec3Title = messages.ProposalExport.sec3Title;
        const tSec4Title = messages.ProposalExport.sec4Title;
        const tSec5Title = messages.ProposalExport.sec5Title;

        const getPageFooterHtml = (page: number) => {
            return messages.ProposalExport.pageFooter.replace("{page}", page.toString());
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
        const tPaymentScheme = messages.ProposalExport.paymentScheme;
        
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

        // Template HTML Proposal A4 Premium
        const htmlContent = `
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
            background: linear-gradient(135deg, #facc15 0%, #d97706 100%);
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
            background: linear-gradient(45deg, #d97706 0%, #000000 100%);
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
            background: #d97706;
            color: #ffffff;
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
 
        /* CSS kosong untuk menggantikan style workflow */
 
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
    </style>
</head>
<body>
    <!-- HALAMAN 1: COVER -->
    <div class="page page-cover">
        <div class="cover-top-accent"></div>
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
            
            <div class="cover-footer">
                <div>
                    <div class="metadata-label">${tPreparedFor}</div>
                    <div class="metadata-value">${tValuedClient}</div>
                </div>
                <div style="text-align: right;">
                    <div class="metadata-label">${tProposalDate}</div>
                    <div class="metadata-value">${dateStr}</div>
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
            <div class="pricing-banner">
                <div class="pricing-info">
                    <span style="font-size: 12px; text-transform: uppercase; color: #ffffff; letter-spacing: 0.5px;">${tBaseInvestLabel}</span>
                    <span class="pricing-price">${formattedPrice}</span>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 12px; text-transform: uppercase; color: #ffffff; letter-spacing: 0.5px;">${tPaymentScheme}</span>
                    <span style="font-size: 17px; font-weight: 600; color: #ffffff; display: block;">${intervalLabel}</span>
                </div>
            </div>
        </div>
 
        ${addonsHtml ? `
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
                    ${addonsHtml}
                </tbody>
            </table>
        </div>
        ` : ''}
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(5)}</span>
        </div>
    </div>
 
    <!-- HALAMAN 6: FAQ & OTORISASI PERSETUJUAN -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec5Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(6)}</span>
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
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <span class="sig-name">M. Rasyiqi</span>
                    <span class="sig-title">Director, Crediblemark</span>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <span class="sig-name">...................................................</span>
                    <span class="sig-title">${tClientRepresentative}</span>
                </div>
            </div>
            ${stampUrl ? `
            <div style="margin-top: 12px; width: 65mm;">
                <img src="${stampUrl}" alt="Stempel Resmi" style="width: 80px; height: 80px; object-fit: contain; opacity: 0.85; filter: brightness(0) invert(1);" />
            </div>
            ` : ''}
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(6)}</span>
        </div>
    </div>
</body>
</html>
        `;

        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Print preview dipicu sesudah styles & fonts termuat
        const win = iframe.contentWindow;
        if (win) {
            setTimeout(() => {
                win.focus();
                win.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    setIsGenerating(false);
                }, 1000);
            }, 1000);
        } else {
            document.body.removeChild(iframe);
            setIsGenerating(false);
        }
    };

    return (
        <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleExport}
            disabled={isGenerating}
            title="Ekspor ke PDF"
            className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
            {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <FileDown className="w-3.5 h-3.5" />
            )}
        </Button>
    );
}
