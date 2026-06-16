import { ServiceAddon } from "@/lib/shared/types";
import { ProposalMessages, ServiceDataForPdf } from "../proposal-template";

export interface ProposalHtmlParams {
    service: ServiceDataForPdf;
    logoUrl: string | null;
    signatureUrl: string | null;
    stampUrl: string | null;
    contactInfo: {
        email: string;
        phone: string;
        telegram: string;
        address: string;
        hours: string;
    } | null;
    locale: string;
    user: {
        displayName?: string | null;
        email?: string | null;
    } | null;
    globalAddons?: ServiceAddon[];
    messages: ProposalMessages;
}
