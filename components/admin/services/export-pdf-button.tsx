"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { ServiceAddon } from "@/lib/shared/types";

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

        // Teks dan judul layanan berdasarkan opsi lokalisasi yang tersedia
        const title = service.title_id || service.title;
        const descriptionHtml = service.description_id || service.description;

        // Hitung harga final diskon
        const finalPrice = service.discount && service.discount > 0 
            ? service.price * (1 - service.discount / 100)
            : service.price;

        const baseCurrency = service.currency || "USD";
        const formattedPrice = baseCurrency === "IDR"
            ? `Rp ${finalPrice.toLocaleString("id-ID")}`
            : `$${finalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const intervalLabel = service.interval === 'one_time'
            ? 'Sekali Bayar (One Time)'
            : (service.interval === 'monthly' ? 'Bulanan (Retainer)' : (service.interval === 'yearly' ? 'Tahunan (SLA)' : service.interval));

        const priceModel = service.priceType === 'STARTING_AT' ? 'Mulai dari (Starting at)' : 'Harga Pasti (Fixed)';

        // Tanggal pembuatan proposal hari ini
        const dateStr = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // Format fitur (features)
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
            <div class="feature-card">
                <div class="feature-title">
                    <div class="feature-icon-dot"></div>
                    <span>${feature}</span>
                </div>
            </div>
        `).join("");

        // Format Addons
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

            const addInterval = addon.interval === "one_time" ? "Sekali Bayar" : (addon.interval === "monthly" ? "Bulanan" : (addon.interval === "yearly" ? "Tahunan" : addon.interval));

            return `
                <tr>
                    <td><strong>${addon.name}</strong></td>
                    <td>${addInterval}</td>
                    <td style="text-align: right; font-weight: 600; color: #1e3a8a;">${addonFormattedPrice}</td>
                </tr>
            `;
        }).join("");

        // Template HTML Proposal A4 Premium
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title} - Proposal</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background: #ffffff;
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            background: #ffffff;
            overflow: hidden;
            padding: 25mm 20mm;
        }
        
        /* Halaman Cover */
        .page-cover {
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #fdfbfc;
        }
        
        /* Aksen Geometris Cover */
        .cover-top-accent {
            position: absolute;
            top: -150px;
            right: -150px;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            z-index: 1;
        }
        
        .cover-top-accent-sub {
            position: absolute;
            top: 50px;
            right: 220px;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #f59e0b;
            opacity: 0.8;
            z-index: 2;
        }

        .cover-bottom-accent {
            position: absolute;
            bottom: -100px;
            left: -100px;
            width: 350px;
            height: 350px;
            border-radius: 50%;
            background: linear-gradient(45deg, #1e3a8a 0%, #0f172a 100%);
            z-index: 1;
        }
        
        .cover-bottom-stripes {
            position: absolute;
            bottom: 80px;
            left: 200px;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 40%, transparent 40%, transparent 60%, #f59e0b 60%, #f59e0b 80%, transparent 80%);
            background-size: 20px 20px;
            opacity: 0.15;
            z-index: 2;
        }

        .cover-content {
            position: relative;
            z-index: 10;
            height: 100%;
            padding: 35mm 20mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex-grow: 1;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20mm;
        }
        
        .logo-text {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 1.5px;
        }
        
        .main-title-box {
            margin-top: 15mm;
        }
        
        .proposal-badge {
            display: inline-block;
            background: #f59e0b;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding: 6px 14px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        
        .main-title {
            font-family: 'Playfair Display', serif;
            font-size: 44px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.15;
            margin-bottom: 20px;
        }
        
        .title-divider {
            width: 80mm;
            height: 4px;
            background: #0f172a;
            margin-bottom: 25px;
        }
        
        .sub-title {
            font-size: 15px;
            color: #475569;
            font-weight: 400;
            max-width: 140mm;
            line-height: 1.7;
        }
        
        .cover-footer {
            margin-top: auto;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .metadata-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        
        .metadata-value {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
        }

        /* Halaman Standar */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 12px;
            margin-bottom: 25px;
        }
        
        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
        }
        
        .section-subtitle-badge {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #f59e0b;
            font-weight: 700;
        }
        
        .desc-content {
            font-size: 13px;
            color: #334155;
            text-align: justify;
        }
        
        .desc-content p {
            margin-bottom: 15px;
        }
        
        .desc-content ul, .desc-content ol {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        .desc-content li {
            margin-bottom: 6px;
        }

        /* Deliverables */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 10px;
        }
        
        .feature-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #1e3a8a;
            border-radius: 6px;
            padding: 12px 15px;
        }
        
        .feature-title {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .feature-icon-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #f59e0b;
        }

        /* Pricing Section */
        .pricing-section {
            margin-top: 15px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
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
            font-size: 26px;
            font-weight: 700;
            color: #1e3a8a;
        }
        
        .addons-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .addons-table th {
            background: #0f172a;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .addons-table td {
            padding: 10px 12px;
            font-size: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
        }
        
        .addons-table tr:nth-child(even) td {
            background: #f8fafc;
        }
        
        /* Tanda Tangan */
        .signatures-container {
            margin-top: 30mm;
            display: flex;
            justify-content: space-between;
        }
        
        .sig-box {
            width: 65mm;
            display: flex;
            flex-direction: column;
        }
        
        .sig-line {
            border-bottom: 1px solid #94a3b8;
            height: 15mm;
            margin-bottom: 8px;
        }
        
        .sig-name {
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
        }
        
        .sig-title {
            font-size: 10px;
            color: #64748b;
        }
        
        /* Footer */
        .page-footer {
            position: absolute;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #f1f5f9;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #94a3b8;
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
                <div class="logo-text">CREDIBLEMARK</div>
            </div>
            
            <div class="main-title-box">
                <span class="proposal-badge">Business Proposal</span>
                <h1 class="main-title">${title}</h1>
                <div class="title-divider"></div>
                <p class="sub-title">Dokumen penawaran resmi paket pengembangan dan penyediaan layanan profesional digital agency.</p>
            </div>
            
            <div class="cover-footer">
                <div>
                    <div class="metadata-label">Prepared For</div>
                    <div class="metadata-value">Valued Client</div>
                </div>
                <div style="text-align: right;">
                    <div class="metadata-label">Date</div>
                    <div class="metadata-value">${dateStr}</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- HALAMAN 2: OVERVIEW -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">Deskripsi Layanan</h2>
            <span class="section-subtitle-badge">Section 01 / Overview</span>
        </div>
        
        <div class="desc-content">
            ${descriptionHtml}
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Penawaran</span>
            <span>Halaman 2</span>
        </div>
    </div>
    
    <!-- HALAMAN 3: DELIVERABLES & PRICING -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">Fitur & Hasil Kerja</h2>
            <span class="section-subtitle-badge">Section 02 / Deliverables</span>
        </div>
        
        <div class="features-grid">
            ${featuresListHtml}
        </div>
        
        <div style="margin-top: 25px;" class="section-header">
            <h2 class="section-title">Investasi Paket</h2>
            <span class="section-subtitle-badge">Section 03 / Pricing</span>
        </div>
        
        <div class="pricing-section">
            <div class="pricing-info">
                <span style="font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Biaya Paket Utama (${priceModel})</span>
                <span class="pricing-price">${formattedPrice}</span>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Skema Pembayaran</span>
                <span style="font-size: 14px; font-weight: 600; color: #0f172a; display: block;">${intervalLabel}</span>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Penawaran</span>
            <span>Halaman 3</span>
        </div>
    </div>

    <!-- HALAMAN 4: ADDONS / PERSETUJUAN -->
    ${addonsHtml ? `
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">Add-ons Opsional</h2>
            <span class="section-subtitle-badge">Section 04 / Add-ons</span>
        </div>
        
        <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">Pilihan modul tambahan untuk mengoptimalkan potensi dan jangkauan layanan bisnis Anda:</p>
        
        <table class="addons-table">
            <thead>
                <tr>
                    <th>Nama Add-on</th>
                    <th>Interval</th>
                    <th style="text-align: right;">Investasi</th>
                </tr>
            </thead>
            <tbody>
                ${addonsHtml}
            </tbody>
        </table>
        
        <div class="signatures-container">
            <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">M. Rasyiqi</span>
                <span class="sig-title">Director, Crediblemark</span>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">...................................................</span>
                <span class="sig-title">Perwakilan Klien</span>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Penawaran</span>
            <span>Halaman 4</span>
        </div>
    </div>
    ` : `
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">Persetujuan Penawaran</h2>
            <span class="section-subtitle-badge">Section 04 / Authorization</span>
        </div>
        
        <p style="font-size: 12px; color: #475569; line-height: 1.8; margin-top: 10px;">
            Dengan menandatangani dokumen ini, kedua belah pihak menyatakan sepakat untuk memulai kerja sama sesuai dengan rincian fitur dan deliverables yang tercantum di atas.
        </p>
        
        <div class="signatures-container" style="margin-top: 50mm;">
            <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">M. Rasyiqi</span>
                <span class="sig-title">Director, Crediblemark</span>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">...................................................</span>
                <span class="sig-title">Perwakilan Klien</span>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Penawaran</span>
            <span>Halaman 4</span>
        </div>
    </div>
    `}
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
