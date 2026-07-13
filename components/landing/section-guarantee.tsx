import { ShieldCheck } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import Link from "next/link";

export async function SectionGuarantee() {
    const locale = await getLocale();
    const t = await getTranslations("Guarantee");
    const settings = await getSystemSettings(["CONTACT_PHONE"]);
    const contactPhone = settings.find(s => s.key === "CONTACT_PHONE")?.value;
    const waUrl = contactPhone ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Halo%20Crediblemark%2C%20boleh%20saya%20tahu%20ketentuan%20garansi%20perlindungan%20fase%20awal%3F` : "#";

    return (
        <section className="py-20 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mx-auto">
                        <ShieldCheck className="w-4 h-4 text-brand-yellow" />
                        <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">
                            {t("badge")}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-4xl font-black text-brand-yellow tracking-tight leading-tight uppercase pt-2">
                        {t("title")}
                    </h2>

                    {/* Description */}
                    <p className="text-zinc-400 leading-relaxed text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light">
                        {t("desc")}
                    </p>

                    {/* Note */}
                    <p className="text-zinc-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
                        * {t("note")}
                    </p>

                    {/* Link Terms */}
                    <div className="pt-4">
                        <ChatTrigger 
                            className="text-xs sm:text-sm font-bold text-brand-yellow hover:text-brand-yellow/80 underline decoration-brand-yellow/30 underline-offset-4 transition-all"
                        >
                            {t("cta")}
                        </ChatTrigger>
                    </div>
                </div>
            </div>
        </section>
    );
}
