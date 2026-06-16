import { ProposalHtmlParams } from "./types";
import { getProposalTitle, getPageFooterHtml } from "./helpers";

/**
 * Merender struktur HTML untuk Halaman 3 (Fitur & Deliverables)
 */
export function renderFeaturesPage(params: ProposalHtmlParams, totalPages: number): string {
    const { service, messages } = params;
    const title = getProposalTitle(service);

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

    const tSec2Title = messages.ProposalExport.sec2Title as string;
    const tFeaturesIntro = messages.ProposalExport.featuresIntro as string;
    const tFallbackFeature = (messages.ProposalExport.fallbackFeature as string).replace("{title}", title);

    return `
    <!-- HALAMAN 3: FITUR & DELIVERABLES ASLI -->
    <div class="page">
        <div class="section-header">
            <h2 class="section-title">${tSec2Title}</h2>
            <span class="section-subtitle-badge">${getPageFooterHtml(3, totalPages, messages)}</span>
        </div>
 
        <div class="body-section">
            <p class="paragraph-text" style="font-size: 16px; color: #ffffff; margin-bottom: 15px;">
                ${tFeaturesIntro}
            </p>
            
            <div class="scope-container">
                <div class="features-grid">
                    ${featuresListHtml ? featuresListHtml : `
                        <div class="feature-card-item">
                            <div class="feature-card-dot"></div>
                            <div class="feature-card-text">${tFallbackFeature}</div>
                        </div>
                    `}
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>CREDIBLEMARK &bull; Proposal ${title}</span>
            <span>${getPageFooterHtml(3, totalPages, messages)}</span>
        </div>
    </div>
    `;
}
