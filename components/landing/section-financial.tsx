import { X, Check, AlertCircle, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { Button } from "@/components/ui/button";
import { ScrollHint } from "./scroll-hint";

export async function FinancialLogic() {
    const t = await getTranslations("Financial");
    const settings = await getSystemSettings(["AGENCY_NAME", "CONTACT_PHONE"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const contactPhone = settings.find(s => s.key === "CONTACT_PHONE")?.value;
    const waUrl = contactPhone ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Halo%20Crediblemark%2C%20saya%20tertarik%20mendiskusikan%20masalah%20operasional%20bisnis%20saya` : "#";

    // 6 masalah & 6 hasil
    const problems = t.raw("problems") as string[];
    const results = t.raw("results") as string[];

    return (
        <section id="masalah-klien" className="py-24 bg-brand-yellow relative overflow-hidden">
            {/* Pola background matrix dots */}
            <div className="absolute inset-0 z-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Ambient blur */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-black/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-black/5 blur-[120px] rounded-full" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 relative flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-widest text-black/60 bg-black/5 border border-black/10 rounded-full px-3.5 py-1.5 mb-6 uppercase inline-block">
                        {t("badge", { defaultValue: "KENALI MASALAHNYA" })}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4 tracking-tighter leading-[1.1]">
                        {t("title")}
                    </h2>
                    <p className="text-black/80 font-bold text-base md:text-lg max-w-2xl mx-auto text-balance">
                        {t("subtitle")}
                    </p>
                </div>

                <ScrollHint variant="inverted" className="gap-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch lg:max-w-5xl lg:mx-auto lg:overflow-visible lg:pb-0 px-6 md:px-0">

                    {/* Card A: Masalah Saat Ini */}
                    <div className="relative group flex-shrink-0 w-[82vw] md:w-[450px] lg:w-full snap-center">
                        <div className="h-full bg-white border border-black/15 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden transition-all duration-500 hover:scale-[1.01] shadow-2xl">
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4 border-b border-black/5 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-black tracking-tight">{t("problemsTitle")}</h3>
                                </div>

                                <div className="space-y-0.5">
                                    {problems.map((prob, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group/item min-h-[48px] py-2 border-b border-black/5 last:border-0">
                                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <X className="w-3 h-3 text-red-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-zinc-800 text-xs sm:text-sm md:text-base font-semibold leading-[1.3] flex-1">{prob}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card B: Hasil Dengan Sistem Crediblemark */}
                    <div className="relative group flex-shrink-0 w-[82vw] md:w-[450px] lg:w-full snap-center">
                        <div className="h-full bg-black border border-white/10 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-2xl ring-1 ring-white/5">
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-brand-yellow" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-white tracking-tight">{t("resultsTitle")}</h3>
                                </div>

                                <div className="space-y-0.5">
                                    {results.map((res, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group/item min-h-[48px] py-2 border-b border-white/5 last:border-0">
                                            <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-yellow/20">
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                            <span className="text-zinc-300 text-xs sm:text-sm md:text-base font-semibold leading-[1.3] flex-1">{res}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </ScrollHint>

                {/* CTA Button di bawah */}
                <div className="mt-12 flex justify-center">
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="h-14 px-8 rounded-full bg-black hover:bg-zinc-900 text-brand-yellow font-extrabold tracking-tight shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/5 flex items-center gap-2 group">
                            {t("cta")}
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
}
