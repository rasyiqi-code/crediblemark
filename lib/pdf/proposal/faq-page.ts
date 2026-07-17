import { ProposalHtmlParams } from "./types";
import { getProposalTitle, getPageFooterHtml } from "./helpers";

/**
 * Merender struktur HTML untuk Halaman FAQ & Otorisasi Persetujuan
 */
export function renderFaqPage(
    params: ProposalHtmlParams, 
    totalPages: number,
    addonPageCount: number
): string {
    const { service, signatureUrl, stampUrl, messages } = params;
    const title = getProposalTitle(service);

    const tSec5Title = messages.ProposalExport.sec5Title as string;
    const tFaqTitle = messages.FAQ.title as string;
    const tMoreInfoAt = messages.ProposalExport.moreInfoAt as string;

    const faqQ1 = messages.FAQ.proposalQ1 as string;
    const faqA1 = messages.FAQ.proposalA1 as string;
    const faqQ2 = messages.FAQ.proposalQ2 as string;
    const faqA2 = messages.FAQ.proposalA2 as string;
    const faqQ3 = messages.FAQ.proposalQ3 as string;
    const faqA3 = messages.FAQ.proposalA3 as string;

    const tGuarTitle = messages.Guarantee.title as string;
    const tGuarSubtitle = (messages.Guarantee.subtitle as string).replace("\n", " ");
    const tGuarDesc = `${messages.Guarantee.desc as string} ${messages.Guarantee.footer as string}`;

    const tAgreementText = messages.ProposalExport.agreementText as string;
    const tClientRepresentative = messages.ProposalExport.clientRepresentative as string;

    const pageNum = 6 + addonPageCount;

    return `
    <!-- HALAMAN FAQ & OTORISASI PERSETUJUAN -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec5Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(pageNum, totalPages, messages)}</span>
        </div>
  
        <!-- FAQ Section -->
        <div class="body-section" style="margin-bottom: 12px;">
            <h3 class="body-section-title">${tFaqTitle}</h3>
            <p class="paragraph-text" style="font-size: 13px; color: #ffffff; margin-bottom: 12px; margin-top: 0;">
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
            <span>${getPageFooterHtml(pageNum, totalPages, messages)}</span>
        </div>
    </div>
    `;
}
