import { getPortfolios, getPortfolioHtml, getRenderedHtml } from "@/lib/portfolios/actions";
import { isFrameBlocked } from "@/lib/server/cloudflare-rendering";
import { getSettingValue } from "@/lib/server/settings";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewDesignClient } from "./view-design-client";
import { getTranslations } from "next-intl/server";

import { ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";

export const revalidate = 3600; // Cache halaman preview selama 1 jam (ISR)

// Localized SEO: Preview {Nama Porto} | {AGENCY_NAME}
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const locale = await getLocale();
    const portfolios = await getPortfolios();
    const portfolio = portfolios.find((p) => p.slug === slug);
    const agencyName = await getSettingValue("AGENCY_NAME", "Crediblemark");
    const t = await getTranslations("ViewDesign");

    if (!portfolio) {
        return {
            title: `Design Not Found`,
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const title = t("seoTitle", { title: portfolio.title });
    const description = t("seoDescription", { title: portfolio.title, agencyName });
    const isId = locale === 'id';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: previousImages,
            type: "website",
            locale: isId ? 'id_ID' : 'en_US',
            alternateLocale: isId ? ['en_US'] : ['id_ID'],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: previousImages,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/view-design/${slug}`,
            languages: {
                'en': `${baseUrl}/en/view-design/${slug}`,
                'id': `${baseUrl}/id/view-design/${slug}`,
                'x-default': `${baseUrl}/en/view-design/${slug}`,
            }
        }
    };
}

import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export default async function ViewDesignPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const locale = await getLocale();
    const isId = locale === 'id';

    const [portfolios, agencyName, contactPhone, contactTelegram, logoUrl] = await Promise.all([
        getPortfolios(),
        getSettingValue("AGENCY_NAME", "Crediblemark"),
        getSettingValue("CONTACT_PHONE", ""),
        getSettingValue("CONTACT_TELEGRAM", ""),
        getSettingValue("AGENCY_LOGO", ""),
    ]);

    const portfolio = portfolios.find((p) => p.slug === slug);

    if (!portfolio) {
        notFound();
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const localBaseUrl = baseUrl;

    let html = "";
    if (portfolio.externalUrl) {
        // Only use proxy if the site blocks iframes
        const blocked = await isFrameBlocked(portfolio.externalUrl);
        if (blocked) {
            console.log(`[SmartPreview] Proxying blocked site in full view: ${portfolio.externalUrl}`);
            html = await getRenderedHtml(portfolio.externalUrl, localBaseUrl);
        } else {
            html = ""; // Direct src will be used
        }
    } else {
        html = await getPortfolioHtml(portfolio.slug);
    }

    return (
        <>
            <BreadcrumbSchema
                items={[
                    { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
                    { name: 'Portfolio', item: `${baseUrl}/${locale}/portfolio` },
                    { name: portfolio.title, item: `${baseUrl}/${locale}/view-design/${portfolio.slug}` },
                ]}
            />
            <ViewDesignClient
                slug={portfolio.slug}
                title={portfolio.title}
                agencyName={agencyName}
                html={html}
                externalUrl={portfolio.externalUrl}
                contactPhone={contactPhone}
                contactTelegram={contactTelegram}
                logoUrl={logoUrl}
                logoDisplayMode="logo"
            />
        </>
    );
}
