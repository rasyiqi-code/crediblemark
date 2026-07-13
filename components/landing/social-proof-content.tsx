"use client";

import { motion, Variants } from "framer-motion";
import { Search, FileText, Coins, Activity, Key, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";

export function SocialProofContent() {
    const t = useTranslations("SocialProof");
    
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="container mx-auto px-4 overflow-hidden py-2"
        >
            <motion.div variants={itemVariants} className="text-center">
                <div className="relative overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                    <div
                        className="flex gap-12 md:gap-16 w-max pr-12 md:pr-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 marquee-track"
                        style={{ animation: 'marquee-scroll 35s linear infinite' }}
                    >
                        {[...Array(4)].flatMap(() => [
                            { icon: Search, text: t("analysis") },
                            { icon: FileText, text: t("blueprint") },
                            { icon: Coins, text: t("price") },
                            { icon: Activity, text: t("progress") },
                            { icon: Key, text: t("ownership") },
                            { icon: Wrench, text: t("support") }
                        ]).map((item, i) => (
                            <div key={i} className="flex items-center justify-center gap-3 text-zinc-300 font-bold whitespace-nowrap text-sm sm:text-base md:text-lg">
                                <item.icon className="w-5 h-5 text-brand-yellow shrink-0" /> {item.text}
                            </div>
                        ))}
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes marquee-scroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .marquee-track {
                            will-change: transform;
                        }
                    `}} />
                </div>
            </motion.div>
        </motion.div>
    );
}
