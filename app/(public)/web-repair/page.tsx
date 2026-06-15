import { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import { getPageSeo } from "@/lib/server/seo";
import { getSystemSettings } from "@/lib/server/settings";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { InteractivePricingRepair } from "./components/interactive-pricing-repair";
import { RepairFAQ } from "./components/repair-faq";
import { ShieldAlert, Zap, Sparkles, Code, ArrowDown, GitBranch } from "lucide-react";

export const revalidate = 3600; // Cache halaman selama 1 jam (ISR)

export async function generateMetadata(
    _props: unknown,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    const isId = locale === 'id';
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    
    // Ambil data SEO khusus dari database
    const pageSeo = await getPageSeo("/web-repair");

    const defaultTitle = isId 
        ? `Jasa Perbaikan Website Hasil Pembelian Pihak Ketiga | ${brand}`
        : `Fix Your Outsourced Website & Code Rescue | ${brand}`;
    const defaultDesc = isId 
        ? "Jasa perbaikan website lambat, penuh bug, dan berantakan akibat pengerjaan murah atau vibecoding oleh pihak ketiga. Refactoring kode menjadi clean-code standar industri."
        : "Rescue slow, buggy, or unmaintainable websites delivered by low-cost providers. We refactor spaghetti code into high-performance, modular systems.";

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
            canonical: `${baseUrl}/${locale}/web-repair`,
            languages: {
                'en': `${baseUrl}/en/web-repair`,
                'id': `${baseUrl}/id/web-repair`,
                'x-default': `${baseUrl}/en/web-repair`,
            }
        }
    };
}

