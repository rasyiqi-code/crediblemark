import { ProposalHtmlParams } from "./types";
import { getProposalTitle, getLocaleFlag, getPageFooterHtml } from "./helpers";

/**
 * Merender struktur HTML untuk Halaman 6 / Kontak
 */
export function renderContactPage(
    params: ProposalHtmlParams, 
    totalPages: number,
    addonPageCount: number
): string {
    const { service, contactInfo, locale, messages } = params;
    const title = getProposalTitle(service);
    const isEn = getLocaleFlag(locale);

    const pageNum = 7 + addonPageCount;

    return `
    <!-- HALAMAN BARU: KONTAK -->
    <div class="page" style="background: radial-gradient(circle at bottom left, rgba(250, 204, 21, 0.05) 0%, transparent 50%), #000000;">
        <div class="section-header">
            <h2 class="section-title">${isEn ? "06 / Contact Us" : "06 / Hubungi Kami"}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(pageNum, totalPages, messages)}</span>
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
                    <div class="contact-icon-cell">
                        <div class="contact-icon-box">
                            <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </div>
                    </div>
                    <div class="contact-details-cell">
                        <div class="contact-label">${isEn ? "Email" : "Email"}</div>
                        <div style="font-size: 14.5px; margin-top: 4px; line-height: 1.5;">
                            <a href="mailto:${contactInfo?.email || 'hello@crediblemark.com'}" style="color: #fbbf24; text-decoration: none; font-weight: 500;">${contactInfo?.email || 'hello@crediblemark.com'}</a>
                        </div>
                    </div>
                </div>
 
                <!-- Alamat Kantor Item -->
                <div class="contact-item">
                    <div class="contact-icon-cell">
                        <div class="contact-icon-box">
                            <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </div>
                    </div>
                    <div class="contact-details-cell">
                        <div class="contact-label">${isEn ? "Office" : "Kantor"}</div>
                        <div style="font-size: 14.5px; margin-top: 4px; line-height: 1.5; color: #a1a1aa;">${contactInfo?.address || 'Jl Raya Batang-Batang, No 12, Darmaayu, Andulang, Gapura, Sumenep, Indonesia'}</div>
                    </div>
                </div>
 
                <!-- Telepon Item -->
                <div class="contact-item">
                    <div class="contact-icon-cell">
                        <div class="contact-icon-box">
                            <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: currentColor;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        </div>
                    </div>
                    <div class="contact-details-cell">
                        <div class="contact-label">${isEn ? "Phone" : "Telepon"}</div>
                        <div style="font-size: 14.5px; margin-top: 4px; line-height: 1.5;">
                            <a href="tel:${contactInfo?.phone || '+6285183131249'}" style="color: #fbbf24; text-decoration: none; font-weight: 500;">${contactInfo?.phone || '+6285183131249'}</a>
                        </div>
                        <div style="color: #71717a; font-size: 12.5px; margin-top: 2px;">(${contactInfo?.hours || 'Senin - Jumat, 08.00 - 17.00 WIB'})</div>
                    </div>
                </div>
            </div>
        </div>
 
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(pageNum, totalPages, messages)}</span>
        </div>
    </div>
    `;
}
