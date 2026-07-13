import { Check, Sparkles } from "lucide-react";
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
        <section id="manfaat" className="py-20 md:py-28 bg-brand-yellow relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Ambient shadow/blur for depth */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-black/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter">
                        {t("title", { brand: agencyName })}
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl font-medium text-black/60 tracking-tight leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Benefits 3 Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="p-6 md:p-8 rounded-[2rem] border border-black/10 bg-white shadow-xl transform hover:scale-[1.01] transition-all duration-500 flex flex-col items-start gap-4">
                            {/* Icon Circle */}
                            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-5 h-5 text-black" strokeWidth={3} />
                            </div>
                            
                            {/* Text Info */}
                            <div className="space-y-2">
                                <h3 className="text-lg md:text-xl font-black text-black tracking-tight leading-snug">
                                    {benefit.title}
                                </h3>
                                <p className="text-zinc-600 text-sm md:text-base font-medium leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
