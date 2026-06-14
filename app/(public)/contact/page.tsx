import { ContactForm } from "@/components/public/contact-form";
import { ArrowLeft, Mail, MapPin, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { getPageSeo } from "@/lib/server/seo";
import { getLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";

import { ResolvingMetadata } from "next";
import { getSettingValue, getSystemSettings } from "@/lib/server/settings";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("Contact");
    const agencyName = await getSettingValue("AGENCY_NAME", "Crediblemark");
    // ⚡ Optimasi: Gunakan getPageSeo yang ter-cache (unstable_cache, TTL 1 jam)
    const pageSeo = await getPageSeo("/contact");

    const isId = locale === 'id';

    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

    const defaultTitle = t("title") + " | " + agencyName;
    const defaultDesc = t("subtitle");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const alternates = {
        canonical: `${baseUrl}/${locale}/contact`,
        languages: {
            'en': `${baseUrl}/en/contact`,
            'id': `${baseUrl}/id/contact`,
            'x-default': `${baseUrl}/en/contact`,
        }
    };

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: defaultTitle,
            description: defaultDesc,
            openGraph: {
                title: defaultTitle,
                description: defaultDesc,
                images: ogImages,
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: defaultTitle,
                description: defaultDesc,
                images: ogImages,
            },
            alternates
        };
    }

    const title = (isId ? pageSeo.title_id : null) || pageSeo.title || defaultTitle;
    const description = (isId ? pageSeo.description_id : null) || pageSeo.description || defaultDesc;
    const keywords = ((isId ? pageSeo.keywords_id : null) || pageSeo.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            images: ogImages,
            type: "website",
            locale: isId ? 'id_ID' : 'en_US',
            alternateLocale: isId ? ['en_US'] : ['id_ID'],
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

export default async function ContactPage() {
    const t = await getTranslations("Contact");
    // ⚡ Bolt Optimization: Use cached getSystemSettings instead of direct Prisma query
    // 🎯 Why: Prevents redundant DB queries for global settings across the component tree during SSR (N+1 query problem).
    // 📊 Impact: Faster SSR and reduced database load.
    const settings = await getSystemSettings(["CONTACT_EMAIL", "CONTACT_PHONE", "CONTACT_ADDRESS", "CONTACT_HOURS", "AGENCY_NAME"]);

    const info = {
        email: settings.find(s => s.key === "CONTACT_EMAIL")?.value || null,
        phone: settings.find(s => s.key === "CONTACT_PHONE")?.value || null,
        address: settings.find(s => s.key === "CONTACT_ADDRESS")?.value || null,
        hours: settings.find(s => s.key === "CONTACT_HOURS")?.value || null,
    };
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    // Fallbacks
    const email = info.email || "hello@crediblemark.com";
    const phone = info.phone || "+65 6688 8868";
    const address = info.address || "Level 39, Marina Bay Financial Centre\n10 Marina Blvd, Singapore 018983";
    const hours = info.hours || "(Mon-Fri, 9am - 6pm SGT)";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const locale = await getLocale();

    return (
        <div className="min-h-screen bg-black selection:bg-blue-500/30">
            {/* ContactPage JSON-LD untuk E-E-A-T dan Local SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        "name": `Contact ${agencyName}`,
                        "url": `${baseUrl}/${locale}/contact`,
                        "mainEntity": {
                            "@type": "Organization",
                            "name": agencyName,
                            "email": email,
                            "telephone": phone,
                            "address": address ? {
                                "@type": "PostalAddress",
                                "streetAddress": address,
                                "addressCountry": "ID"
                            } : undefined,
                            "url": baseUrl,
                        }
                    })
                }}
            />
            <div className="container mx-auto px-4 py-24 sm:py-32">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        {t("backToHome")}
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                                {t("title")}
                            </h1>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                                {t("subtitle")}
                            </p>
                        </div>

                        <div className="space-y-6 pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                    <Mail className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{t("email")}</h3>
                                    {email.split(',').map((e, i) => (
                                        <p key={i} className={`text-zinc-500 text-sm ${i === 0 ? "mt-1" : ""}`}>
                                            {e.trim()}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                    <MapPin className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{t("office")}</h3>
                                    <p className="text-zinc-500 text-sm mt-1 whitespace-pre-line">
                                        {address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                    <Phone className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{t("phone")}</h3>
                                    <p className="text-zinc-500 text-sm mt-1">{phone}</p>
                                    <p className="text-zinc-500 text-xs mt-1">{hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="relative">
                        {/* Decorative Gradient */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 pointer-events-none" />

                        <div className="relative rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-6 sm:p-8">
                            <Suspense fallback={
                                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                                    <span className="text-zinc-500 text-sm">Loading Form...</span>
                                </div>
                            }>
                                <ContactForm />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
