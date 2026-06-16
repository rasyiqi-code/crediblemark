import { ServiceAddon } from "@/lib/shared/types";
import { ProposalMessages, ServiceDataForPdf } from "../proposal-template";

export function getLocaleFlag(locale: string): boolean {
    return locale.startsWith("en");
}

export function formatPrice(amount: number, currency: string | null | undefined, baseCurrency: string): string {
    const activeCurrency = currency || baseCurrency;
    return activeCurrency === "IDR"
        ? `Rp ${amount.toLocaleString("id-ID")}`
        : `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getProposalTitle(service: ServiceDataForPdf): string {
    return service.title_id || service.title;
}

export function getProposalDescription(service: ServiceDataForPdf): string {
    return service.description_id || service.description;
}

export function getPageFooterHtml(page: number, totalPages: number, messages: ProposalMessages): string {
    const template = messages.ProposalExport.pageFooter as string;
    return template
        .replace("{page}", page.toString())
        .replace(/\b6\b/, totalPages.toString());
}

export function generateAddonsTableRows(
    addonsSubList: ServiceAddon[], 
    isEn: boolean, 
    baseCurrency: string
): string {
    return addonsSubList.map(addon => {
        const addPrice = typeof addon.price === "string" ? parseFloat(addon.price) : (typeof addon.price === "number" ? addon.price : 0);
        
        let addonFormattedPrice = (addon.currency || baseCurrency) === "IDR"
            ? `Rp ${addPrice.toLocaleString("id-ID")}`
            : `$${addPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if (addon.interval === "monthly") {
            addonFormattedPrice += isEn ? "/mo" : "/bln";
        } else if (addon.interval === "yearly") {
            addonFormattedPrice += isEn ? "/yr" : "/thn";
        }

        const displayName = !isEn ? (addon.name_id || addon.name) : addon.name;

        return `
            <tr>
                <td><strong>${displayName}</strong><br><small style="color: #a1a1aa; font-size: 11px;">${addon.description || ''}</small></td>
                <td style="text-align: right; font-weight: 600; color: #fbbf24; white-space: nowrap;">${addonFormattedPrice}</td>
            </tr>
        `;
    }).join("");
}
