import { getPageSeo } from "@/lib/server/seo";
import { getSystemSettings } from "@/lib/server/settings";
import { SubmitTestimonialForm } from "./form";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";

import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    // ⚡ Optimasi: Gunakan getPageSeo yang ter-cache (unstable_cache, TTL 1 jam)
    const pageSeo = await getPageSeo("/submit-testimonial");

    const isId = locale === 'id';
    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const alternates = {
        canonical: `${baseUrl}/${locale}/submit-testimonial`,
        languages: {
            'en': `${baseUrl}/en/submit-testimonial`,
            'id': `${baseUrl}/id/submit-testimonial`,
            'x-default': `${baseUrl}/en/submit-testimonial`,
        }
    };

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: isId ? "Kirim Testimonial" : "Submit Testimonial",
            robots: "noindex, nofollow",
            openGraph: {
                title: isId ? "Kirim Testimonial" : "Submit Testimonial",
                images: ogImages,
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: isId ? "Kirim Testimonial" : "Submit Testimonial",
                images: ogImages,
            },
            alternates
        };
    }

    const title = (isId ? pageSeo.title_id : null) || pageSeo.title || (isId ? "Kirim Testimonial" : "Submit Testimonial");
    const description = (isId ? pageSeo.description_id : null) || pageSeo.description || undefined;
    const keywords = ((isId ? pageSeo.keywords_id : null) || pageSeo.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords,
        robots: "noindex, nofollow",
        openGraph: {
            title,
            description,
            images: ogImages,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImages,
        },
        alternates
    };
}

export const dynamic = "force-dynamic";

export default async function SubmitTestimonialPage() {
    const user = await hexclaveServerApp.getUser().catch(() => null);

    if (!user) {
        redirect("/handler/sign-in?after_auth_return_to=/submit-testimonial");
    }

    // ⚡ Optimasi: Gunakan getSystemSettings yang ter-cache untuk menghindari query DB langsung
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <SubmitTestimonialForm
            agencyName={agencyName}
            userAvatar={user.profileImageUrl}
            userName={user.displayName}
        />
    );
}
