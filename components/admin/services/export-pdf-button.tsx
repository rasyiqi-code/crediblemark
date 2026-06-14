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

        const intervalLabel = service.interval === 'one_time'
            ? 'Sekali Bayar'
            : (service.interval === 'monthly' ? 'Bulanan' : (service.interval === 'yearly' ? 'Tahunan' : service.interval));

        const priceModel = service.priceType === 'STARTING_AT' ? 'Mulai dari' : 'Harga Pasti';

        // Tanggal pembuatan proposal hari ini
        const dateStr = new Date().toLocaleDateString("id-ID", {
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

            const addInterval = addon.interval === "one_time" ? "Sekali Bayar" : (addon.interval === "monthly" ? "Bulanan" : (addon.interval === "yearly" ? "Tahunan" : addon.interval));

            return `
                <tr>
                    <td><strong>${addon.name}</strong><br><small style="color: #64748b;">${addon.description || ''}</small></td>
                    <td>${addInterval}</td>
                    <td style="text-align: right; font-weight: 600; color: #1e3a8a;">${addonFormattedPrice}</td>
                </tr>
            `;
        }).join("");

        // Template HTML Proposal A4 Premium (Murni data asli database dikemas layout mewah)
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
            color: #1e293b;
            background: #ffffff;
            line-height: 1.5;
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
        
        /* Halaman Cover (Estetika Tinggi) */
        .page-cover {
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #fafbfc;
        }
        
        .cover-top-accent {
            position: absolute;
            top: -160px;
            right: -160px;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
            z-index: 1;
        }
        
        .cover-top-accent-sub {
            position: absolute;
            top: 60px;
            right: 230px;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            background: #d97706;
            opacity: 0.85;
            z-index: 2;
        }

        .cover-bottom-accent {
            position: absolute;
            bottom: -120px;
            left: -120px;
            width: 380px;
            height: 380px;
            border-radius: 50%;
            background: linear-gradient(45deg, #1e3a8a 0%, #0a0f1d 100%);
            z-index: 1;
        }
        
        .cover-bottom-stripes {
            position: absolute;
            bottom: 90px;
            left: 220px;
            width: 140px;
            height: 140px;
            background: radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 40%, transparent 40%, transparent 60%, #d97706 60%, #d97706 80%, transparent 80%);
            background-size: 18px 18px;
            opacity: 0.12;
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
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 2px;
        }
        
        .main-title-box {
            margin-top: 10mm;
        }
        
        .proposal-badge {
            display: inline-block;
            background: #d97706;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            padding: 5px 12px;
            border-radius: 4px;
            margin-bottom: 18px;
        }
        
        .main-title {
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.2;
            margin-bottom: 20px;
        }
        
        .title-divider {
            width: 75mm;
            height: 3px;
            background: #d97706;
            margin-bottom: 25px;
        }
        
        .sub-title {
            font-size: 14px;
            color: #475569;
            font-weight: 400;
            max-width: 145mm;
            line-height: 1.6;
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
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        
        .metadata-value {
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
        }

        /* Halaman Standar */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 8px;
            margin-bottom: 25px;
        }
        
        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
        }
        
        .section-subtitle-badge {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #d97706;
            font-weight: 700;
        }
        
        .body-section {
            margin-bottom: 25px;
        }

        .body-section-title {
            font-size: 13px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .desc-content {
            font-size: 13px;
            color: #334155;
            line-height: 1.7;
        }

        .desc-content p {
            margin-bottom: 14px;
            text-align: justify;
        }

        .desc-content ul, .desc-content ol {
            margin-left: 20px;
            margin-bottom: 14px;
        }

        .desc-content li {
            margin-bottom: 6px;
        }

        /* Scope / Fitur Grid */
        .scope-container {
            background: #fafbfc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
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
            gap: 10px;
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-left: 4px solid #1e3a8a;
            border-radius: 6px;
            padding: 12px 15px;
        }

        .feature-card-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #d97706;
            margin-top: 6px;
            flex-shrink: 0;
        }

        .feature-card-text {
            font-size: 12px;
            font-weight: 600;
            color: #334155;
            line-height: 1.4;
        }

        /* Investasi Section */
        .pricing-banner {
            background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
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
            font-size: 26px;
            font-weight: 700;
            color: #1e3a8a;
        }
        
        /* Tables */
        .proposal-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            margin-top: 10px;
        }
        
        .proposal-table th {
            background: #0f172a;
            color: #ffffff;
            font-size: 10px;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .proposal-table td {
            padding: 10px 12px;
            font-size: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            vertical-align: middle;
        }
        
        .proposal-table tr:nth-child(even) td {
            background: #f8fafc;
        }

        /* Tanda Tangan */
        .signatures-container {
            margin-top: 20mm;
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
        
        /* Footer Halaman */
        .page-footer {
            position: absolute;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #f1f5f9;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
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
                <p class="sub-title">Dokumen penawaran dan rencana solusi digital resmi yang diajukan untuk penyediaan serta implementasi layanan profesional.</p>
            </div>
            
            <div class="cover-footer">
                <div>
                    <div class="metadata-label">Dipersiapkan Untuk</div>
                    <div class="metadata-value">Valued Client / Klien Terhormat</div>
                </div>
                <div style="text-align: right;">
                    <div class="metadata-label">Tanggal Proposal</div>
                    <div class="metadata-value">${dateStr}</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- HALAMAN 2: DESKRIPSI LAYANAN ASLI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">01 / Deskripsi Solusi Layanan</h2>
            <span class="section-subtitle-badge">Halaman 2</span>
        </div>
        
        <div class="body-section">
            <div class="desc-content">
                ${descriptionHtml}
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>Halaman 2</span>
        </div>
    </div>
    
    <!-- HALAMAN 3: FITUR & DELIVERABLES ASLI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">02 / Fitur & Deliverables Utama</h2>
            <span class="section-subtitle-badge">Halaman 3</span>
        </div>

        <div class="body-section">
            <p class="paragraph-text" style="font-size: 13px; color: #475569; margin-bottom: 15px;">
                Daftar lengkap fitur spesifik dan deliverables hasil kerja yang tercakup dalam solusi layanan ini:
            </p>
            
            <div class="scope-container">
                <div class="features-grid">
                    ${featuresListHtml ? featuresListHtml : `
                        <div class="feature-card-item">
                            <div class="feature-card-dot"></div>
                            <div class="feature-card-text">Layanan implementasi fungsional ${title} lengkap.</div>
                        </div>
                    `}
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>Halaman 3</span>
        </div>
    </div>

    <!-- HALAMAN 4: INVESTASI, ADDONS ASLI, & OTORISASI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">03 / Rencana Investasi & Persetujuan</h2>
            <span class="section-subtitle-badge">Halaman 4</span>
        </div>

        <div class="body-section">
            <h3 class="body-section-title">Investasi Layanan</h3>
            <div class="pricing-banner">
                <div class="pricing-info">
                    <span style="font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Biaya Layanan Utama (${priceModel})</span>
                    <span class="pricing-price">${formattedPrice}</span>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Skema Pembayaran</span>
                    <span style="font-size: 14px; font-weight: 600; color: #0f172a; display: block;">${intervalLabel}</span>
                </div>
            </div>
        </div>

        ${addonsHtml ? `
        <div class="body-section" style="margin-top: 10px;">
            <h3 class="body-section-title">Add-ons Opsional</h3>
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th>Modul Add-on</th>
                        <th>Skema</th>
                        <th style="text-align: right;">Investasi</th>
                    </tr>
                </thead>
                <tbody>
                    ${addonsHtml}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="body-section" style="margin-top: 20px;">
            <p class="paragraph-text" style="font-size: 11px; color: #64748b; line-height: 1.6;">
                Dengan menandatangani dokumen ini, kedua belah pihak menyepakati rincian fitur kerja, nilai investasi, serta skema pembayaran yang tertera di atas.
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
                    <span class="sig-title">Perwakilan Klien</span>
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>Halaman 4</span>
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
