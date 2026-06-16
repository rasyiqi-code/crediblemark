import { ProposalHtmlParams } from "./types";
import { getProposalTitle, getLocaleFlag, getPageFooterHtml, generateAddonsTableRows } from "./helpers";
import { ServiceAddon } from "@/lib/shared/types";

/**
 * Merender struktur HTML untuk Halaman Modul Add-on Opsional (Dinamis per Chunk)
 */
export function renderAddonsPages(
    params: ProposalHtmlParams,
    totalPages: number,
    addonChunks: ServiceAddon[][],
    addonsNeedNewPage: boolean
): string {
    const { service, locale, messages } = params;
    const title = getProposalTitle(service);
    const isEn = getLocaleFlag(locale);
    const baseCurrency = service.currency || "USD";

    const tAddonHeaderModule = messages.ProposalExport.addonHeaderModule as string;
    const tAddonHeaderInvest = messages.ProposalExport.addonHeaderInvest as string;

    if (!addonsNeedNewPage) {
        return "";
    }

    return addonChunks.map((chunk, chunkIdx) => {
        const pageNum = 6 + chunkIdx;
        
        const pageTitle = isEn ? "04.2 / Optional Add-on Modules" : "04.2 / Modul Add-on Opsional";

        const pageIntro = isEn
            ? "Detailed breakdown of the selected optional add-on modules configured to customize the scalability of your infrastructure and digital system:"
            : "Rincian modul tambahan pilihan yang dikonfigurasi untuk menyesuaikan kebutuhan skalabilitas infrastruktur dan sistem digital Anda:";

        return `
        <!-- HALAMAN ADD-ON: HALAMAN ${chunkIdx + 1} -->
        <div class="page">
            <div class="section-header" style="align-items: flex-end;">
                <div style="display: block;">
                    ${chunkIdx > 0 ? `<span class="page-title-badge" style="display: block; margin-bottom: 4px;">${isEn ? "Continued" : "Lanjutan"}</span>` : ''}
                    <h2 class="section-title" style="margin: 0; line-height: 1.1;">${pageTitle}</h2>
                </div>
                <span class="section-subtitle-badge">${getPageFooterHtml(pageNum, totalPages, messages)}</span>
            </div>
     
            <div class="body-section" style="margin-top: 10px;">
                ${chunkIdx === 0 ? `
                <p class="paragraph-text" style="font-size: 14px; color: #ffffff; margin-bottom: 20px;">
                    ${pageIntro}
                </p>
                ` : ''}
                <table class="proposal-table">
                    <thead>
                        <tr>
                            <th>${tAddonHeaderModule}</th>
                            <th style="text-align: right;">${tAddonHeaderInvest}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateAddonsTableRows(chunk, isEn, baseCurrency)}
                    </tbody>
                </table>
            </div>
     
            <div class="page-footer">
                <span>CREDIBLEMARK &bull; Proposal ${title}</span>
                <span>${getPageFooterHtml(pageNum, totalPages, messages)}</span>
            </div>
        </div>
        `;
    }).join("");
}
