import { getTranslations } from "next-intl/server";
import { Palette, FileText, Server } from "lucide-react";

export async function PartnersSection() {
    const t = await getTranslations("Partners");

    const partners = [
        {
            icon: Palette,
            title: "Desainer UI/UX & Brand",
            desc: "Menangani estetika visual, tata letak antarmuka, dan branding visual khusus bila dibutuhkan."
        },
        {
            icon: FileText,
            title: "Penulis Konten & Copywriter",
            desc: "Menyusun salinan teks copywriting produk, artikel insight, dan dokumentasi sistem bisnis."
        },
        {
            icon: Server,
            title: "Infrastruktur & Cloud Engineer",
            desc: "Membantu deployment server berskala besar, konfigurasi multi-region cloud, dan penalaan performa."
        }
    ];

    return (
        <section id="mitra-spesialis" className="py-20 bg-zinc-950/80 overflow-hidden border-b border-white/5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-tight italic">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto">
                        {t("desc")}
                    </p>
                </div>

                {/* Partners Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {partners.map((partner, idx) => (
                        <div key={idx} className="p-6 rounded-[2rem] bg-zinc-900/10 border border-white/5 backdrop-blur-sm flex flex-col items-center text-center group hover:border-white/10 transition-all duration-500">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                <partner.icon className="w-5 h-5 text-brand-yellow" />
                            </div>
                            <h3 className="text-base font-extrabold text-white mb-2 tracking-tight">{partner.title}</h3>
                            <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed">{partner.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
