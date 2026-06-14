import { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getPageSeo } from "@/lib/server/seo";
import { getSystemSettings } from "@/lib/server/settings";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { InteractivePricing } from "./components/interactive-pricing";
import { WordPressFAQ } from "./components/wordpress-faq";
import { Shield, Zap, Sparkles, ShoppingBag, ArrowDown } from "lucide-react";

export const revalidate = 3600; // Cache halaman selama 1 jam (ISR)

export async function generateMetadata(
    _props: unknown,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    const isId = locale === 'id';
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    
    // Fetch SEO metadata dari database jika terdaftar
    const pageSeo = await getPageSeo("/wordpress");

    const defaultTitle = isId 
        ? `Jasa Pembuatan WordPress Premium | ${brand}`
        : `Premium WordPress Development Services | ${brand}`;
    const defaultDesc = isId 
        ? "Jasa pembuatan website WordPress premium, cepat, aman, dan berkinerja tinggi. Desain kustom profesional tanpa template lambat."
        : "Premium, fast, secure, and high-performance WordPress website development. Bespoke professional design with zero slow templates.";

    const title = (isId ? pageSeo?.title_id : null) || pageSeo?.title || defaultTitle;
    const description = (isId ? pageSeo?.description_id : null) || pageSeo?.description || defaultDesc;
    const keywords = ((isId ? pageSeo?.keywords_id : null) || pageSeo?.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean);

    const previousImages = (await parent).openGraph?.images || [];
    const ogImage = (isId ? pageSeo?.ogImage_id : null) || pageSeo?.ogImage;
    const ogImages = ogImage ? [ogImage] : previousImages;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
        title: {
            absolute: title
        },
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
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
        alternates: {
            canonical: `${baseUrl}/${locale}/wordpress`,
            languages: {
                'en': `${baseUrl}/en/wordpress`,
                'id': `${baseUrl}/id/wordpress`,
                'x-default': `${baseUrl}/en/wordpress`,
            }
        }
    };
}

