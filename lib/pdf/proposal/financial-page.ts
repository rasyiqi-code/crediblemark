import { ProposalHtmlParams } from "./types";
import { getProposalTitle, getLocaleFlag, getPageFooterHtml, formatPrice, generateAddonsTableRows } from "./helpers";
import { ServiceAddon } from "@/lib/shared/types";

/**
 * Merender struktur HTML untuk Halaman 5 (Investasi & Logika Finansial)
 */
export function renderFinancialPage(
    params: ProposalHtmlParams, 
    totalPages: number,
    addonsList: ServiceAddon[],
    addonsNeedNewPage: boolean
): string {
    const { service, locale, messages } = params;
    const title = getProposalTitle(service);
    const isEn = getLocaleFlag(locale);
    const baseCurrency = service.currency || "USD";

    // Hitung harga final diskon
    const finalPrice = service.discount && service.discount > 0
        ? service.price * (1 - service.discount / 100)
        : service.price;

    const formatPriceHelper = (amount: number) => {
        return formatPrice(amount, service.currency, baseCurrency);
    };

    const formattedPrice = formatPriceHelper(finalPrice);

    // Lokalisasi teks
    const intervalLabel = service.interval === 'one_time'
        ? (isEn ? 'One Time' : 'Sekali Bayar')
        : (service.interval === 'monthly' ? (isEn ? 'Monthly' : 'Bulanan') : (service.interval === 'yearly' ? (isEn ? 'Yearly' : 'Tahunan') : service.interval));

    const priceModel = service.priceType === 'STARTING_AT'
        ? (isEn ? 'Starting at' : 'Mulai dari')
        : (isEn ? 'Fixed Price' : 'Harga Pasti');

    const tSec4Title = messages.ProposalExport.sec4Title as string;
    const tFinTitle = messages.Financial.title as string;
    const tFinSubtitle = messages.Financial.subtitle as string;
    const tFinHireOld = messages.Financial.hireSenior as string;
    const tFinHireNew = (messages.Financial.hybrid as string).replace("{brand}", "Crediblemark");

    const tFinOverheadLabel = messages.Financial.salaryOldValue as string;
    const tFinOverheadDesc = messages.Financial.salaryOld as string;
    const tFinProjectLabel = messages.Financial.salaryNewValue as string;
    const tFinProjectDesc = messages.Financial.salaryNew as string;

    const fin1Old = messages.Financial.comp1Old as string;
    const fin1New = messages.Financial.comp1New as string;
    const fin2Old = messages.Financial.comp2Old as string;
    const fin2New = messages.Financial.comp2New as string;
    const fin3Old = messages.Financial.comp3Old as string;
    const fin3New = messages.Financial.comp3New as string;

    const tInvestTitle = messages.ProposalExport.investTitle as string;
    const tBaseInvestLabel = (messages.ProposalExport.baseInvestLabel as string).replace("{priceModel}", priceModel);

    const tAddonHeaderModule = messages.ProposalExport.addonHeaderModule as string;
    const tAddonHeaderInvest = messages.ProposalExport.addonHeaderInvest as string;

    return `
    <!-- HALAMAN 5: INVESTASI & LOGIKA FINANSIAL -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec4Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(5, totalPages, messages)}</span>
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
                <!-- Baris 1: Badge + harga coret (inline sederhana, no flex) -->
                <div style="margin-bottom: 6px; line-height: 22px;">
                    <span style="font-size: 10px; font-weight: 800; color: #000000; background: #fbbf24; padding: 0 7px; border-radius: 3px; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; height: 18px; line-height: 18px; margin-right: 8px;">${isEn ? `SAVE ${service.discount}%` : `HEMAT ${service.discount}%`}</span><span style="font-size: 12px; text-decoration: line-through; color: #71717a; font-weight: 500;">${formatPriceHelper(service.price)}</span>
                </div>
                <!-- Baris 2: Teks deskripsi hemat -->
                <p style="font-size: 12px; color: #fbbf24; font-weight: 700; margin: 0; line-height: 1.55; letter-spacing: 0.1px;">${isEn ? `✨ Secure this special value today & instantly keep an extra ${formatPriceHelper(service.price - finalPrice)} in your growth budget — SPECIAL VALUE RATE APPLIED DIRECTLY AS A STRATEGIC PARTNER APPRECIATION.` : `✨ Amankan harga investasi spesial ini sekarang & kunci hemat langsung ${formatPriceHelper(service.price - finalPrice)} untuk dialokasikan ke strategi pertumbuhan bisnis Anda — JAMINAN HARGA TERBAIK SEBAGAI APRESIASI MITRA STRATEGIS.`}</p>
            </div>
            ` : ''}
 
            <!-- Card Utama Harga Bersih & Skema Pembayaran -->
            <div class="pricing-banner">
                <div class="pricing-info">
                    <span style="font-size: 11px; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">${tBaseInvestLabel}</span>
                    <span class="pricing-price" style="display: block; line-height: 1.1;">${formattedPrice}</span>
                </div>
                <div class="pricing-side">
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
            <div style="margin-top: 12px; text-align: right; color: #fbbf24; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${isEn ? "See next page for optional add-ons" : "Lihat halaman berikutnya untuk modul add-on"} &rarr;</div>
            ` : ''}
        </div>
  
        ${addonsList.length > 0 && !addonsNeedNewPage ? `
        <div class="body-section" style="margin-bottom: 15px;">
            <table class="proposal-table">
                <thead>
                    <tr>
                        <th>${tAddonHeaderModule}</th>
                        <th style="text-align: right;">${tAddonHeaderInvest}</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateAddonsTableRows(addonsList, isEn, baseCurrency)}
                </tbody>
            </table>
        </div>
        ` : ''}
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(5, totalPages, messages)}</span>
        </div>
    </div>
    `;
}
