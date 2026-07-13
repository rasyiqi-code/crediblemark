import React from 'react';
import { getSystemSettings } from "@/lib/server/settings";
import { getPageSeo } from "@/lib/server/seo";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";
import { ResolvingMetadata } from "next";

export async function generateMetadata(
    _props: { params: Promise<Record<string, string>> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const locale = await getLocale();
    const pageSeo = await getPageSeo("/guarantee");

    const isId = locale === 'id';
    const previousImages = (await parent).openGraph?.images || [];
    const ogImages = pageSeo?.ogImage ? [{ url: pageSeo.ogImage }] : previousImages;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const alternates = {
        canonical: `${baseUrl}/${locale}/guarantee`,
        languages: {
            'en': `${baseUrl}/en/guarantee`,
            'id': `${baseUrl}/id/guarantee`,
            'x-default': `${baseUrl}/en/guarantee`,
        }
    };

    if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
        return {
            title: isId ? "Ketentuan Garansi" : "Guarantee Terms",
            openGraph: {
                title: isId ? "Ketentuan Garansi" : "Guarantee Terms",
                images: ogImages,
                type: "website",
                locale: isId ? 'id_ID' : 'en_US',
                alternateLocale: isId ? ['en_US'] : ['id_ID'],
            },
            twitter: {
                card: "summary_large_image",
                title: isId ? "Ketentuan Garansi" : "Guarantee Terms",
                images: ogImages,
            },
            alternates
        };
    }

    const title = (isId ? pageSeo.title_id : null) || pageSeo.title || (isId ? "Ketentuan Garansi" : "Guarantee Terms");
    const description = (isId ? pageSeo.description_id : null) || pageSeo.description || undefined;
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

export default async function GuaranteePage() {
    const locale = await getLocale();
    const isId = locale === 'id';

    const settings = await getSystemSettings(["AGENCY_NAME", "COMPANY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const companyName = settings.find(s => s.key === "COMPANY_NAME")?.value || "Crediblemark";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 p-8 md:p-24 font-sans leading-relaxed">
            <div className="max-w-4xl mx-auto space-y-12">
                {isId ? (
                    <>
                        <header className="space-y-4 border-b border-white/10 pb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Ketentuan Garansi</h1>
                            <p className="text-zinc-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </header>

                        <div className="space-y-8 text-base md:text-lg">
                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">1. Perlindungan Fase Awal</h2>
                                <p>
                                    Setelah sesi briefing dan penyusunan blueprint awal diselesaikan, Anda dapat menilai apakah pendekatan dan rencana solusi digital dari <strong className="text-white">{agencyName}</strong> sesuai dengan kebutuhan bisnis Anda. Jika Anda merasa pendekatan tersebut tidak sesuai dan pekerjaan pengembangan (development) sistem belum dimulai, Anda dapat mengajukan pembatalan proyek dan deposit Anda akan dikembalikan secara penuh sesuai ketentuan yang disepakati.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">2. Garansi Bug (90 Hari)</h2>
                                <p>
                                    Kami memberikan garansi perbaikan bug selama 90 (sembilan puluh) hari kalender terhitung sejak sistem diserahkan dan dinyatakan siap digunakan (handover). Garansi ini mencakup perbaikan atas ketidaksesuaian fungsi sistem dari dokumen ruang lingkup proyek yang telah disepakati sebelumnya.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">3. Batasan dan Pengecualian</h2>
                                <p>
                                    Garansi yang diberikan oleh <strong className="text-white">{agencyName}</strong> tidak mencakup hal-hal berikut:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                                    <li>Biaya-biaya pihak ketiga seperti domain, hosting, server, lisensi API, plugin berbayar, atau layanan pihak ketiga lainnya yang telah dibeli atas persetujuan klien.</li>
                                    <li>Kerusakan atau kegagalan sistem yang disebabkan oleh modifikasi kode sumber (source code) yang dilakukan oleh pihak lain di luar tim <strong className="text-white">{agencyName}</strong>.</li>
                                    <li>Gangguan layanan yang disebabkan oleh kelalaian manajemen server pihak klien, downtime penyedia cloud/hosting, atau masalah infrastruktur eksternal lainnya.</li>
                                    <li>Perubahan kebutuhan baru (change request) yang tidak tercantum dalam dokumen ruang lingkup proyek awal.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">4. Prosedur Klaim</h2>
                                <p>
                                    Untuk mengajukan klaim garansi bug atau pembatalan di fase awal, Anda dapat mengirimkan permintaan tertulis secara langsung kepada kontak representatif kami atau melalui portal klien dengan menyertakan bukti/detail kendala yang ditemukan. Tim kami akan segera meninjau dan menyelesaikan perbaikan dalam jangka waktu yang wajar.
                                </p>
                            </section>
                        </div>
                    </>
                ) : (
                    <>
                        <header className="space-y-4 border-b border-white/10 pb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Guarantee Terms</h1>
                            <p className="text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </header>

                        <div className="space-y-8 text-base md:text-lg">
                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">1. Early Phase Protection</h2>
                                <p>
                                    After the briefing session and initial blueprint formulation are completed, you can evaluate whether the approach and digital solution plan from <strong className="text-white">{agencyName}</strong> align with your business needs. If you find the approach unsuitable and system development work has not yet started, you may request a project cancellation and your deposit will be refunded in full in accordance with the agreed terms.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">2. Bug Guarantee (90 Days)</h2>
                                <p>
                                    We provide a bug fixing guarantee for 90 (ninety) calendar days starting from the date the system is handed over and declared ready for use. This guarantee covers the repair of system malfunctions or non-conformity with the project scope document previously agreed upon.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">3. Limitations and Exclusions</h2>
                                <p>
                                    The guarantee provided by <strong className="text-white">{agencyName}</strong> does not cover the following:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                                    <li>Third-party costs such as domain, hosting, server, API licenses, paid plugins, or other third-party services purchased with the client&apos;s consent.</li>
                                    <li>System damage or failure caused by modifications to the source code made by parties other than the <strong className="text-white">{agencyName}</strong> team.</li>
                                    <li>Service interruptions caused by server management negligence on the client side, cloud/hosting provider downtime, or other external infrastructure issues.</li>
                                    <li>New feature additions or scope changes (change requests) not listed in the initial project scope document.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-bold text-white">4. Claim Procedure</h2>
                                <p>
                                    To submit an early phase cancellation or bug guarantee claim, you can send a written request directly to our representative contact or through the client portal with details of the issue found. Our team will review and address the issue within a reasonable timeframe.
                                </p>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
