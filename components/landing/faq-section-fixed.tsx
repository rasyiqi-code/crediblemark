"use client";

import React, { memo } from "react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslations, useMessages } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useFloatingChat } from "@/lib/store/floating-chat-store";


export function FAQSection() {
    const messages = useMessages();
    const faqData = (messages as Record<string, unknown>)?.FAQ || {};
    const t = useTranslations("FAQ");
    const { setIsMenuOpen } = useFloatingChat();

    // Hanya tampilkan q1 sampai q8
    const questionKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

    return (
        <section className="py-16 md:py-24 bg-[#EFBF04] relative">
            {/* Pola background mesh/crosshatch */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
                    style={{
                        backgroundImage: `linear-gradient(45deg, #000 0.5px, transparent 0.5px), linear-gradient(-45deg, #000 0.5px, transparent 0.5px)`,
                        backgroundSize: '24px 24px'
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
                {/* Heading Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-10 md:mb-16 flex flex-col items-center text-center"
                >
                    <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight leading-snug mb-3">
                        {t("title")}
                    </h2>
                    <p className="text-black/60 font-medium text-sm leading-relaxed max-w-xl mx-auto">
                        {t("subtitle")}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12 items-stretch w-full">
                    {/* FAQ Items - 8 Columns */}
                    <div className="md:col-span-8">
                        <Accordion type="single" collapsible className="w-full text-black">
                            {questionKeys.map((key, index) => (
                                <FAQItem 
                                    key={key} 
                                    questionKey={key} 
                                    index={index} 
                                />
                            ))}
                        </Accordion>
                    </div>

                    {/* CTA Card - 4 Columns */}
                    <div 
                        onClick={() => setIsMenuOpen(true)}
                        className="md:col-span-4 md:sticky md:top-32 self-start z-30 w-full order-2 mt-8 md:mt-0 cursor-pointer block p-6 md:p-8 rounded-[1.5rem] bg-black text-white flex flex-col items-center text-center shadow-2xl relative overflow-hidden group border border-white/5 transition-all duration-300 hover:border-brand-yellow/30"
                    >

                        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-yellow flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(254,215,0,0.2)] group-hover:scale-110 transition-transform duration-500">
                            <Compass className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </div>

                        <h3 className="text-lg md:text-xl font-black mb-4 tracking-tighter leading-tight italic uppercase">
                            MASALAHNYA TERASA.<br />SOLUSINYA BELUM JELAS?
                        </h3>

                        <p className="text-zinc-400 font-medium mb-8 leading-relaxed text-[11px] md:text-sm">
                            Ceritakan proses yang ingin diperbaiki. Crediblemark akan membantu memetakan masalah, menentukan prioritas, dan menilai solusi digital yang paling relevan.
                        </p>

                        <Button
                            className="w-full h-11 md:h-12 rounded-full bg-brand-yellow hover:bg-white text-black transition-all duration-300 font-black uppercase tracking-tighter flex items-center justify-center gap-2 group/btn text-[10px] md:text-xs pointer-events-none"
                        >
                            Jadwalkan Diskusi Awal
                            <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                        </Button>

                        <p className="mt-4 text-[10px] text-zinc-600">
                            30 menit &bull; Online &bull; Tanpa kewajiban memulai proyek
                        </p>
                    </div>

                </div>

                {/* FAQ Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": questionKeys.map((key) => {
                                const i = key.substring(1);
                                return {
                                    "@type": "Question",
                                    "name": t(key),
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": (t.raw("a" + i) as string).replace(/<\/?[^>]+(>|$)/g, "")
                                    }
                                };
                            })
                        })
                    }}
                />
            </div>
        </section>
    );
}

interface FAQItemProps {
    questionKey: string;
    index: number;
}

const FAQItem = memo(function FAQItem({ questionKey, index }: FAQItemProps) {
    const t = useTranslations("FAQ");
    const i = questionKey.substring(1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
        >
            <AccordionItem 
                value={`item-${i}`} 
                className="border-b border-black/5 bg-transparent px-1 transition-all duration-300 hover:bg-black/5"
            >
                <AccordionTrigger className="hover:no-underline text-left font-bold tracking-tight text-sm md:text-base py-3 [&>svg]:text-black/30 [&>svg]:w-4 [&>svg]:h-4 group">
                    <div className="flex items-center gap-3">
                        <span>{t(questionKey)}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="text-black/60 font-medium leading-relaxed text-xs md:text-sm pb-4 pt-0">
                    {t.rich(`a${i}`, {
                        strong: (chunks) => <strong className="text-black font-bold">{chunks}</strong>
                    })}
                </AccordionContent>
            </AccordionItem>
        </motion.div>
    );
});
