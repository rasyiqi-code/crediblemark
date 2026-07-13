import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { AlertCircle, Lightbulb, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseStudy {
    title: string;
    problem: string;
    solution: string;
    role: string;
}

export async function Testimonials() {
    const t = await getTranslations("Testimonials");
    const settings = await getSystemSettings(["CONTACT_PHONE"]);
    const contactPhone = settings.find((s) => s.key === "CONTACT_PHONE")?.value;
    const phoneNo = contactPhone ? contactPhone.replace(/[^0-9]/g, '') : "";

    const cases = t.raw("cases") as CaseStudy[];

    return (
        <section id="studi-kasus" className="py-20 md:py-28 bg-black overflow-hidden border-y border-white/5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[130px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[10px] font-black tracking-widest text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-3.5 py-1 mb-4 uppercase inline-block">
                        {t("badge", { defaultValue: "PROYEK PILIHAN" })}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight pt-2">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Case Studies Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {cases.map((cs, idx) => {
                        const waUrl = phoneNo ? `https://wa.me/${phoneNo}?text=Halo%20Crediblemark%2C%20saya%20tertarik%20mendiskusikan%20studi%20kasus%20proyek%20%3A%20${encodeURIComponent(cs.title)}` : "#";
                        
                        return (
                            <div key={idx} className="p-6 md:p-8 rounded-[2.5rem] bg-zinc-900/10 border border-white/5 backdrop-blur-sm hover:border-brand-yellow/20 transition-all duration-500 flex flex-col justify-between h-full relative group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-yellow/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="space-y-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        {/* Title */}
                                        <h3 className="text-2xl font-black text-white mb-6 group-hover:text-brand-yellow transition-colors leading-tight tracking-tight">
                                            {cs.title}
                                        </h3>

                                        {/* Problem - Solution - Role flow */}
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

                                            {/* Role */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-brand-yellow font-extrabold text-xs uppercase tracking-wider">
                                                    <User className="w-3.5 h-3.5" />
                                                    Peran Crediblemark
                                                </div>
                                                <p className="text-zinc-300 text-sm font-semibold leading-relaxed pl-5.5">
                                                    {cs.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action button */}
                                    <div className="pt-6 w-full">
                                        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                            <Button className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-brand-yellow text-white hover:text-black border border-white/10 hover:border-brand-yellow transition-all duration-500 font-black uppercase tracking-tighter text-xs flex items-center justify-center gap-2 group/btn">
                                                Lihat Studi Kasus
                                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
