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
                    <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter italic leading-tight">
                        {t("title")}
                    </h2>
                    <p className="text-black/80 font-bold max-w-2xl mx-auto text-base md:text-lg">{t("subtitle")}</p>
                </motion.div>

                {/* Timeline wrapper */}
                <div className="relative max-w-7xl mx-auto">
                    {/* Garis penghubung horizontal - tampil di semua ukuran */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="absolute top-[40px] left-[10%] right-[10%] h-0.5 bg-black/10 origin-left hidden lg:block"
                    />

                    {/* Scroll wrapper mobile */}
                    <div className="overflow-x-auto no-scrollbar -mx-6 px-6 lg:overflow-visible lg:mx-0 lg:px-0">
                        {/* Steps Container */}
                        <div className="flex flex-row lg:justify-between items-start gap-8 lg:gap-4 w-max lg:w-auto">
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={step.key}
                                    variants={itemVariants}
                                    className="relative flex flex-col items-center gap-3 w-28 lg:flex-1 lg:w-auto shrink-0"
                                >
                                    {/* Circle & Icon */}
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-black border-4 border-black/10 rounded-full flex items-center justify-center relative z-10 shadow-xl group hover:scale-105 transition-all duration-500">
                                        <step.icon className="w-6 h-6 lg:w-8 lg:h-8 text-brand-yellow group-hover:scale-110 transition-transform" />
                                        {/* Number Badge */}
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-yellow text-black border-2 border-black flex items-center justify-center text-[10px] font-black">
                                            0{idx + 1}
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <h3 className="text-[11px] lg:text-sm font-black text-black italic uppercase tracking-tight leading-tight text-center">
                                        {t(step.key)}
                                    </h3>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
