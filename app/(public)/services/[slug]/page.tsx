import { getServiceBySlug } from "@/lib/server/services";
import { ServiceDetailContent } from "@/components/public/service-detail";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Testimonials } from "@/components/landing/section-testimonials";
import { SectionGuarantee } from "@/components/landing/section-guarantee";
import { FAQSection } from "@/components/landing/faq-section-fixed";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { getSystemSettings } from "@/lib/server/settings";
import { getActiveTestimonials } from "@/lib/server/testimonials";
import { prisma } from "@/lib/config/db";

export const revalidate = 3600; // Cache halaman detail layanan selama 1 jam (ISR)

interface ServicePageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateMetadata(props: ServicePageProps, parent: ResolvingMetadata): Promise<Metadata> {
    const params = await props.params;
    const locale = await getLocale();
    const service = await getServiceBySlug(params.slug);

    if (!service) return { title: "Service Not Found" };

    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    const isId = locale === 'id';
    const title = (isId ? service.title_id : null) || service.title;
    const displayTitle = `${title} | ${brand}`;
    const description = (isId ? service.description_id : null) || service.description;

    // Clean description for meta tag (remove HTML tags)
    const cleanDescription = description.replace(/<[^>]*>?/gm, '').slice(0, 160);
    // Gunakan OG image global dari parent layout (tidak spesifik per service)
    const previousImages = (await parent).openGraph?.images || [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
        // Menggunakan title.absolute agar tidak ditimpa/ditambahkan brand ganda oleh layout template
        title: {
            absolute: displayTitle
        },
        description: cleanDescription,
        openGraph: {
            title: displayTitle,
            description: cleanDescription,
            images: previousImages,
            type: "website",
            locale: isId ? 'id_ID' : 'en_US',
            alternateLocale: isId ? ['en_US'] : ['id_ID'],
        },
        twitter: {
            card: "summary_large_image",
            title: displayTitle,
            description: cleanDescription,
            images: previousImages,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/services/${params.slug}`,
            // Menambahkan alternate hreflang untuk optimasi mesin pencari multibahasa
            languages: {
                'en': `${baseUrl}/en/services/${params.slug}`,
                'id': `${baseUrl}/id/services/${params.slug}`,
                'x-default': `${baseUrl}/en/services/${params.slug}`,
            }
        }
    };
}

export default async function PublicServiceDetailPage(props: ServicePageProps) {
    const params = await props.params;
    const locale = await getLocale();
    const isId = locale === 'id';

    const service = await getServiceBySlug(params.slug);

    if (!service) {
        notFound();
    }

    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    const title = (isId ? service.title_id : null) || service.title;
    const description = (isId ? service.description_id : null) || service.description || "";
    const cleanDescription = description.replace(/<[^>]*>?/gm, '').slice(0, 160);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Fetch testimonial untuk aggregateRating schema (bintang rich snippet di SERP)
    const testimonials = await getActiveTestimonials(100);
    const ratingsWithValue = testimonials.filter((t) => typeof t.rating === 'number' && t.rating > 0);
    const avgRating = ratingsWithValue.length > 0
        ? (ratingsWithValue.reduce((sum, t) => sum + (t.rating ?? 5), 0) / ratingsWithValue.length).toFixed(1)
        : null;

    // Social proof avatars (temporarily disabled due to Stack Auth SDK error)
    const trustedAvatars: string[] = [];

    // Transform to match interface safely
    const processedService = {
        ...service,
        features: service.features as unknown,
        features_id: service.features_id as unknown
    };

    // Fetch global active addons
    const globalAddons = await prisma.addon.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="flex flex-col">
            <BreadcrumbSchema
                items={[
                    { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
                    { name: isId ? 'Layanan' : 'Services', item: `${baseUrl}/${locale}/services` },
                    { name: title, item: `${baseUrl}/${locale}/services/${service.slug}` },
                ]}
            />
            {/* Service Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "serviceType": title,
                        "name": title,
                        "url": `${baseUrl}/${locale}/services/${service.slug}`,
                        "image": service.image || undefined,
                        "provider": {
                            "@type": "Organization",
                            "name": brand,
                            "url": baseUrl
                        },
                        "description": cleanDescription,
                        "areaServed": "Worldwide",
                        // aggregateRating untuk rich snippet bintang di Google SERP
                        ...(avgRating && ratingsWithValue.length >= 3 ? {
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": avgRating,
                                "bestRating": "5",
                                "worstRating": "1",
                                "ratingCount": ratingsWithValue.length,
                            }
                        } : {}),
                        // Menambahkan properti offers langsung di bawah Service agar terdeteksi oleh Rich Snippets Google
                        "offers": {
                            "@type": "Offer",
                            "price": service.price,
                            "priceCurrency": service.currency || "USD",
                            "url": `${baseUrl}/${locale}/services/${service.slug}`
                        },
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": title,
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": title
                                    },
                                    "price": service.price,
                                    "priceCurrency": service.currency || "USD"
                                }
                            ]
                        }
                    })
                }}
            />
            <ServiceDetailContent
                service={processedService}
                isId={isId}
                showBack={true}
                trustedAvatars={trustedAvatars}
                globalAddons={globalAddons}
            />
            <Testimonials />
            <SectionGuarantee />
            <FAQSection />
        </div>
    );
}
