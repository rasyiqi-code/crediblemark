import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { Linkedin, MessageSquare, Terminal, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export async function TeamSection() {
    const t = await getTranslations("Founder");
    const settings = await getSystemSettings(["CONTACT_PHONE"]);
    const contactPhone = settings.find((s) => s.key === "CONTACT_PHONE")?.value;
    const waUrl = contactPhone ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Halo%20Rasyiqi%2C%20saya%20ingin%20berdiskusi%20mengenai%20proyek%20sistem%20digital` : "#";

    const competences = t.raw("competences") as string[];

    return (
        <section id="founder-profile" className="py-20 md:py-28 bg-black overflow-hidden border-b border-white/5 relative">
            {/* Background elements */}
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[10px] font-black tracking-widest text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-3.5 py-1 mb-4 uppercase inline-block">
                        {t("badge")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight pt-2">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Founder Premium Layout Card */}
                <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-zinc-900/10 border border-white/5 p-8 md:p-12 backdrop-blur-sm relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-yellow/10 to-transparent blur-2xl rounded-full" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
                        {/* Left Column: Photo & Capacity info */}
                        <div className="md:col-span-4 flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-zinc-950 border border-white/10 p-1 mb-6 relative overflow-hidden shadow-2xl">
                                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                                    <Image 
                                        src="/avatars/avatar-1.svg" 
                                        alt={t("name")}
                                        fill
                                        className="object-cover scale-110"
                                        sizes="128px"
                                    />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-1">{t("name")}</h3>
                            <p className="text-brand-yellow text-xs font-bold uppercase tracking-wider mb-6 text-center leading-relaxed">
                                {t("role")}
                            </p>

                            <div className="my-1 border-t border-white/5 w-full" />

                            <div className="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/5 text-[11px] text-zinc-400 font-semibold leading-relaxed">
                                <div className="flex items-center gap-1.5 justify-center text-brand-yellow font-black uppercase tracking-wider text-[9px] mb-1.5">
                                    <Terminal className="w-3.5 h-3.5" />
                                    Kapasitas Terbatas
                                </div>
                                {t("capacity")}
                            </div>
                        </div>

                        {/* Right Column: Description & Competences */}
                        <div className="md:col-span-8 space-y-6">
                            <div className="space-y-4">
                                <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-light">
                                    {t("description")}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">
                                    {t("competenceTitle")}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {competences.map((comp, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                                            <span className="text-zinc-300 text-xs md:text-sm font-semibold">{comp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
                                    <Button className="h-14 px-8 rounded-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-extrabold shadow-lg shadow-brand-yellow/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-0 w-full sm:w-auto">
                                        <MessageSquare className="w-4 h-4" />
                                        {t("cta")}
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
