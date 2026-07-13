import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";

/**
 * Section PROYEK PILIHAN — versi sederhana.
 * Hanya menampilkan heading dan CTA yang mengarahkan ke halaman portofolio.
 */
export async function Testimonials() {
    const locale = await getLocale();

    return (
        <section id="studi-kasus" className="py-20 md:py-28 bg-black overflow-hidden border-y border-white/5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[130px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                {/* Badge */}
                <span className="text-[10px] font-black tracking-widest text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-3.5 py-1 mb-6 uppercase inline-block">
                    PROYEK PILIHAN
                </span>

                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
                    Sistem yang Telah Dibangun
                    <span className="text-brand-yellow"> Crediblemark</span>
                </h2>
                <p className="text-zinc-400 text-base md:text-lg font-light mb-10 max-w-xl mx-auto">
                    Lihat kumpulan proyek nyata dari repositori GitHub dan portofolio aktif yang pernah dikerjakan.
                </p>

                {/* CTA ke halaman Portfolio */}
                <Link
                    href={`/${locale}/portfolio`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-black rounded-full text-sm shadow-lg shadow-brand-yellow/20 transition-all hover:scale-105 active:scale-95 group"
                >
                    Lihat Semua Proyek
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </section>
    );
}
