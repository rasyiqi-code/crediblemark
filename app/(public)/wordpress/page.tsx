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
        <div className="flex flex-col min-h-screen bg-black overflow-hidden selection:bg-violet-500/30 selection:text-white">
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
            <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center px-4 sm:px-6">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-violet-600/10 blur-[150px]" />
                <div className="absolute top-1/3 left-1/3 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-[120px]" />

                {/* Floating WordPress Logos in Background */}
                <div className="absolute top-1/4 left-[10%] opacity-[0.03] text-violet-500 animate-float-slow pointer-events-none hidden lg:block">
                    <svg viewBox="0 0 24 24" className="w-32 h-32" fill="currentColor">
                        <path d="M12.158 12.786l-2.698 7.84a9.755 9.755 0 005.08-.105l-2.382-7.735zm-.316-1.042l2.23-6.52a9.697 9.697 0 00-3.922 0l2.227 6.52h-0.535zm-2.072 1.042h-.01a9.742 9.742 0 00-.77 4.195c0 1.282.25 2.5.698 3.62L7.332 11.238a9.638 9.638 0 002.438 1.548zm5.556 0c1.077-.478 1.838-1.547 1.838-2.81 0-1.636-1.127-2.842-2.585-2.842-1.072 0-2.146.61-2.146 1.8 0 .937.69 1.573 1.284 2.138.535.508.953.905.953 1.55 0 .48-.22.848-.567 1.066a1.325 1.325 0 01-.676.19c-.538 0-.96-.285-1.32-.61l-.25-.213a9.719 9.719 0 003.468-.863zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.8c-5.955 0-10.8-4.845-10.8-10.8S6.045 1.2 12 1.2 22.8 6.045 22.8 12 17.955 22.8 12 22.8z"/>
                    </svg>
                </div>
                <div className="absolute top-1/3 right-[12%] opacity-[0.02] text-blue-500 animate-float-reverse-slow pointer-events-none hidden lg:block">
                    <svg viewBox="0 0 24 24" className="w-40 h-40" fill="currentColor">
                        <path d="M12.158 12.786l-2.698 7.84a9.755 9.755 0 005.08-.105l-2.382-7.735zm-.316-1.042l2.23-6.52a9.697 9.697 0 00-3.922 0l2.227 6.52h-0.535zm-2.072 1.042h-.01a9.742 9.742 0 00-.77 4.195c0 1.282.25 2.5.698 3.62L7.332 11.238a9.638 9.638 0 002.438 1.548zm5.556 0c1.077-.478 1.838-1.547 1.838-2.81 0-1.636-1.127-2.842-2.585-2.842-1.072 0-2.146.61-2.146 1.8 0 .937.69 1.573 1.284 2.138.535.508.953.905.953 1.55 0 .48-.22.848-.567 1.066a1.325 1.325 0 01-.676.19c-.538 0-.96-.285-1.32-.61l-.25-.213a9.719 9.719 0 003.468-.863zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.8c-5.955 0-10.8-4.845-10.8-10.8S6.045 1.2 12 1.2 22.8 6.045 22.8 12 17.955 22.8 12 22.8z"/>
                    </svg>
                </div>
                <div className="absolute top-1/2 left-[50%] -translate-x-1/2 opacity-[0.03] text-violet-500 animate-float-slow pointer-events-none block lg:hidden">
                    <svg viewBox="0 0 24 24" className="w-24 h-24" fill="currentColor">
                        <path d="M12.158 12.786l-2.698 7.84a9.755 9.755 0 005.08-.105l-2.382-7.735zm-.316-1.042l2.23-6.52a9.697 9.697 0 00-3.922 0l2.227 6.52h-0.535zm-2.072 1.042h-.01a9.742 9.742 0 00-.77 4.195c0 1.282.25 2.5.698 3.62L7.332 11.238a9.638 9.638 0 002.438 1.548zm5.556 0c1.077-.478 1.838-1.547 1.838-2.81 0-1.636-1.127-2.842-2.585-2.842-1.072 0-2.146.61-2.146 1.8 0 .937.69 1.573 1.284 2.138.535.508.953.905.953 1.55 0 .48-.22.848-.567 1.066a1.325 1.325 0 01-.676.19c-.538 0-.96-.285-1.32-.61l-.25-.213a9.719 9.719 0 003.468-.863zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.8c-5.955 0-10.8-4.845-10.8-10.8S6.045 1.2 12 1.2 22.8 6.045 22.8 12 17.955 22.8 12 22.8z"/>
                    </svg>
                </div>

                <div className="container mx-auto max-w-4xl space-y-6 animate-hero-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-400 font-mono tracking-wider uppercase animate-hero-fade-up">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        {isId ? "Kinerja Tinggi • Bebas Bloatware" : "High Performance • Bloat-Free"}
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] animate-hero-fade-up animation-delay-100">
                        {isId ? "Jasa Pembuatan Website " : "Premium Custom "}
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
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
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-12 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-sm"
                        >
                            <span>{isId ? "Lihat Paket & Harga" : "Configure Package"}</span>
                            <ArrowDown className="w-4 h-4 animate-bounce" />
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
            <section className="py-16 bg-zinc-950/20 border-y border-white/5 relative">
                <div className="container mx-auto px-6 max-w-6xl space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {isId ? "Mengapa WordPress Kami Berbeda?" : "Why Our WordPress Sites Excel?"}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
                            {isId 
                                ? "Kami menolak template murah berkode kotor. Kami membuat sistem WordPress berstandar korporat."
                                : "We reject bloated, dirty-coded templates. We build WordPress pages optimized for enterprise standards."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6">
                        {/* Box 1: UI/UX Kustom (Size: 7/12) */}
                        <div className="md:col-span-7 rounded-2xl border border-white/5 bg-zinc-900/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/10 transition-colors group">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-violet-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                                    {isId ? "Desain UI/UX Unik & Kustom" : "Bespoke UI/UX Design"}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Setiap halaman dirancang khusus dari nol menyesuaikan identitas brand Anda. Bebas dari template pasaran, menghasilkan citra digital yang mewah dan eksklusif."
                                        : "Every screen is crafted from scratch to perfectly align with your brand identity. Zero generic templates, ensuring a premium and exclusive digital presence."}
                                </p>
                            </div>
                        </div>

                        {/* Box 2: Kecepatan Laju (Size: 5/12) */}
                        <div className="md:col-span-5 rounded-2xl border border-white/5 bg-zinc-900/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/10 transition-colors group">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                                    {isId ? "Optimasi Kecepatan Ekstrim" : "Extreme Speed Tuning"}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Menggunakan caching layer tingkat lanjut (Redis), server teroptimasi, dan pemotongan aset gambar modern. Jaminan skor Core Web Vitals 90+."
                                        : "Configured with Redis server caching, image optimization, and CDN routing. We guarantee 90+ Core Web Vitals mobile and desktop speed marks."}
                                </p>
                            </div>
                        </div>

                        {/* Box 3: Keamanan (Size: 5/12) */}
                        <div className="md:col-span-5 rounded-2xl border border-white/5 bg-zinc-900/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/10 transition-colors group">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors">
                                    {isId ? "Proteksi Keamanan Berlapis" : "Fortified Security Walls"}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Path login admin dirubah, XML-RPC dinonaktifkan, proteksi brute-force diaktifkan, serta sistem deteksi malware otomatis yang berjalan setiap hari."
                                        : "Admin login paths shifted, XML-RPC deactivated, brute-force filters turned on, and daily automated malware scans set up to guard your website."}
                                </p>
                            </div>
                        </div>

                        {/* Box 4: E-commerce & Toko Online (Size: 7/12) */}
                        <div className="md:col-span-7 rounded-2xl border border-white/5 bg-zinc-900/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/10 transition-colors group">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                    {isId ? "Sistem E-Commerce Kustom" : "Bespoke E-Commerce Engine"}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
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
            <section id="pricing" className="py-20 md:py-32 relative">
                <div className="container mx-auto px-6 max-w-6xl space-y-12">
                    <div className="text-center space-y-4">
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
            <section className="py-20 bg-zinc-950/40 border-t border-white/5 relative">
                <div className="container mx-auto px-6 max-w-5xl space-y-12">
                    <div className="text-center space-y-4">
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
