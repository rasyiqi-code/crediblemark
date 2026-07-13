"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { TypingHeroTitle } from "./typing-hero-title";
import { cn } from "@/lib/shared/utils";
import { useFloatingChat } from "@/lib/store/floating-chat-store";


interface HeroContentProps {
    agencyName: string;
    waUrl: string;
}

export function HeroContent({ agencyName, waUrl }: HeroContentProps) {
    const t = useTranslations("Hero");
    const locale = useLocale();
    const { setIsMenuOpen } = useFloatingChat();

    const [isMobile, setIsMobile] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const shouldReduceMotion = !!useReducedMotion();
    
    // Batasi pengulangan maksimal 2 kali untuk mencegah pembebanan CPU terus-menerus di background
    const repeatCount = (isMobile || shouldReduceMotion) ? 0 : 2;

    React.useEffect(() => {
        setMounted(true);
        setIsMobile(window.innerWidth < 1024);
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const [typingStatus, setTypingStatus] = React.useState<"typing" | "full" | "deleting">("typing");

    return (
        <>
            <div className="absolute inset-0 bg-black">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <div
                        className="relative space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1 animate-hero-fade-in"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Status Widget */}
                            <div className="flex justify-center lg:justify-start animate-hero-fade-up">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-black tracking-wider w-fit">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                                    </span>
                                    {t("statusBadge")}
                                </div>
                            </div>

                            <div
                                className="relative space-y-4 animate-hero-fade-up animation-delay-100"
                            >
                                <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-brand-yellow via-amber-300 to-yellow-500 bg-clip-text text-transparent whitespace-pre-line drop-shadow-[0_2px_10px_rgba(254,215,0,0.1)]">
                                    {t("title")}
                                </h1>
                            </div>
                        </div>

                        <p
                            className="text-lg md:text-xl text-zinc-400 leading-relaxed animate-hero-fade-up animation-delay-200"
                        >
                            {t("description")}
                        </p>

                        <div
                            className="flex flex-col gap-2 pt-4 animate-hero-fade-up animation-delay-300"
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Button
                                    onClick={() => setIsMenuOpen(true)}
                                    size="lg"
                                    className="w-full sm:w-auto h-11 px-5 text-sm md:h-14 md:px-8 md:text-lg bg-brand-yellow text-black hover:bg-brand-yellow/90 rounded-full font-bold shadow-[0_0_20px_rgba(254,215,0,0.3)] hover:shadow-[0_0_35px_rgba(254,215,0,0.5)] transition-all cursor-pointer"
                                >
                                    {t("ctaPrimary")}
                                    <ArrowRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5" />
                                </Button>

                                <Link href={`/${locale}/portfolio`} className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full h-11 px-5 text-sm md:h-14 md:px-8 md:text-lg bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-brand-yellow/10 hover:text-brand-yellow hover:border-brand-yellow/50 rounded-full transition-all backdrop-blur-sm">
                                        <Zap className="w-4 h-4 mr-1.5 text-brand-yellow" />
                                        {t("ctaSecondary")}
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-zinc-500 text-xs mt-2 italic">
                                {t("ctaHint")}
                            </p>
                        </div>

                        {/* Tech Stack Hints - Marquee */}
                        <div
                            className="pt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 flex justify-center lg:justify-start w-full overflow-hidden animate-hero-fade-up animation-delay-400"
                        >
                            <div className="relative flex overflow-x-hidden w-full max-w-[300px] lg:max-w-none [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
                                <motion.div
                                    className="flex whitespace-nowrap gap-8"
                                    animate={{ x: "-50%" }}
                                    transition={{
                                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                                        ease: "linear",
                                        duration: 20,
                                    }}
                                >
                                    {[...Array(4)].map((_, i) => (
                                        <span key={i} className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex-shrink-0">
                                            {t("poweredBy")}
                                        </span>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Expert Asset */}
                    <div className="relative mt-0 lg:mt-0 order-1 lg:order-2">


                        <div
                            className="relative w-full h-[400px] sm:h-[550px] lg:h-[600px] xl:h-[700px] z-10 flex items-end justify-center animate-hero-fade-up"
                        >
                            {/* Business Visuals Masking Layer (Bottom) */}
                            {mounted && <BusinessVisuals isMobile={isMobile} repeatCount={repeatCount} shouldReduceMotion={shouldReduceMotion} />}

                            {/* Floating AI Model Badges - Background Layer (Middle) */}
                            <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-40">
                                {mounted && (
                                    <>
                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "top-[10%] left-[5%]" : "top-[20%] -left-12"}
                                            delay={1.2}
                                        >
                                            <BadgeContent
                                                icon="/brands/gemini.webp"
                                                name="Google"
                                                model="Gemini 1.5 Pro"
                                            />
                                        </BadgeWrapper>

                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "top-[10%] right-[5%]" : "top-[15%] -right-8"}
                                            delay={1.4}
                                        >
                                            <BadgeContent
                                                icon="/brands/openai.webp"
                                                name="OpenAI"
                                                model="GPT-4o"
                                            />
                                        </BadgeWrapper>

                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "bottom-[15%] left-[5%]" : "bottom-[20%] -left-8"}
                                            delay={1.6}
                                        >
                                            <BadgeContent
                                                icon="/brands/llama.webp"
                                                name="Meta"
                                                model="Llama 3.1"
                                            />
                                        </BadgeWrapper>

                                        <BadgeWrapper
                                            isMobile={isMobile}
                                            className={isMobile ? "bottom-[10%] right-[5%]" : "bottom-[25%] -right-12"}
                                            delay={1.8}
                                        >
                                            <BadgeContent
                                                icon="/brands/claude.webp"
                                                name="Anthropic"
                                                model="Claude 3.5 Sonnet"
                                            />
                                        </BadgeWrapper>
                                    </>
                                )}
                            </div>

                            {/* Optimasi LCP: Menggunakan berkas WebP terkompresi (~70KB dibanding PNG 611KB asli) */}
                            <Image
                                src="/expert.webp"
                                alt={`${agencyName} - Software Engineering & Digital Transformation`}
                                fill
                                className="object-contain object-bottom relative z-10"
                                priority
                                loading="eager"
                                decoding="sync"
                                unoptimized
                                fetchPriority="high"
                            />

                            {/* Accent Tagline Layer (Top) */}
                            <div className="absolute bottom-12 left-0 w-full z-20 pointer-events-none px-4 flex flex-col items-center justify-center gap-0 text-center">
                                {/* Optimasi LCP: Menggunakan tag p biasa dengan animasi CSS untuk menghindari delay JS render (meniadakan render delay 3.4s) */}
                                <p
                                    className="text-xl md:text-3xl xl:text-4xl font-black italic tracking-tighter text-brand-yellow/80 drop-shadow-[0_0_10px_rgba(254,215,0,0.7)] drop-shadow-[0_0_20px_rgba(254,215,0,0.4)] leading-none animate-hero-fade-up"
                                >
                                    {t("heroTagline1")}
                                </p>
                                <p
                                    className="text-xl md:text-3xl xl:text-4xl font-black italic tracking-tighter text-brand-yellow/80 drop-shadow-[0_0_10px_rgba(254,215,0,0.7)] drop-shadow-[0_0_20px_rgba(254,215,0,0.4)] leading-none mt-2 animate-hero-fade-up animation-delay-100"
                                >
                                    {t("heroTagline2")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function BadgeWrapper({ children, delay, duration = 8, className, isMobile }: {
    children: React.ReactNode;
    delay: number;
    duration?: number;
    className?: string;
    isMobile: boolean;
}) {
    // Gunakan deteksi prefensi motion untuk serverless/client-side match
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: 1, 
                y: (isMobile || reduced) ? 0 : [0, -10, 0] 
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                y: { 
                    duration: duration, 
                    repeat: (isMobile || reduced) ? 0 : Infinity, 
                    ease: "easeInOut",
                    delay: delay
                }
            }}
            className={cn("absolute", className)}
        >
            {children}
        </motion.div>
    );
}

