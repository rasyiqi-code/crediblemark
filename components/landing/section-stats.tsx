"use client";

import { useTranslations } from "next-intl";
import { User, FileText, ShieldCheck, Wrench } from "lucide-react";

export function SectionStats() {
    const t = useTranslations("Stats");

    const stats = [
        {
            key: "founder",
            icon: User,
        },
        {
            key: "scope",
            icon: FileText,
        },
        {
            key: "ownership",
            icon: ShieldCheck,
        },
        {
            key: "warranty",
            icon: Wrench,
        },
    ];

    return (
        <section className="py-6 md:py-10 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
            {/* Background Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-brand-yellow/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-2 md:gap-8 divide-zinc-800 lg:divide-x">
                    {stats.map((stat, idx) => (
                        <div key={stat.key} className="flex flex-col items-center justify-center px-2 md:px-4 text-center group">
                            <div className="mb-3">
                                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-zinc-500 group-hover:text-brand-yellow transition-colors duration-300" />
                            </div>
                            <h2 className="text-sm md:text-lg font-black text-white mb-1.5 md:mb-2 tracking-tight text-balance group-hover:text-brand-yellow transition-colors leading-snug">
                                {t(`${stat.key}.title`)}
                            </h2>
                            <p className="text-zinc-400 text-[10px] md:text-xs font-semibold leading-relaxed max-w-[200px] mx-auto text-balance">
                                {t(`${stat.key}.desc`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
