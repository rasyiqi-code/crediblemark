"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    qId: string;
    aId: string;
    qEn: string;
    aEn: string;
}

interface WordPressFAQProps {
    locale: string;
}

export function WordPressFAQ({ locale }: WordPressFAQProps) {
    const isId = locale === "id";
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqData: FAQItem[] = [
        {
            qId: "Mengapa investasi jasa WordPress di sini lebih tinggi dibandingkan penawaran murah di luar sana?",
            aId: "Sebagian besar jasa WordPress murah menggunakan template bajakan (nulled), plugin tidak berlisensi, dan pembangun halaman (page builders) yang membengkak sehingga membuat situs sangat lambat dan rentan diretas. Kami membangun WordPress dengan arsitektur bersih, optimasi kecepatan Core Web Vitals (skor mobile 90+), lisensi plugin resmi, serta konfigurasi keamanan tinggi. Anda membayar untuk keamanan jangka panjang dan stabilitas bisnis.",
            qEn: "Why is the investment here higher than cheap WordPress services elsewhere?",
            aEn: "Most cheap WordPress services rely on bloated, nulled themes/plugins and poorly configured builders that make your site slow and highly vulnerable to hacking. We construct WordPress using a clean, light architecture, target 90+ Core Web Vitals mobile speed scores, use licensed software, and set up hardened security layers. You are investing in long-term safety and business stability.",
        },
        {
            qId: "Apakah saya mendapatkan akses administrator penuh setelah proyek selesai?",
            aId: "Ya, tentu saja. Setelah seluruh pembayaran proyek dilunasi, kami akan memberikan akses Super Administrator penuh ke dashboard WordPress, panel hosting, database, dan file source code Anda. Website ini adalah milik Anda 100% tanpa ikatan kontrak bulanan paksaan.",
            qEn: "Do I get full administrator access after project completion?",
            aEn: "Yes, absolutely. Once all milestone payments are settled, we hand over full Super Administrator access to your WordPress dashboard, hosting panel, database, and repository. The site is 100% yours with no forced vendor lock-in.",
        },
        {
            qId: "Bagaimana jika saya ingin melakukan migrasi dari hosting lama saya?",
            aId: "Kami menyediakan bantuan migrasi penuh secara gratis. Tim ahli kami akan memindahkan seluruh data, konten, dan database website lama Anda ke infrastruktur hosting baru yang lebih cepat dan aman tanpa menyebabkan downtime pada situs Anda.",
            qEn: "What if I want to migrate from my old hosting provider?",
            aEn: "We provide complete data migration assistance free of charge. Our systems team will transfer all assets, media, and databases from your existing server to a new, optimized hosting infrastructure with zero downtime.",
        },
        {
            qId: "Bagaimana cara agensi menjaga keamanan website WordPress dari hacker?",
            aId: "Kami menerapkan pengerasan keamanan (security hardening) berlapis, termasuk memindahkan path login admin default, menonaktifkan XML-RPC yang sering diserang, membatasi percobaan login (brute force protection), mengintegrasikan sertifikat SSL, serta menyiapkan sistem cadangan (backup) otomatis harian di luar server utama.",
            qEn: "How does the agency secure the WordPress site from hackers?",
            aEn: "We apply multi-layered security hardening, which includes shifting default admin paths, disabling XML-RPC interfaces, installing brute-force protection shields, enforcing SSL certificates, and configuring automated off-site daily backups to prevent data loss.",
        },
    ];

    const toggleFAQ = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {faqData.map((item, idx) => {
                const isOpen = activeIndex === idx;
                const question = isId ? item.qId : item.qEn;
                const answer = isId ? item.aId : item.aEn;

                return (
                    <div
                        key={idx}
                        className="rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-sm overflow-hidden transition-colors duration-300 hover:border-white/10"
                    >
                        <button
                            onClick={() => toggleFAQ(idx)}
                            className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none"
                        >
                            <span className="font-bold text-sm sm:text-base text-white hover:text-violet-300 transition-colors">
                                {question}
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-300 ${
                                    isOpen ? "rotate-180 text-violet-400" : ""
                                }`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${
                                isOpen ? "max-h-[500px] border-t border-white/5" : "max-h-0"
                            } overflow-hidden`}
                        >
                            <p className="p-5 sm:p-6 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                {answer}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