function BadgeContent({ name, model, icon }: {
    name: string;
    model: string;
    icon: string;
}) {
    return (
        <div className="flex items-center gap-1.5 group/badge">
            <div className="w-5 h-5 rounded-md overflow-hidden relative grayscale group-hover/badge:grayscale-0 transition-all duration-500 bg-white/5 p-1 flex items-center justify-center">
                {/* Optimasi LCP: Dihapus 'priority' agar tidak melakukan preload yang menghabiskan bandwidth gambar utama */}
                <Image 
                    src={icon} 
                    alt={`${name} logo`} 
                    width={16} 
                    height={16} 
                    className="object-contain" 
                />
            </div>
            <div>
                <div className="text-[7px] text-zinc-500 uppercase tracking-tighter font-bold font-mono leading-none">{name}</div>
                <div className="text-[9px] font-bold text-white leading-none mt-0.5">{model}</div>
            </div>
        </div>
    );
}

const BusinessVisuals = ({ isMobile, repeatCount, shouldReduceMotion }: { 
    isMobile: boolean; 
    repeatCount: number; 
    shouldReduceMotion: boolean; 
}) => {

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            {/* Growth Graph SVG */}
            <svg
                viewBox="0 0 800 400"
                className="w-full h-full opacity-20"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="var(--brand-yellow)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--brand-yellow)" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Grid Lines - Optimized on Mobile (Static) */}
                {[...Array(6)].map((_, i) => (
                    <line
                        key={`grid-v-${i}`}
                        x1={i * 160}
                        y1="0"
                        x2={i * 160}
                        y2="400"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}
                {[...Array(4)].map((_, i) => (
                    <line
                        key={`grid-h-${i}`}
                        x1="0"
                        y1={i * 100}
                        x2="800"
                        y2={i * 100}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}

                {/* Growth Path - Slower/Disabled on Mobile to save CPU */}
                <motion.path
                    d="M 0 350 Q 150 330 300 250 T 600 150 T 800 50"
                    fill="none"
                    stroke="url(#growthGradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: isMobile ? 2 : 3,
                        ease: "easeInOut",
                        repeat: repeatCount,
                        repeatType: "loop",
                        repeatDelay: 1
                    }}
                />

                {/* Secondary Path - Optimized on Mobile (Static) */}
                <motion.path
                    d="M 0 380 Q 200 360 400 320 T 700 220 T 800 180"
                    fill="none"
                    stroke="rgba(254,215,0,0.1)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: isMobile ? 6 : 4,
                        ease: "easeInOut",
                        repeat: repeatCount,
                        repeatType: "loop"
                    }}
                />
            </svg>

            {/* Floating Business Icons/Nodes - Optimized on Mobile (Static) */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        y: (isMobile || shouldReduceMotion) ? 0 : [-10, 10, -10],
                        opacity: (isMobile || shouldReduceMotion) ? 0.15 : [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[20%] left-[10%] text-brand-yellow"
                >
                    <TrendingUp size={48} strokeWidth={1} />
                </motion.div>

                <motion.div
                    animate={{
                        y: (isMobile || shouldReduceMotion) ? 0 : [10, -10, 10],
                        opacity: (isMobile || shouldReduceMotion) ? 0.1 : [0.05, 0.2, 0.05]
                    }}
                    transition={{
                        duration: 6,
                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[30%] right-[15%] text-brand-yellow"
                >
                    <BarChart3 size={64} strokeWidth={1} />
                </motion.div>

                <motion.div
                    animate={{
                        scale: (isMobile || shouldReduceMotion) ? 1 : [1, 1.1, 1],
                        opacity: (isMobile || shouldReduceMotion) ? 0.15 : [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: (isMobile || shouldReduceMotion) ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[40%] right-[10%] text-brand-yellow"
                >
                    <Activity size={40} strokeWidth={1} />
                </motion.div>
            </div>
        </div>
    );
};
