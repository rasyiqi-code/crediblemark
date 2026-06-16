import { ProposalHtmlParams } from "./types";
import { getProposalTitle, getPageFooterHtml } from "./helpers";

/**
 * Merender struktur HTML untuk Halaman 4 (Kemitraan & Jaminan)
 */
export function renderPartnershipPage(params: ProposalHtmlParams, totalPages: number): string {
    const { service, messages } = params;
    const title = getProposalTitle(service);

    const tSec3Title = messages.ProposalExport.sec3Title as string;
    const tCompTitle = (messages.Comparison.title as string).replace("{brand}", "Crediblemark");
    const tCompSubtitle = messages.Comparison.subtitle as string;
    const tCompOldTitle = messages.Comparison.oldTitle as string;
    const tCompNewTitle = (messages.Comparison.newTitle as string).replace("{brand}", "Crediblemark");

    const old1 = messages.Comparison.old1 as string;
    const old1Sub = messages.Comparison.old1Sub as string;
    const old2 = messages.Comparison.old2 as string;
    const old2Sub = messages.Comparison.old2Sub as string;
    const old3 = messages.Comparison.old3 as string;
    const old3Sub = messages.Comparison.old3Sub as string;
    const old4 = messages.Comparison.old4 as string;
    const old4Sub = messages.Comparison.old4Sub as string;

    const new1 = messages.Comparison.new1 as string;
    const new1Sub = messages.Comparison.new1Sub as string;
    const new2 = messages.Comparison.new2 as string;
    const new2Sub = messages.Comparison.new2Sub as string;
    const new3 = messages.Comparison.new3 as string;
    const new3Sub = messages.Comparison.new3Sub as string;
    const new4 = messages.Comparison.new4 as string;
    const new4Sub = messages.Comparison.new4Sub as string;

    const tEverything = messages.Service.everythingToSucceed as string;
    const tPremiumStandard = messages.Service.premiumStandard as string;
    const f1 = messages.Service.f1 as string;
    const f2 = messages.Service.f2 as string;
    const f3 = messages.Service.f3 as string;
    const f4 = messages.Service.f4 as string;
    const f5 = messages.Service.f5 as string;
    const f6 = messages.Service.f6 as string;

    return `
    <!-- HALAMAN 4: KEMITRAAN & JAMINAN STANDAR PREMIUM -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec3Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(4, totalPages, messages)}</span>
        </div>
 
        <!-- Kenapa Pilih Kami (Comparison Section) -->
        <div class="body-section" style="margin-bottom: 25px;">
            <h3 class="body-section-title">${tCompTitle}</h3>
            <p class="paragraph-text" style="font-size: 14px; color: #ffffff; margin-bottom: 8px;">
                ${tCompSubtitle}
            </p>
            <div class="comp-container">
                <div class="comp-box old">
                    <div class="comp-title-bar old">${tCompOldTitle}</div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old1}</strong> ${old1Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old2}</strong> ${old2Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old3}</strong> ${old3Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon old">&times;</div>
                        <div class="comp-item-text"><strong>${old4}</strong> ${old4Sub}</div>
                    </div>
                </div>
                <div class="comp-box new">
                    <div class="comp-title-bar new">${tCompNewTitle}</div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new1}</strong> ${new1Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new2}</strong> ${new2Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new3}</strong> ${new3Sub}</div>
                    </div>
                    <div class="comp-item">
                        <div class="comp-icon new">&check;</div>
                        <div class="comp-item-text"><strong>${new4}</strong> ${new4Sub}</div>
                    </div>
                </div>
            </div>
        </div>
 
        <!-- Jaminan Standar Premium (f1 - f6) -->
        <div class="body-section">
            <h3 class="body-section-title">${tEverything}</h3>
            
            <div class="success-grid" style="margin-top: 8px;">
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f1}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f2}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f3}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f4}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f5}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
                <div class="success-card">
                    <div class="success-icon-box">&check;</div>
                    <div class="success-content">
                        <span class="success-card-title">${f6}</span>
                        <span class="success-card-desc">${tPremiumStandard}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(4, totalPages, messages)}</span>
        </div>
    </div>
    `;
}
