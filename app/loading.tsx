"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

// Daftar quote persuasif (closing copywriting) yang berfokus pada ROI & Kualitas
const QUOTES = [
    {
        en: "An expensive system that works is cheaper than a cheap system that breaks.",
        id: "Sistem berkualitas yang bekerja jauh lebih murah daripada sistem murah yang sering rusak."
    },
    {
        en: "Don't just build software. Build a scalable digital asset for your business growth.",
        id: "Jangan sekadar membuat software. Bangun aset digital yang scalable untuk pertumbuhan bisnis Anda."
    },
    {
        en: "Delegating your tech to experts lets you focus entirely on scaling your revenue.",
        id: "Menyerahkan teknologi Anda kepada ahlinya membuat Anda fokus sepenuhnya pada pertumbuhan omzet."
    },
    {
        en: "Great systems run silently in the background, allowing your business to grow without limits.",
        id: "Sistem yang hebat berjalan senyap di latar belakang, membiarkan bisnis Anda tumbuh tanpa batas."
    },
    {
        en: "Investing in software scalability today prevents costly rebuilds tomorrow.",
        id: "Berinvestasi pada skalabilitas sistem hari ini menghindari biaya bangun ulang yang mahal di hari esok."
    },
    {
        en: "Build to scale, design to prevail. That is our commitment to your digital investment.",
        id: "Meningkatkan skala, merancang untuk menang. Itulah komitmen kami bagi investasi digital Anda."
    },
    {
        en: "The efficiency of a custom digital system is measured by the human hours it saves you daily.",
        id: "Efisiensi sistem kustom diukur dari berapa banyak waktu tim Anda yang berhasil dihemat setiap hari."
    }
];

export default function Loading() {
    const [quote, setQuote] = useState("");

    useEffect(() => {
        // Deteksi locale dari path browser untuk menyesuaikan bahasa quote
        const isId = window.location.pathname.startsWith("/id") || window.location.pathname.includes("/id/");
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        const selectedQuote = QUOTES[randomIndex];
        
        // Membungkus setQuote dalam setTimeout asinkron untuk menghindari cascading render dan error ESLint
        const timer = setTimeout(() => {
            setQuote(isId ? selectedQuote.id : selectedQuote.en);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none font-mono">
            <div className="p-4 md:p-6 rounded-2xl bg-zinc-950/90 border border-white/5 flex flex-col sm:flex-row items-center gap-3 md:gap-4 shadow-2xl shadow-black/80 max-w-lg mx-4">
                <div className="flex items-center gap-3 shrink-0">
                    <Terminal className="w-4 h-4 text-brand-yellow animate-pulse shrink-0" />
                    <span className="text-[10px] tracking-widest uppercase text-brand-yellow font-black whitespace-nowrap">
                        CREDIBLEMARK &gt;
                    </span>
                </div>
                <div className="text-zinc-300 text-xs font-semibold leading-relaxed text-center sm:text-left">
                    {quote || "Loading..."}
                    <span className="inline-block w-1.5 h-3.5 bg-brand-yellow ml-1 animate-[ping_1s_infinite] align-middle" />
                </div>
            </div>
        </div>
    );
}
