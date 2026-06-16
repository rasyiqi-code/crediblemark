import { ProposalHtmlParams } from "./types";
import { getProposalDescription, getProposalTitle, getPageFooterHtml } from "./helpers";

/**
 * Merender struktur HTML untuk Halaman 2 (Tentang Layanan & Filosofi)
 */
export function renderAboutPage(params: ProposalHtmlParams, totalPages: number): string {
    const { service, messages } = params;
    const title = getProposalTitle(service);
    const descriptionHtml = getProposalDescription(service);

    const quoteText = messages.About.quote as string;
    const aboutDesc = messages.About.description as string;
    const heroDesc = messages.Hero.description as string;

    // Gabungkan deskripsi About dan Hero dengan tanda titik yang sesuai
    const formattedAboutDesc = aboutDesc.endsWith(".") ? aboutDesc : `${aboutDesc}.`;
    const combinedText = `${formattedAboutDesc} ${heroDesc}`;

    const tSec1Title = messages.ProposalExport.sec1Title as string;

    return `
    <!-- HALAMAN 2: DESKRIPSI LAYANAN ASLI & FILOSOFI SOLUSI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec1Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(2, totalPages, messages)}</span>
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
            <span>${getPageFooterHtml(2, totalPages, messages)}</span>
        </div>
    </div>
    `;
}
