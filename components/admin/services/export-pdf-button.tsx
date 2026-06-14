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
        const starterPrice = formatPriceHelper(finalPrice * 0.6);
        const scalePrice = formatPriceHelper(finalPrice * 1.5);

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

        // Rencana Otorisasi/Pengantar Bisnis yang Sulit Ditolak (Sebagai Bingkai Dokumen)
        const targetSolutionText = `Tujuan proposal ini bukan sekadar membuat deliverables teknis, melainkan mengurangi risiko operasional, mengefisiensikan biaya, dan meningkatkan metrik bisnis utama Anda melalui implementasi solusi ${title} secara terukur.`;

        const businessUnderstanding = {
            target: "Pelanggan potensial dan audiens mobile-first yang mengutamakan kecepatan interaksi, kemudahan transaksi, dan aksesibilitas bebas hambatan.",
            funnel: "Promosi / Kontak Awal &rarr; Formulir / WhatsApp Manual &rarr; Tindakan Admin &rarr; Eksekusi Layanan.",
            bottleneck: "Respon waktu pelayanan yang berpotensi lambat di luar jam kerja operasional serta pencatatan prospek/kebutuhan yang kurang sistematis.",
            consequence: "Calon pelanggan berpindah ke kompetitor lain dan nilai konversi kampanye digital menjadi kurang optimal."
        };

        const kpis = [
            { goal: "Meningkatkan Lead & Konversi", kpi: "+20% hingga +40% peningkatan rasio konversi / qualified inquiry pelanggan" },
            { goal: "Mempercepat Waktu Respon", kpi: "First-response time rata-rata di bawah 10 menit pada jam kerja operasional" },
            { goal: "Optimasi Efisiensi Kerja", kpi: "Pengurangan hingga 30% tugas administratif berulang melalui automasi sistem" }
        ];

        const outScope = [
            "Integrasi mendalam dengan sistem ERP/CRM eksternal kustom di luar cakupan API standar.",
            "Penyediaan aset media mentah (seperti foto produk skala besar atau rekaman video profil korporat).",
            "Manajemen anggaran iklan digital pihak ketiga (Ad-Spend budget) di luar setup integrasi tracking.",
            "Lisensi berbayar pihak ketiga yang memerlukan langganan mandiri di luar paket penawaran."
        ];

        const timeline = [
            { phase: "Fase 1: Discovery & Audit", duration: "3-5 Hari", output: "Audit kebutuhan alur kerja & penyelarasan baseline KPI" },
            { phase: "Fase 2: UX & Wireframing", duration: "5-7 Hari", output: "Desain arsitektur visual alur interaksi & review prototype" },
            { phase: "Fase 3: Development & Integrasi", duration: "10-15 Hari", output: "Pengembangan fungsionalitas sistem & integrasi formulir database" },
            { phase: "Fase 4: QA & Tracking Setup", duration: "3-5 Hari", output: "Pengujian menyeluruh (debugging) & konfigurasi analitik" },
            { phase: "Fase 5: Go-Live & Handover", duration: "1-2 Hari", output: "Peluncuran resmi, pelatihan tim internal, & penyerahan SOP" }
        ];

        const risks = [
            { risk: "Keterlambatan penyediaan konten/aset", mitigation: "Penyediaan aset utama di awal kickoff atau penggunaan konten placeholder sementara agar development tidak tertahan." },
            { risk: "Perubahan ruang lingkup (scope creep)", mitigation: "Evaluasi tertulis melalui Change Request formal dengan penyesuaian timeline dan investasi." },
            { risk: "Kendala API pihak ketiga", mitigation: "Analisis kelayakan teknis di awal Fase 1 (Discovery) serta penyediaan solusi fallback sementara." }
        ];

        const roiEstimationText = baseCurrency === "IDR"
            ? `Dengan estimasi transaksi rata-rata Rp 2.500.000, peningkatan konversi konvensional sebesar 15-30% setara dengan tambahan pendapatan kotor Rp 7.500.000 s/d Rp 15.000.000 per bulan. Investasi proyek diproyeksikan balik modal (ROI) dalam waktu 3 hingga 5 bulan.`
            : `With an estimated average transaction value of $250, a conservative 15-30% increase in lead conversion equates to an additional gross revenue of $750 to $1,500 per month. The project investment is projected to achieve full ROI within 3 to 5 months.`;

        // Template HTML Proposal A4 Premium
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title} - Proposal Bisnis</title>
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
            padding: 22mm 20mm;
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
            padding: 40mm 20mm;
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
            margin-bottom: 20px;
        }
        
        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
        }
        
        .section-subtitle-badge {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #d97706;
            font-weight: 700;
        }
        
        .body-section {
            margin-bottom: 20px;
        }

        .body-section-title {
            font-size: 13px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .paragraph-text {
            font-size: 12px;
            color: #334155;
            text-align: justify;
            margin-bottom: 12px;
        }

        .desc-content {
            font-size: 12px;
            color: #334155;
            line-height: 1.6;
        }

        .desc-content p {
            margin-bottom: 12px;
            text-align: justify;
        }

        .desc-content ul, .desc-content ol {
            margin-left: 20px;
            margin-bottom: 12px;
        }

        .desc-content li {
            margin-bottom: 4px;
        }

        .highlight-quote {
            background: #f8fafc;
            border-left: 3.5px solid #d97706;
            padding: 12px 16px;
            margin-bottom: 18px;
            font-size: 12px;
            font-style: italic;
            color: #334155;
            line-height: 1.6;
        }

        /* Lists */
        .bullet-list {
            margin-left: 15px;
            margin-bottom: 15px;
        }

        .bullet-list li {
            font-size: 12px;
            color: #334155;
            margin-bottom: 6px;
        }
        
        /* Tables */
        .proposal-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .proposal-table th {
            background: #0f172a;
            color: #ffffff;
            font-size: 10px;
            font-weight: 600;
            text-align: left;
            padding: 8px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .proposal-table td {
            padding: 9px 12px;
            font-size: 11px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            vertical-align: top;
        }
        
        .proposal-table tr:nth-child(even) td {
            background: #f8fafc;
        }

        /* Scope Columns */
        .scope-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 10px;
        }

        .scope-column {
            background: #fafbfc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
        }

        .scope-column-title {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .scope-column-title.in {
            color: #1e3a8a;
        }

        .scope-column-title.out {
            color: #64748b;
        }

        .scope-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }

        .scope-dot.in {
            background: #d97706;
        }

        .scope-dot.out {
            background: #94a3b8;
        }

        .feature-card-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 8px;
        }

        .feature-card-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #d97706;
            margin-top: 6px;
            shrink-0;
        }

        .feature-card-text {
            font-size: 11px;
            color: #334155;
            line-height: 1.4;
        }

        /* Opsi Investasi Card */
        .investment-cards-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 18px;
        }

        .investment-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px 12px;
            background: #fafbfc;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
        }

        .investment-card.recommended {
            border: 2px solid #d97706;
            background: #fffdf9;
        }

        .card-badge-rec {
            position: absolute;
            top: -9px;
            left: 50%;
            transform: translateX(-50%);
            background: #d97706;
            color: #ffffff;
            font-size: 8px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .inv-card-title {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
        }

        .inv-card-price {
            font-size: 15px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 8px;
        }

        .inv-card-desc {
            font-size: 9.5px;
            color: #64748b;
            line-height: 1.4;
        }

        /* Tanda Tangan */
        .signatures-container {
            margin-top: 15mm;
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
            height: 12mm;
            margin-bottom: 6px;
        }
        
        .sig-name {
            font-size: 11px;
            font-weight: 600;
            color: #0f172a;
        }
        
        .sig-title {
            font-size: 9px;
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
                <span class="proposal-badge">Business Proposal & Plan</span>
                <h1 class="main-title">${title}</h1>
                <div class="title-divider"></div>
                <p class="sub-title">Dokumen penawaran dan rencana solusi digital taktis yang dirancang khusus untuk meminimalkan risiko operasional, mengotomasi proses kerja, serta memaksimalkan rasio konversi bisnis Anda.</p>
            </div>
            
            <div class="cover-footer">
                <div>
                    <div class="metadata-label">Dipersiapkan Untuk</div>
                    <div class="metadata-value">Valued Client / Klien Terhormat</div>
                </div>
                <div style="text-align: right;">
                    <div class="metadata-label">Tanggal Terbit</div>
                    <div class="metadata-value">${dateStr}</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- HALAMAN 2: EXECUTIVE SUMMARY & DESKRIPSI LAYANAN ASLI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">01 / Ringkasan Eksekutif & Solusi</h2>
            <span class="section-subtitle-badge">Halaman 2</span>
        </div>
        
        <div class="body-section">
            <h3 class="body-section-title">Executive Summary</h3>
            <div class="highlight-quote">
                "${targetSolutionText}"
            </div>
            <p class="paragraph-text" style="font-weight: 600; margin-bottom: 8px;">
                Rincian Deskripsi Solusi Layanan:
            </p>
            <div class="desc-content">
                ${descriptionHtml}
            </div>
        </div>

        <div class="body-section" style="margin-top: 15px;">
            <h3 class="body-section-title">Pemahaman Masalah & Alur Kerja</h3>
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th style="width: 30%;">Aspek Funnel</th>
                        <th>Kondisi & Pemahaman Realitas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Target Pelanggan</strong></td>
                        <td>${businessUnderstanding.target}</td>
                    </tr>
                    <tr>
                        <td><strong>Alur Funnel Saat Ini</strong></td>
                        <td>${businessUnderstanding.funnel}</td>
                    </tr>
                    <tr>
                        <td><strong>Titik Hambat (Bottleneck)</strong></td>
                        <td>${businessUnderstanding.bottleneck}</td>
                    </tr>
                    <tr>
                        <td><strong>Konsekuensi Bisnis</strong></td>
                        <td><span style="color: #b45309; font-weight: 600;">${businessUnderstanding.consequence}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Bisnis ${title}</span>
            <span>Halaman 2 dari 5</span>
        </div>
    </div>
    
    <!-- HALAMAN 3: TUJUAN, KPI, & RUANG LINGKUP (SCOPE ASLI) -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">02 / Target Mutu & Ruang Lingkup</h2>
            <span class="section-subtitle-badge">Halaman 3</span>
        </div>

        <div class="body-section">
            <h3 class="body-section-title">Tujuan & Key Performance Indicator (KPI) Terukur</h3>
            <p class="paragraph-text">
                Untuk memastikan akuntabilitas kerja, kesuksesan implementasi akan dievaluasi menggunakan metrik keberhasilan berikut:
            </p>
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Tujuan Proyek</th>
                        <th>Target KPI Terukur</th>
                    </tr>
                </thead>
                <tbody>
                    ${kpis.map(item => `
                        <tr>
                            <td><strong>${item.goal}</strong></td>
                            <td>${item.kpi}</td>
                        </tr>
                    `).join("")}
                    <tr>
                        <td colspan="2" style="font-size: 10px; color: #64748b; font-style: italic;">
                            * Catatan: Target final metrik akan dikalibrasi bersama setelah tahap audit awal selama 7 hari kickoff dilakukan.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="body-section">
            <h3 class="body-section-title">Batasan Ruang Lingkup Proyek (Scope of Work)</h3>
            <p class="paragraph-text">
                Pembatasan ini dirancang agar pengerjaan fokus pada hal-hal yang memiliki dampak bisnis (ROI) terbesar secara instan serta meminimalkan risiko keterlambatan pengerjaan.
            </p>
            
            <div class="scope-container">
                <div class="scope-column">
                    <div class="scope-column-title in">
                        <div class="scope-dot in"></div>
                        <span>Termasuk dalam Scope (In-Scope)</span>
                    </div>
                    ${featuresListHtml ? featuresListHtml : `
                        <div class="feature-card-item">
                            <div class="feature-card-dot"></div>
                            <div class="feature-card-text">Layanan implementasi fungsional ${title} lengkap.</div>
                        </div>
                    `}
                </div>
                <div class="scope-column">
                    <div class="scope-column-title out">
                        <div class="scope-dot out"></div>
                        <span>Di Luar Scope (Out-of-Scope)</span>
                    </div>
                    ${outScope.map(outItem => `
                        <div class="feature-card-item">
                            <div class="feature-card-dot" style="background: #94a3b8;"></div>
                            <div class="feature-card-text" style="color: #64748b;">${outItem}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Bisnis ${title}</span>
            <span>Halaman 3 dari 5</span>
        </div>
    </div>
    
    <!-- HALAMAN 4: IMPLEMENTASI TIMELINE & MITIGASI RISIKO -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">03 / Alur Kerja & Mitigasi Risiko</h2>
            <span class="section-subtitle-badge">Halaman 4</span>
        </div>

        <div class="body-section">
            <h3 class="body-section-title">Rencana Implementasi & Rincian Timeline</h3>
            <p class="paragraph-text">
                Fase pengerjaan diatur secara linear menggunakan pendekatan bertahap guna memastikan setiap milestone dapat divalidasi dengan matang sebelum melangkah ke tahap selanjutnya:
            </p>
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th style="width: 30%;">Fase / Tahapan</th>
                        <th style="width: 20%;">Durasi Estimasi</th>
                        <th>Output / Deliverable Kunci</th>
                    </tr>
                </thead>
                <tbody>
                    ${timeline.map(item => `
                        <tr>
                            <td><strong>${item.phase}</strong></td>
                            <td>${item.duration}</td>
                            <td>${item.output}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="body-section" style="margin-top: 15px;">
            <h3 class="body-section-title">Identifikasi Risiko Proyek & Tindakan Mitigasi</h3>
            <p class="paragraph-text">
                Kami tidak menjanjikan pengerjaan bebas dari kendala, namun kami menyiapkan rencana mitigasi sejak dini guna mengamankan timeline pengerjaan:
            </p>
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th style="width: 35%;">Risiko Potensial</th>
                        <th>Rencana Tindakan Mitigasi Terukur</th>
                    </tr>
                </thead>
                <tbody>
                    ${risks.map(item => `
                        <tr>
                            <td><strong>${item.risk}</strong></td>
                            <td>${item.mitigation}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal Bisnis ${title}</span>
            <span>Halaman 4 dari 5</span>
        </div>
    </div>

    <!-- HALAMAN 5: STRATEGI INVESTASI ASLI, ROI, ADDONS ASLI, & PERSETUJUAN -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">04 / Rencana Investasi & Persetujuan</h2>
            <span class="section-subtitle-badge">Halaman 5</span>
        </div>

        <div class="body-section">
            <h3 class="body-section-title">Rencana Struktur Investasi & ROI</h3>
            <p class="paragraph-text" style="margin-bottom: 10px;">
                Kami menyediakan tiga opsi paket investasi dengan trade-off yang transparan sesuai kebutuhan eskalasi bisnis Anda:
            </p>
            
            <div class="investment-cards-grid">
                <div class="investment-card">
                    <div class="inv-card-title">Paket Starter</div>
                    <div class="inv-card-price">${starterPrice}</div>
                    <div class="inv-card-desc">Fokus pada validasi pasar cepat dan peluncuran fungsionalitas esensial.</div>
                </div>
                <div class="investment-card recommended">
                    <div class="card-badge-rec">Rekomendasi</div>
                    <div class="inv-card-title">Paket Growth</div>
                    <div class="inv-card-price">${formattedPrice}</div>
                    <div class="inv-card-desc">Paket lengkap mencakup integrasi CRM, pelacakan konversi, & automasi data (ROI Terbaik).</div>
                </div>
                <div class="investment-card">
                    <div class="inv-card-title">Paket Scale</div>
                    <div class="inv-card-price">${scalePrice}</div>
                    <div class="inv-card-desc">Kustomisasi tingkat lanjut untuk kebutuhan volume besar dengan SLA prioritas.</div>
                </div>
            </div>

            <p class="paragraph-text" style="font-size: 11px; background: #fafbfc; border: 1px dashed #e2e8f0; padding: 10px; border-radius: 4px; color: #1e3a8a;">
                <strong>Proyeksi ROI Konservatif:</strong> ${roiEstimationText}
            </p>
        </div>

        ${addonsHtml ? `
        <div class="body-section" style="margin-top: 10px;">
            <h3 class="body-section-title" style="margin-bottom: 4px;">Pilihan Add-ons Opsional</h3>
            <table class="proposal-table" style="margin-bottom: 10px;">
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

        <div class="body-section" style="margin-top: 15px;">
            <p class="paragraph-text" style="font-size: 10.5px; color: #64748b; line-height: 1.5;">
                Dengan menandatangani dokumen ini, kedua belah pihak menyepakati lingkup kerja, skema rencana investasi ${intervalLabel} (${priceModel}: ${formattedPrice}), serta bersiap menjadwalkan agenda kickoff pengerjaan.
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
            <span>CREDIBLEMARK &bull; Proposal Bisnis ${title}</span>
            <span>Halaman 5 dari 5</span>
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
