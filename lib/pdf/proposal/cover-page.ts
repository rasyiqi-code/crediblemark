import { ProposalHtmlParams } from "./types";
import { getLocaleFlag, getProposalTitle } from "./helpers";

/**
 * Merender struktur HTML untuk Halaman 1 (Cover)
 */
export function renderCoverPage(params: ProposalHtmlParams): string {
    const { service, logoUrl, locale, user, contactInfo, messages } = params;
    const isEn = getLocaleFlag(locale);
    const title = getProposalTitle(service);

    // Tanggal pembuatan proposal hari ini
    const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const tBusinessProposal = messages.ProposalExport.businessProposal as string;
    const tCoverSub = messages.ProposalExport.coverSub as string;
    const tPreparedFor = messages.ProposalExport.preparedFor as string;
    const tValuedClient = messages.ProposalExport.valuedClient as string;
    const clientName = user?.displayName || tValuedClient;
    const tProposalDate = messages.ProposalExport.proposalDate as string;

    return `
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
        
        <!-- Gambar Hero Expert di Sisi Kanan Cover -->
        <img src="/expert.webp" alt="Expert" class="cover-hero-image" />
        
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
            
            <div class="cover-footer" style="align-items: center; position: relative;">
                <!-- Teks di atas garis -->
                <div style="position: absolute; top: -25px; left: 0; font-size: 11px; color: #a1a1aa; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; line-height: 1;">
                    crediblemark.com
                </div>
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
    `;
}
