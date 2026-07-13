import { getTranslations } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export async function AboutSection() {
    const t = await getTranslations("About");
    const settings = await getSystemSettings(["AGENCY_NAME"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";

    return (
        <section id="pendekatan-kami" className="py-20 md:py-28 bg-black overflow-hidden relative border-b border-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto text-center lg:text-left">
                    
                    {/* Left Side: System Blueprint Visual */}
                    <div className="shrink-0 relative w-full max-w-lg lg:w-[48%] mx-auto lg:mx-0">
                        <SystemBlueprintVisual />
                        
                        {/* Status Badge */}
                        <div className="absolute -bottom-4 left-1/2 lg:left-6 -translate-x-1/2 lg:translate-x-0 z-20 bg-brand-yellow px-5 py-2 rounded-xl shadow-2xl flex items-center gap-2 border-[3px] border-black rotate-2">
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-black text-black uppercase tracking-wider whitespace-nowrap">
                                {t("badge")}
                            </span>
                        </div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="flex-1 space-y-6 sm:space-y-8 pt-6 lg:pt-0">
                        <div className="space-y-4">
                            <p className="text-brand-yellow text-xs sm:text-sm font-bold tracking-[.4em] uppercase opacity-90">
                                {t("role")}
                            </p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight">
                                &ldquo;{t("quote")}&rdquo;
                            </h2>
                        </div>

                        <div className="max-w-2xl mx-auto lg:mx-0 space-y-6">
                            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed antialiased font-light">
                                {t("description", { brand: agencyName })}
                            </p>

                            <div className="pt-4 flex justify-center lg:justify-start">
                                <Link href="#cara-kerja">
                                    <Button className="h-12 px-6 rounded-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-extrabold shadow-lg shadow-brand-yellow/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group border-0">
                                        Pelajari Cara Kerjanya
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function SystemBlueprintVisual() {
    return (
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-950/80 border border-white/5 relative z-10 flex items-center justify-center p-6 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-950/50 pointer-events-none" />
            <svg className="w-full h-full text-zinc-600 relative z-10" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Defs for gradients & glows */}
                <defs>
                    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FED700" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#00ADD8" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Nodes */}
                {/* Business Problem */}
                <rect x="25" y="30" width="115" height="52" rx="14" fill="#09090b" stroke="#FED700" strokeWidth="1.5" />
                <text x="82.5" y="55" fill="#FED700" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" letterSpacing="0.05em">MASALAH BISNIS</text>
                <text x="82.5" y="68" fill="#71717a" fontSize="7.5" textAnchor="middle" fontFamily="sans-serif">Data Tersebar & Manual</text>

                {/* Consult & Audit */}
                <rect x="25" y="218" width="115" height="52" rx="14" fill="#09090b" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="82.5" y="243" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" letterSpacing="0.05em">1. KONSULTASI & AUDIT</text>
                <text x="82.5" y="256" fill="#71717a" fontSize="7.5" textAnchor="middle" fontFamily="sans-serif">Petakan Proses Kerja</text>

                {/* System Blueprint */}
                <rect x="250" y="30" width="125" height="52" rx="14" fill="#09090b" stroke="#a855f7" strokeWidth="1.5" />
                <text x="312.5" y="55" fill="#a855f7" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" letterSpacing="0.05em">2. BLUEPRINT DESIGN</text>
                <text x="312.5" y="68" fill="#71717a" fontSize="7.5" textAnchor="middle" fontFamily="sans-serif">Spesifikasi & Flow Data</text>

                {/* Custom Digital System */}
                <rect x="250" y="218" width="125" height="52" rx="14" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
                <text x="312.5" y="243" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace" letterSpacing="0.05em">3. SISTEM DIGITAL</text>
                <text x="312.5" y="256" fill="#71717a" fontSize="7.5" textAnchor="middle" fontFamily="sans-serif">Otomatis & Siap Pakai</text>

                {/* Connecting Paths with flowing dots */}
                {/* Path 1: Problem -> Consult */}
                <path d="M 82.5 82 L 82.5 218" stroke="#27272a" strokeWidth="2" strokeDasharray="4,4" />
                
                {/* Path 2: Consult -> Design */}
                <path d="M 140 244 L 192 244 L 192 56 L 250 56" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.4" id="flowPath1" />
                <circle r="3.5" fill="#3b82f6">
                    <animateMotion dur="4.5s" repeatCount="indefinite" path="M 140 244 L 192 244 L 192 56 L 250 56" />
                </circle>

                {/* Path 3: Design -> System */}
                <path d="M 312.5 82 L 312.5 218" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.4" id="flowPath2" />
                <circle r="3.5" fill="#a855f7">
                    <animateMotion dur="3.5s" repeatCount="indefinite" path="M 312.5 82 L 312.5 218" />
                </circle>

                {/* Center Badge: Value */}
                <circle cx="192" cy="150" r="28" fill="#020202" stroke="#FED700" strokeWidth="1.5" filter="url(#glow)" />
                <text x="192" y="148" fill="#FED700" fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="monospace">SOLUSI</text>
                <text x="192" y="157" fill="#fff" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">DIGITAL</text>
            </svg>
        </div>
    );
}
