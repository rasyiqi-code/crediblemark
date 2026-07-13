"use client";

import { motion, Variants } from "framer-motion";
import { MessageSquare, FileText, Code2, CheckSquare, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";

export function WorkflowContent() {
    const t = useTranslations("Workflow");
    
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
        }
    };

    const steps = [
        {
            key: "step1",
            icon: MessageSquare,
        },
        {
            key: "step2",
            icon: FileText,
        },
        {
            key: "step3",
            icon: Code2,
        },
        {
            key: "step4",
            icon: CheckSquare,
        },
        {
            key: "step5",
            icon: Rocket,
        }
    ];

    return (
        <div className="container mx-auto px-6">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="space-y-16"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center flex flex-col items-center">
                    <div className="px-4 py-1.5 rounded-full bg-black/10 border border-black/5 text-black text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm backdrop-blur-sm">
                        {t("badge")}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter uppercase italic leading-tight">
                        {t("title")}
                    </h2>
                    <p className="text-black/80 font-bold max-w-2xl mx-auto text-base md:text-lg">{t("subtitle")}</p>
                </motion.div>

                {/* Timeline wrapper */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) - Horizontal (row 1) */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-black/10 origin-left"
                    />

                    {/* Connecting Line (Mobile) - Vertical Left-Aligned */}
                    <motion.div
                        initial={{ scaleY: 0, opacity: 0 }}
                        whileInView={{ scaleY: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="lg:hidden absolute left-8 top-8 bottom-12 w-0.5 bg-black/10 origin-top"
                    />

                    {/* Steps Container using flex-wrap centering */}
                    <div className="flex flex-col lg:flex-row lg:flex-wrap justify-center items-stretch gap-12 lg:gap-y-20 lg:gap-x-8">
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={step.key}
                                variants={itemVariants} 
                                className={`relative flex lg:flex-col items-center lg:items-center gap-6 lg:gap-0 w-full lg:w-[30%] ${idx >= 3 ? "lg:w-[40%]" : ""}`}
                            >
                                {/* Circle & Icon */}
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-black border-4 border-black/10 rounded-full flex items-center justify-center relative z-10 lg:mx-auto lg:mb-4 shadow-xl group hover:scale-105 transition-all duration-500 shrink-0">
                                    <step.icon className="w-6 h-6 lg:w-8 lg:h-8 text-brand-yellow group-hover:scale-110 transition-transform" />
                                    
                                    {/* Number Badge */}
                                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-yellow text-black border-2 border-black flex items-center justify-center text-[10px] font-black">
                                        0{idx + 1}
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="flex flex-col text-left lg:text-center">
                                    <h3 className="text-lg font-black text-black mb-1 lg:mb-2 italic uppercase tracking-tight leading-none">
                                        {t(step.key).replace(/^\d+\.\s*/, '')}
                                    </h3>
                                    <p className="text-black/75 text-xs lg:text-sm font-semibold leading-relaxed max-w-[280px] lg:mx-auto">
                                        {t(`${step.key}Desc`)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
