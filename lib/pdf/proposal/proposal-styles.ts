/**
 * Modul ini menyimpan gaya CSS untuk layout proposal PDF standar A4.
 * Dipisahkan untuk mempermudah maintenance desain visual.
 */
export const proposalStyles = `
/* @font-face menggunakan file lokal dari /public/fonts/ yang di-serve same-origin.
   Ini eliminasi masalah CORS, timing, dan network saat html2canvas render. */
@font-face {
    font-family: 'Plus Jakarta Sans';
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url(/fonts/PlusJakartaSans-Regular.ttf) format('truetype');
}
@font-face {
    font-family: 'Plus Jakarta Sans';
    font-style: normal;
    font-weight: 500;
    font-display: block;
    src: url(/fonts/PlusJakartaSans-Medium.ttf) format('truetype');
}
@font-face {
    font-family: 'Plus Jakarta Sans';
    font-style: normal;
    font-weight: 600;
    font-display: block;
    src: url(/fonts/PlusJakartaSans-SemiBold.ttf) format('truetype');
}
@font-face {
    font-family: 'Plus Jakarta Sans';
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url(/fonts/PlusJakartaSans-Bold.ttf) format('truetype');
}
@font-face {
    font-family: 'Playfair Display';
    font-style: normal;
    font-weight: 600;
    font-display: block;
    src: url(/fonts/PlayfairDisplay-SemiBold.ttf) format('truetype');
}
@font-face {
    font-family: 'Playfair Display';
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url(/fonts/PlayfairDisplay-Bold.ttf) format('truetype');
}
@font-face {
    font-family: 'Playfair Display';
    font-style: italic;
    font-weight: 400;
    font-display: block;
    src: url(/fonts/PlayfairDisplay-Italic.ttf) format('truetype');
}


html, body {
    overflow: hidden;
    margin: 0;
    padding: 0;
}
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
    padding: 45mm 20mm 10mm 20mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
}

.cover-hero-image {
    position: absolute;
    bottom: 35.6mm;
    right: 10mm;
    width: 75mm;
    height: auto;
    filter: grayscale(10%) contrast(1.02) brightness(0.95);
    z-index: 5;
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
    max-width: 95mm;
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

.page-title-badge {
    display: inline-block;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: #fbbf24;
    color: #000000;
    padding: 1px 5px;
    border-radius: 3px;
    position: relative;
    margin-bottom: 6px;
    line-height: 1.3;
}
.page-title-badge::after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 8px;
    border-width: 3px 3px 0;
    border-style: solid;
    border-color: #fbbf24 transparent;
    display: block;
    width: 0;
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
    max-width: 95mm;
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
    display: table;
    width: 100%;
    margin-bottom: 25px;
}

.pricing-info {
    display: table-cell;
    vertical-align: middle;
}

.pricing-side {
    display: table-cell;
    vertical-align: middle;
    text-align: right;
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
    margin-bottom: 12px;
    margin-top: 6px;
}

.proposal-table th {
    background: #18181b;
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 600;
    text-align: left;
    padding: 8px 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.proposal-table td {
    padding: 8px 12px;
    font-size: 14px;
    border-bottom: 1px solid #27272a;
    color: #ffffff;
    vertical-align: top;
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
`;
