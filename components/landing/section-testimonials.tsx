import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { AlertCircle, CheckCircle, Lightbulb, Clock, Briefcase } from "lucide-react";

interface CaseStudy {
    title: string;
    industry: string;
    duration: string;
    problem: string;
    solution: string;
    result: string;
}

export async function Testimonials() {
    const t = await getTranslations("Testimonials");
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find((s) => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    const cases = t.raw("cases") as CaseStudy[];

    return (
        <section id="studi-kasus" className="py-20 md:py-28 bg-black overflow-hidden border-y border-white/5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[130px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Case Studies Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {cases.map((cs, idx) => (
                        <div key={idx} className="p-6 md:p-8 rounded-[2.5rem] bg-zinc-900/10 border border-white/5 backdrop-blur-sm hover:border-brand-yellow/20 transition-all duration-500 flex flex-col justify-between h-full relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-yellow/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div>
                                {/* Metadata badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                                        <Briefcase className="w-3 h-3 text-brand-yellow" />
                                        {cs.industry}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                                        <Clock className="w-3 h-3 text-brand-yellow" />
                                        {cs.duration}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-black text-white mb-6 group-hover:text-brand-yellow transition-colors leading-tight tracking-tight">
                                    {cs.title}
                                </h3>

                                {/* Problem - Solution - Result flow */}
                                <div className="space-y-4 pt-2">
                                    {/* Problem */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-red-500 font-extrabold text-xs uppercase tracking-wider">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Masalah
                                        </div>
                                        <p className="text-zinc-400 text-sm leading-relaxed font-light pl-5.5">
                                            {cs.problem}
                                        </p>
                                    </div>

                                    {/* Solution */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
                                            <Lightbulb className="w-3.5 h-3.5" />
                                            Solusi
                                        </div>
                                        <p className="text-zinc-300 text-sm leading-relaxed pl-5.5">
                                            {cs.solution}
                                        </p>
                                    </div>

                                    {/* Result */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Hasil
                                        </div>
                                        <p className="text-zinc-300 text-sm font-semibold leading-relaxed pl-5.5">
                                            {cs.result}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