export default async function WebRepairLandingPage() {
    const locale = await getLocale();
    const isId = locale === 'id';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Mengambil data nama agensi dari pengaturan sistem
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const brand = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <div className="flex flex-col min-h-screen bg-black overflow-hidden bg-grid-travel selection:bg-amber-500/30 selection:text-white relative">
            <BreadcrumbSchema
                items={[
                    { name: isId ? 'Beranda' : 'Home', item: `${baseUrl}/${locale}` },
                    { name: isId ? 'Perbaikan Website' : 'Web Repair', item: `${baseUrl}/${locale}/web-repair` },
                ]}
            />

            {/* Skema JSON-LD untuk Layanan Perbaikan Website */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "serviceType": isId ? "Jasa Perbaikan Website & Refactoring" : "Web Repair & Refactoring Service",
                        "name": isId ? "Vibecoding Code Rescue" : "Vibecoding Code Rescue",
                        "description": isId
                            ? "Jasa diagnosis, perbaikan bug, audit keamanan, dan refactoring kode AI/spaghetti menjadi clean-code modular."
                            : "Diagnostics, bug fixing, security audits, and clean-code modular refactoring for messy AI/spaghetti code.",
                        "provider": {
                            "@type": "Organization",
                            "name": brand,
                            "url": baseUrl
                        },
                        "areaServed": "Worldwide",
                        "offers": {
                            "@type": "Offer",
                            "price": "1500000",
                            "priceCurrency": "IDR",
                            "url": `${baseUrl}/${locale}/web-repair`
                        }
                    })
                }}
            />

            {/* Hero Section */}
            <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 flex flex-col items-center text-center px-4 sm:px-6">
                {/* Background Glows Cyberpunk (Merah & Jingga Neon) */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-[150px] animate-nebula-slow" />
                <div className="absolute top-1/3 left-1/3 -z-10 h-96 w-96 rounded-full bg-amber-600/5 blur-[120px] animate-nebula-reverse" />

                <div className="container mx-auto max-w-4xl space-y-6 animate-hero-fade-in relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-500 font-mono tracking-wider uppercase">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        {isId ? "Vibecoding Rescue • Code Cleanup" : "Vibecoding Rescue • Code Cleanup"}
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
                        {isId ? "Website dari Vendor Lama " : "Outsourced Web "}
                        <span className="bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent animate-pulse-glow block sm:inline">
                            {isId ? "Penuh Bug & Lambat?" : "Broken & Slow?"}
                        </span>
                        <span className="block mt-2 text-3xl sm:text-5xl md:text-6xl font-extrabold text-zinc-300">
                            {isId ? "Biar Kami Rescue Total." : "We Rescue It."}
                        </span>
                    </h1>

                    <p className="text-zinc-400 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        {isId
                            ? "Banyak penyedia jasa pembuatan website murah sekadar melakukan 'vibecoding' (memakai AI secara asal-asalan tanpa paham arsitektur dasar). Kami mengaudit seluruh sistem, merapikan kode spaghetti tersebut, dan memulihkan performa optimal website Anda."
                            : "Many low-cost agencies and freelancers use AI tools blindly without proper architecture, leaving you with a buggy, unscalable site. We audit the system, clean up the spaghetti code, and restore your system's peak performance."}
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#pricing"
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-sm"
                        >
                            <span>{isId ? "Tinjau Paket & Harga" : "View Tiers & Prices"}</span>
                            <ArrowDown className="w-4 h-4 animate-bounce text-black" />
                        </a>
                        <a
                            href={`/${locale}/contact?subject=Web%20Repair%20Inquiry`}
                            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold h-12 px-8 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer w-full sm:w-auto text-sm"
                        >
                            {isId ? "Konsultasikan Masalah" : "Describe Your Issue"}
                        </a>
                    </div>
                </div>
            </section>

            {/* Bento Grid: Keunggulan Layanan Perbaikan */}
            <section className="py-10 md:py-14 bg-zinc-950/20 border-y border-white/5 relative">
                <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {isId ? "Solusi untuk Masalah Kode Anda" : "What We Rescue Your System From?"}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
                            {isId 
                                ? "Jangan biarkan kode berantakan menghambat pertumbuhan bisnis. Kami bereskan semuanya."
                                : "Don't let messy code stall your sales and conversions. We sanitize your codebase."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-3 md:gap-5">
                        {/* Box 1: Code Refactoring (7/12) */}
                        <div className="md:col-span-7 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Code className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 group-hover:scale-125 transition-transform" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-amber-500 transition-colors sm:mt-4">
                                        {isId ? "Refactoring Kode Hasil Jasa Pihak Ketiga" : "Outsourced Code Refactoring"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Kami menyusun ulang kode 'spaghetti' buatan pihak ketiga menjadi modular, terstruktur, dan DRY (Don't Repeat Yourself). Menghilangkan ketergantungan buruk pada vendor lama dan membuat website Anda kembali mudah dikembangkan."
                                        : "We restructure poorly written, messy code delivered by cheap agencies or freelancers. We make it clean, modular, and DRY, freeing your business from developer lock-in."}
                                </p>
                            </div>
                        </div>

                        {/* Box 2: Speed Optimization (5/12) */}
                        <div className="md:col-span-5 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-125 transition-transform" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors sm:mt-4">
                                        {isId ? "Optimasi Speed & Asset" : "Extreme Performance Rescue"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Mengurangi LCP (Largest Contentful Paint) dan responsivitas input (INP). Kami menghapus skrip tak terpakai yang menumpuk, mengoptimalkan query database lambat, dan memvalidasi loop logika agar tidak memakan memori CPU server."
                                        : "Tuning Core Web Vitals (LCP/INP). We sweep away bloated client scripts, resolve database connection leaks, and optimize logic loops to slash server load times."}
                                </p>
                            </div>
                        </div>

                        {/* Box 3: Security Hardening (5/12) */}
                        <div className="md:col-span-5 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-red-300 transition-colors sm:mt-4">
                                        {isId ? "Audit & Proteksi Keamanan" : "Security Vulnerability Patches"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "AI sering melupakan otentikasi yang aman atau menulis kode rentan eksploitasi (XSS, SQL Injection). Kami menutup celah keamanan tersebut, memperbarui library out-of-date, dan menetapkan konfigurasi CORS yang aman."
                                        : "AI engines often write unsafe queries or leak routes. We fix severe vulnerabilities (SQLi, XSS, CSRF), upgrade outdated dependencies, and secure CORS rules."}
                                </p>
                            </div>
                        </div>

                        {/* Box 4: CI/CD & Modern Tooling (7/12) */}
                        <div className="md:col-span-7 rounded-2xl border border-white/5 bg-zinc-900 p-4 sm:p-6 flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="space-y-2.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:block">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-125 transition-transform" />
                                    </div>
                                    <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors sm:mt-4">
                                        {isId ? "Pipa CI/CD & Proteksi Masa Depan" : "Standard Testing & CI/CD Pipelines"}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                    {isId
                                        ? "Agar masalah kode rusak tidak berulang di kemudian hari, kami membangun sistem build otomatis (GitHub Actions) terintegrasi dengan ESLint, TypeScript, dan unit testing sederhana. Setiap kode baru yang didorong (push) akan tervalidasi secara ketat secara otomatis sebelum rilis ke produksi."
                                        : "Prevent future code breakages by establishing rigid build pipelines. We integrate GitHub Actions, ESLint hooks, and automated tests that vet new code before it hits production."}
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
                            {isId ? "Sesuaikan Anggaran Perbaikan Anda" : "Configure Your Repair Budget"}
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
                            {isId 
                                ? "Pilih tingkat penanganan kode dan add-on yang dibutuhkan. Dapatkan estimasi investasi seketika."
                                : "Choose your desired service tier and optional add-ons to calculate your cost instantly."}
                        </p>
                    </div>

                    <InteractivePricingRepair locale={locale} />
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
                                ? "Hal-hal penting seputar proses audit, NDA, dan jaminan kualitas perbaikan kami."
                                : "Important details regarding our audit process, NDA, and warranty terms."}
                        </p>
                    </div>

                    <RepairFAQ locale={locale} />
                </div>
            </section>
        </div>
    );
}
