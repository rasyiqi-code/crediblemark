import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";

interface Benefit {
    title: string;
    desc: string;
}

export async function Comparison() {
    const t = await getTranslations("Comparison");
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    const benefits = t.raw("benefits") as Benefit[];

    return (
        <section id="manfaat" className="py-20 md:py-28 bg-[#EFBF04] relative overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-black/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-14 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter">
                        {t("title", { brand: agencyName })}
                    </h2>
                    <p className="text-base sm:text-lg font-medium text-black/60 tracking-tight leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {benefits.map((benefit, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-black rounded-2xl p-6 border border-white/5 hover:border-brand-yellow/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 flex flex-col gap-4 overflow-hidden"
                        >
                            {/* Nomor urut sebagai aksen */}
                            <div className="w-7 h-7 rounded-full border border-brand-yellow/40 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-brand-yellow leading-none">{String(idx + 1).padStart(2, '0')}</span>
                            </div>

                            {/* Text */}
                            <div className="space-y-1.5">
                                <h3 className="text-base font-black text-white tracking-tight leading-snug">
                                    {benefit.title}
                                </h3>
                                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </div>

                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-yellow group-hover:w-full transition-all duration-700 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