export default async function WordPressLandingPage() {
    const locale = await getLocale();
    const isId = locale === 'id';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Fetch data settings agensi
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <div className="flex flex-col min-h-screen bg-black overflow-hidden bg-grid-travel selection:bg-violet-500/30 selection:text-white relative">
            <BreadcrumbSchema
                items={[
                    { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
                    { name: isId ? 'Jasa WordPress' : 'WordPress Services', item: `${baseUrl}/${locale}/wordpress` },
                ]}
            />

            {/* Schema Markup JSON-LD untuk Layanan WordPress */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "serviceType": isId ? "Jasa Pembuatan WordPress" : "WordPress Development Service",
                        "name": isId ? "WordPress Premium Launchpad" : "WordPress Premium Launchpad",
                        "description": isId
                            ? "Jasa pembuatan website WordPress berkinerja tinggi, kustom, aman, dan SEO-ready oleh tim pengembang senior."
                            : "High-performance, custom, secure, and SEO-ready WordPress development services by senior developers.",
                        "provider": {
                            "@type": "Organization",
                            "name": brand,
                            "url": baseUrl
                        },
                        "areaServed": "Worldwide",
                        "offers": {
                            "@type": "Offer",
                            "price": "12500000",
                            "priceCurrency": "IDR",
                            "url": `${baseUrl}/${locale}/wordpress`
                        }
                    })
                }}
            />

            {/* Hero Section */}
            <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 flex flex-col items-center text-center px-4 sm:px-6">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-brand-yellow/5 blur-[150px] animate-nebula-slow" />
                <div className="absolute top-1/3 left-1/3 -z-10 h-96 w-96 rounded-full bg-brand-yellow/2 blur-[120px] animate-nebula-reverse" />

                {/* Floating WordPress Logos in Background */}
                <div className="absolute top-1/4 left-[10%] opacity-[0.25] text-brand-yellow/20 filter drop-shadow-[0_0_30px_rgba(254,215,0,0.15)] animate-float-rotate pointer-events-none hidden lg:block">
                    <svg viewBox="0 0 122.52 122.523" className="w-36 h-36" fill="currentColor">
                        <path d="m8.708 61.26c0 20.802 12.089 38.779 29.619 47.298l-25.069-68.686c-2.916 6.536-4.55 13.769-4.55 21.388z"/>
                        <path d="m96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501l19.138 56.925 11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z"/>
                        <path d="m62.184 65.857-15.768 45.819c4.708 1.384 9.687 2.141 14.846 2.141 6.12 0 11.989-1.058 17.452-2.979-.141-.225-.269-.464-.374-.724z"/>
                        <path d="m107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.053 46.413c15.624-9.111 26.133-26.038 26.133-45.426.001-9.137-2.333-17.729-6.438-25.215z"/>
                        <path d="m61.262 0c-33.779 0-61.262 27.481-61.262 61.26 0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263-.001-33.779-27.487-61.26-61.265-61.26zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z"/>
                    </svg>
                </div>
                <div className="absolute top-1/3 right-[12%] opacity-[0.20] text-brand-yellow/15 filter drop-shadow-[0_0_30px_rgba(254,215,0,0.1)] animate-float-rotate-reverse pointer-events-none hidden lg:block">
                    <svg viewBox="0 0 122.52 122.523" className="w-44 h-44" fill="currentColor">
                        <path d="m8.708 61.26c0 20.802 12.089 38.779 29.619 47.298l-25.069-68.686c-2.916 6.536-4.55 13.769-4.55 21.388z"/>
                        <path d="m96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501l19.138 56.925 11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z"/>
                        <path d="m62.184 65.857-15.768 45.819c4.708 1.384 9.687 2.141 14.846 2.141 6.12 0 11.989-1.058 17.452-2.979-.141-.225-.269-.464-.374-.724z"/>
                        <path d="m107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.053 46.413c15.624-9.111 26.133-26.038 26.133-45.426.001-9.137-2.333-17.729-6.438-25.215z"/>
                        <path d="m61.262 0c-33.779 0-61.262 27.481-61.262 61.26 0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263-.001-33.779-27.487-61.26-61.265-61.26zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z"/>
                    </svg>
                </div>
                <div className="absolute top-1/2 left-[50%] -translate-x-1/2 opacity-[0.20] text-brand-yellow/20 filter drop-shadow-[0_0_20px_rgba(254,215,0,0.15)] animate-float-rotate pointer-events-none block lg:hidden">
                    <svg viewBox="0 0 122.52 122.523" className="w-28 h-28" fill="currentColor">
                        <path d="m8.708 61.26c0 20.802 12.089 38.779 29.619 47.298l-25.069-68.686c-2.916 6.536-4.55 13.769-4.55 21.388z"/>
                        <path d="m96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501l19.138 56.925 11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z"/>
                        <path d="m62.184 65.857-15.768 45.819c4.708 1.384 9.687 2.141 14.846 2.141 6.12 0 11.989-1.058 17.452-2.979-.141-.225-.269-.464-.374-.724z"/>
                        <path d="m107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.053 46.413c15.624-9.111 26.133-26.038 26.133-45.426.001-9.137-2.333-17.729-6.438-25.215z"/>
                        <path d="m61.262 0c-33.779 0-61.262 27.481-61.262 61.26 0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263-.001-33.779-27.487-61.26-61.265-61.26zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z"/>
                    </svg>
                </div>

                <div className="container mx-auto max-w-4xl space-y-6 animate-hero-fade-in relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-yellow/20 bg-brand-yellow/5 text-xs text-brand-yellow font-mono tracking-wider uppercase animate-hero-fade-up">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        {isId ? "Kinerja Tinggi • Bebas Bloatware" : "High Performance • Bloat-Free"}
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] animate-hero-fade-up animation-delay-100">
                        {isId ? "Jasa Pembuatan Website " : "Premium Custom "}
                        <span className="bg-gradient-to-r from-brand-yellow via-yellow-200 to-amber-500 bg-clip-text text-transparent animate-pulse-glow animate-text-shimmer">
                            WordPress
                        </span>
                        {isId ? " Premium" : " Development"}
                    </h1>

                    <p className="text-zinc-400 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-hero-fade-up animation-delay-200">
                        {isId
                            ? "Kami membangun arsitektur WordPress dari nol menggunakan core blocks yang ringan. Skor kecepatan 90+, sistem keamanan berlapis, dan 100% hak milik Anda."
                            : "We engineer WordPress architectures from scratch using lightweight core blocks. 90+ mobile speed scores, fortified security walls, and 100% full ownership."}
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-hero-fade-up animation-delay-300">
                        <a
                            href="#pricing"
                            className="bg-brand-yellow hover:bg-yellow-400 text-black font-bold h-12 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-yellow/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-sm"
                        >
                            <span>{isId ? "Lihat Paket & Harga" : "Configure Package"}</span>
                            <ArrowDown className="w-4 h-4 animate-bounce text-black" />
                        </a>
                        <a
                            href={`/${locale}/contact?subject=WordPress%20Inquiry`}
                            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold h-12 px-8 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer w-full sm:w-auto text-sm"
                        >
                            {isId ? "Tanya Pengembang" : "Consult Developer"}
                        </a>
                    </div>
                </div>
            </section>

            {/* Bento Grid: Keunggulan Layanan */}
            <section className="py-10 md:py-14 bg-zinc-950/20 border-y border-white/5 relative">
                <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {isId ? "Mengapa WordPress Kami Berbeda?" : "Why Our WordPress Sites Excel?"}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
                            {isId 
                                ? "Kami menolak template murah berkode kotor. Kami membuat sistem WordPress berstandar korporat."
                                : "We reject bloated, dirty-coded templates. We build WordPress pages optimized for enterprise standards."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-3 md:gap-5">
                        {/* Box 1: UI/UX Kustom (Size: 7/12) */}
                        <div className="md:col-span-7 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-brand-yellow/30 hover:shadow-[0_10px_30px_rgba(254,215,0,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-brand-yellow transition-colors sm:mt-4">
                                        {isId ? "Desain UI/UX Unik & Kustom" : "Bespoke UI/UX Design"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Setiap halaman dirancang khusus dari nol menyesuaikan identitas brand Anda. Bebas dari template pasaran, menghasilkan citra digital yang mewah dan eksklusif."
                                        : "Every screen is crafted from scratch to perfectly align with your brand identity. Zero generic templates, ensuring a premium and exclusive digital presence."}
                                </p>
                            </div>
                        </div>

                        {/* Box 2: Kecepatan Laju (Size: 5/12) */}
                        <div className="md:col-span-5 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-brand-yellow/30 hover:shadow-[0_10px_30px_rgba(254,215,0,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-300" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors sm:mt-4">
                                        {isId ? "Optimasi Kecepatan Ekstrim" : "Extreme Speed Tuning"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Menggunakan caching layer tingkat lanjut (Redis), server teroptimasi, dan pemotongan aset gambar modern. Jaminan skor Core Web Vitals 90+."
                                        : "Configured with Redis server caching, image optimization, and CDN routing. We guarantee 90+ Core Web Vitals mobile and desktop speed marks."}
                                </p>
                            </div>
                        </div>

                        {/* Box 3: Keamanan (Size: 5/12) */}
                        <div className="md:col-span-5 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-brand-yellow/30 hover:shadow-[0_10px_30px_rgba(254,215,0,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-red-300 transition-colors sm:mt-4">
                                        {isId ? "Proteksi Keamanan Berlapis" : "Fortified Security Walls"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Path login admin dirubah, XML-RPC dinonaktifkan, proteksi brute-force diaktifkan, serta sistem deteksi malware otomatis yang berjalan setiap hari."
                                        : "Admin login paths shifted, XML-RPC deactivated, brute-force filters turned on, and daily automated malware scans set up to guard your website."}
                                </p>
                            </div>
                        </div>

                        {/* Box 4: E-commerce & Toko Online (Size: 7/12) */}
                        <div className="md:col-span-7 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-brand-yellow/30 hover:shadow-[0_10px_30px_rgba(254,215,0,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-125 transition-transform duration-300" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors sm:mt-4">
                                        {isId ? "Sistem E-Commerce Kustom" : "Bespoke E-Commerce Engine"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Integrasikan sistem toko online kustom buatan kami sendiri yang super ringan, kebal terhadap celah keamanan (exploit) umum WooCommerce, serta siap terhubung dengan gerbang pembayaran lokal (Midtrans) maupun global."
                                        : "Integrate our light and secure custom-built e-commerce engine, immune to standard WooCommerce security exploits, and ready to hook into local and global payment gateways."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section pricing */}
            <section id="pricing" className="py-12 md:py-18 relative">
                <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {isId ? "Pilih Konfigurasi Investasi Anda" : "Configure Your Investment"}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
                            {isId 
                                ? "Sesuaikan fitur WordPress yang Anda inginkan dan dapatkan perkiraan biaya investasi proyek Anda seketika."
                                : "Choose your desired WordPress add-ons and calculate your project's estimated cost instantly."}
                        </p>
                    </div>

                    <InteractivePricing locale={locale} />
                </div>
            </section>

            {/* Section FAQ */}
            <section className="py-12 md:py-18 bg-zinc-950/40 border-t border-white/5 relative">
                <div className="container mx-auto px-6 max-w-5xl space-y-8 md:space-y-10">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {isId ? "Pertanyaan Umum (FAQ)" : "Frequently Asked Questions"}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
                            {isId 
                                ? "Segala hal yang perlu Anda ketahui mengenai pengerjaan WordPress premium kami."
                                : "Everything you need to know about our premium WordPress delivery process."}
                        </p>
                    </div>

                    <WordPressFAQ locale={locale} />
                </div>
            </section>
        </div>
    );
}
