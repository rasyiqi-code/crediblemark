import { FileCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { Button } from "@/components/ui/button";
import { CtaChatButton } from "./cta-chat-button";

export async function DigitalSystemAudit() {
    const t = await getTranslations("Audit");
    const settings = await getSystemSettings(["CONTACT_PHONE"]);
    const contactPhone = settings.find(s => s.key === "CONTACT_PHONE")?.value;
    const waUrl = contactPhone ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Halo%20Crediblemark%2C%20saya%20tertarik%20dengan%20Digital%20System%20Audit` : "#";

    const blueprintItems = t.raw("blueprintItems") as string[];

    return (
        <section id="system-audit" className="py-20 md:py-28 bg-zinc-950 text-white relative overflow-hidden border-b border-white/5">
            <div className="absolute top-1/4 right-0 w-80 h-80 bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">
                    
                    {/* Left: Content Info */}
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black tracking-widest text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-3.5 py-1 mb-4 uppercase">
                                DIGITAL SYSTEM AUDIT
                            </span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight pt-2">
                                {t("title")}
                            </h2>
                            <h3 className="text-lg md:text-2xl font-bold text-zinc-400">
                                {t("subtitle")}
                            </h3>
                        </div>

                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                            {t("desc")}
                        </p>

                        <p className="text-zinc-500 text-xs md:text-sm italic leading-relaxed max-w-xl mx-auto lg:mx-0">
                            * {t("note")}
                        </p>

                        <div className="pt-6 flex justify-center lg:justify-start">
                            <CtaChatButton className="h-14 px-8 rounded-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-extrabold shadow-lg shadow-brand-yellow/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group border-0">
                                {t("cta")}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </CtaChatButton>
                        </div>
                    </div>

                    {/* Right: Blueprint Box Card */}
                    <div className="w-full lg:w-[52%] shrink-0">
                        <div className="p-8 md:p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-yellow/10 to-transparent blur-2xl rounded-full" />
                            
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center">
                                    <FileCheck className="w-5 h-5 text-brand-yellow" />
                                </div>
                                <h4 className="text-lg font-extrabold text-white tracking-tight uppercase">{t("blueprintTitle")}</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {blueprintItems.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4.5 h-4.5 text-brand-yellow shrink-0 mt-0.5" />
                                        <span className="text-zinc-300 text-xs md:text-sm font-semibold leading-snug">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
