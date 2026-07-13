"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { ScrollHint } from "./scroll-hint";

export function SectionSolutions() {
    const t = useTranslations("Solutions");
    const locale = useLocale();
    const [globalTargetIndex, setGlobalTargetIndex] = useState(0);

    useEffect(() => {
        // Interval global 2.5 detik untuk memutar teks layanan terkait
        const interval = setInterval(() => {
            setGlobalTargetIndex((prev) => prev + 1);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const products = [
        { 
            key: "web", 
            icon: Zap, 
            color: "text-blue-400",
            glow: "from-blue-500/20",
            border: "hover:border-blue-500/30"
        },
        { 
            key: "app", 
            icon: Layers, 
            color: "text-purple-400",
            glow: "from-purple-500/20",
            border: "hover:border-purple-500/30"
        },
        { 
            key: "security", 
            icon: ShieldCheck, 
            color: "text-emerald-400",
            glow: "from-emerald-500/20",
            border: "hover:border-emerald-500/30"
        }
    ];

    return (
        <section className="py-20 bg-black overflow-hidden relative border-t border-white/5">
            {/* Background Grid Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-white/10 text-brand-yellow text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-2xl backdrop-blur-md"
                    >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        {t("badge")}
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter max-w-4xl mx-auto leading-[1.1]"
                    >
                        {t("title")}
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto"
                    >
                        {t("subtitle")}
                    </motion.p>
                </div>

                {/* Cards Grid Container with Modular Scroll Hint */}
                <ScrollHint className="md:grid md:grid-cols-3 gap-6 md:gap-8 relative z-10 max-w-7xl mx-auto pb-8 md:pb-0 scroll-smooth">
                    {products.map((product, index) => (
                        <SolutionCard 
                            key={product.key} 
                            product={product} 
                            index={index}
                            locale={locale}
                            t={t}
                            globalTargetIndex={globalTargetIndex}
                        />
                    ))}
                </ScrollHint>
            </div>
        </section>
    );
}

interface SolutionCardProps {
    product: {
        key: string;
        icon: React.ElementType;
        color: string;
        glow: string;
        border: string;
    };
    index: number;
    locale: string;
    t: any;
    globalTargetIndex: number;
}

function SolutionCard({ product, index, locale, t, globalTargetIndex }: SolutionCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rectRef = useRef<DOMRect | null>(null);
    
    // Ambil array list layanan dari i18n
    const services = t.raw(`items.${product.key}.services`) as string[];
    const serviceIndex = services.length > 0 ? (globalTargetIndex % services.length) : 0;

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!rectRef.current) {
            rectRef.current = e.currentTarget.getBoundingClientRect();
        }
        const rect = rectRef.current;
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
        rectRef.current = null;
    };

    const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`;

    return (
        <motion.div
            id={`solusi-${product.key}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`flex-shrink-0 w-[85vw] md:w-full snap-center group relative p-6 md:p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 transition-all duration-500 flex flex-col items-center text-center h-full backdrop-blur-xl overflow-hidden shadow-2xl ${product.border}`}
        >
            {/* Interactive Spotlight */}
            <motion.div
                className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background }}
            />

            {/* Corner Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${product.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl rounded-full`} />
            
            <div className="relative z-10 flex flex-col items-center h-full w-full">
                {/* Icon Box */}
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 shadow-2xl relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${product.glow} to-transparent opacity-50`} />
                    <product.icon className={`w-7 h-7 ${product.color} relative z-10`} />
                </div>

                {/* System Category Badge */}
                <span className="text-[9px] font-black tracking-widest text-brand-yellow/90 bg-zinc-950/80 border border-white/10 rounded-full px-3 py-1 mb-3 uppercase">
                    {product.key === "web" ? "GROWTH SYSTEM" : product.key === "app" ? "OPERATION SYSTEM" : "SUPPORT SYSTEM"}
                </span>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-black text-white mb-3 group-hover:text-brand-yellow transition-colors leading-tight tracking-tight">
                    {t(`items.${product.key}.title`)}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 font-semibold leading-relaxed mb-6 text-xs sm:text-sm group-hover:text-zinc-200 transition-colors">
                    {t(`items.${product.key}.desc`)}
                </p>

                {/* Services List (Dinamis / Berganti-ganti dalam Mini-Box) */}
                <div className="w-full mb-6 flex-grow flex flex-col justify-center items-center min-h-[72px] bg-zinc-950/50 rounded-2xl border border-white/5 p-3.5 transition-colors group-hover:bg-zinc-950/80">
                    <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 leading-none">Layanan Terkait</h4>
                    <div className="h-8 flex items-center justify-center overflow-hidden w-full relative">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={serviceIndex}
                                initial={{ y: 12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -12, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "circOut" }}
                                className="text-xs md:text-sm font-black text-brand-yellow uppercase tracking-widest leading-relaxed text-center drop-shadow-[0_0_8px_rgba(255,200,0,0.15)]"
                            >
                                {services[serviceIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-auto w-full">
                    <Link href={`/${locale}/services`} className="block">
                        <Button className="w-full h-14 rounded-2xl bg-zinc-950 hover:bg-brand-yellow text-white hover:text-black border border-white/10 hover:border-brand-yellow transition-all duration-500 font-black uppercase tracking-tighter text-sm group-hover:shadow-2xl group-hover:shadow-brand-yellow/20 flex items-center justify-center gap-2 group/btn">
                            {t(`items.${product.key}.cta`)}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
