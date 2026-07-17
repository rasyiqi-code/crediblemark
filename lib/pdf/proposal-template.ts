import { ServiceAddon } from "@/lib/shared/types";
import { proposalStyles } from "./proposal/proposal-styles";
import { renderCoverPage } from "./proposal/cover-page";
import { renderAboutPage } from "./proposal/about-page";
import { renderFeaturesPage } from "./proposal/features-page";
import { renderPartnershipPage } from "./proposal/partnership-page";
import { renderFinancialPage } from "./proposal/financial-page";
import { renderAddonsPages } from "./proposal/addons-pages";
import { renderFaqPage } from "./proposal/faq-page";
import { renderContactPage } from "./proposal/contact-page";
import { getProposalTitle } from "./proposal/helpers";

// Definisikan ulang type dan interface agar tetap kompatibel dengan file importir eksternal
export interface ServiceDataForPdf {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    currency?: string | null;
    interval: string;
    priceType?: string | null;
    features?: unknown;
    features_id?: unknown;
    addons?: unknown;
    addons_id?: unknown;
}

export interface ProposalMessages {
    About: {
        quote: string;
        description: string;
    };
    Hero: {
        description: string;
    };
    ProposalExport: {
        businessProposal: string;
        coverSub: string;
        preparedFor: string;
        valuedClient: string;
        proposalDate: string;
        sec1Title: string;
        sec2Title: string;
        sec3Title: string;
        sec4Title: string;
        sec5Title: string;
        pageFooter: string;
        featuresIntro: string;
        fallbackFeature: string;
        investTitle: string;
        baseInvestLabel: string;
        addonHeaderModule: string;
        addonHeaderInvest: string;
        moreInfoAt: string;
        agreementText: string;
        clientRepresentative: string;
    };
    Comparison: {
        title: string;
        subtitle: string;
        proposalTitle?: string;
        proposalSubtitle?: string;
        oldTitle: string;
        newTitle: string;
        old1: string;
        old1Sub: string;
        old2: string;
        old2Sub: string;
        old3: string;
        old3Sub: string;
        old4: string;
        old4Sub: string;
        new1: string;
        new1Sub: string;
        new2: string;
        new2Sub: string;
        new3: string;
        new3Sub: string;
        new4: string;
        new4Sub: string;
    };
    Service: {
        everythingToSucceed: string;
        premiumStandard: string;
        f1: string;
        f2: string;
        f3: string;
        f4: string;
        f5: string;
        f6: string;
    };
    ProposalFinancial: {
        title: string;
        subtitle: string;
        hireSenior: string;
        hybrid: string;
        salaryOldValue: string;
        salaryOld: string;
        salaryNewValue: string;
        salaryNew: string;
        comp1Old: string;
        comp1New: string;
        comp2Old: string;
        comp2New: string;
        comp3Old: string;
        comp3New: string;
    };
    FAQ: {
        title: string;
        proposalQ1: string;
        proposalA1: string;
        proposalQ2: string;
        proposalA2: string;
        proposalQ3: string;
        proposalA3: string;
    };
    Guarantee: {
        title: string;
        subtitle: string;
        desc: string;
        footer: string;
    };
    [key: string]: unknown;
}

export { type ProposalHtmlParams } from "./proposal/types";
import { ProposalHtmlParams } from "./proposal/types";

/**
 * Fungsi utama untuk merangkai seluruh halaman HTML Proposal PDF secara modular.
 */
export function generateProposalHtml(params: ProposalHtmlParams): string {
    const { service, globalAddons = [] } = params;
    const title = getProposalTitle(service);

    // Format Addons dari database global (atau fallback ke addons lama jika kosong)
    let addonsList: ServiceAddon[] = [];
    if (globalAddons && globalAddons.length > 0) {
        addonsList = globalAddons;
    } else {
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
    }

    const chunkArray = <T>(arr: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    // Chunk list addon per 19 item untuk mencegah overflow halaman
    const addonChunks = chunkArray(addonsList, 19);
    const addonsNeedNewPage = addonsList.length > 3;
    const addonPageCount = addonsNeedNewPage ? addonChunks.length : 0;
    const totalPages = 7 + addonPageCount;

    // Render masing-masing komponen halaman secara terpisah
    const coverHtml = renderCoverPage(params);
    const aboutHtml = renderAboutPage(params, totalPages);
    const featuresHtml = renderFeaturesPage(params, totalPages);
    const partnershipHtml = renderPartnershipPage(params, totalPages);
    const financialHtml = renderFinancialPage(params, totalPages, addonsList, addonsNeedNewPage);
    const addonsPagesHtml = renderAddonsPages(params, totalPages, addonChunks, addonsNeedNewPage);
    const faqHtml = renderFaqPage(params, totalPages, addonPageCount);
    const contactHtml = renderContactPage(params, totalPages, addonPageCount);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <base href="${params.baseUrl}">
    <title>${title} - Proposal Layanan</title>
    <style>
        ${proposalStyles}
    </style>
</head>
<body>
    ${coverHtml}
    ${aboutHtml}
    ${featuresHtml}
    ${partnershipHtml}
    ${financialHtml}
    ${addonsPagesHtml}
    ${faqHtml}
    ${contactHtml}
</body>
</html>
    `;
}
