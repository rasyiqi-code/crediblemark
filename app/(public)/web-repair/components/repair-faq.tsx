"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Struktur data untuk item FAQ
interface FAQItem {
    qId: string;
    aId: string;
    qEn: string;
    aEn: string;
}

interface RepairFAQProps {
    locale: string;
}

export function RepairFAQ({ locale }: RepairFAQProps) {
    const isId = locale === "id";
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Data FAQ khusus untuk Jasa Perbaikan Website (Vibecoding Rescue)
    const faqData: FAQItem[] = [
        {
            qId: "Saya memesan website dari agensi/freelancer lain, tetapi hasilnya sangat lambat dan penuh error. Bisakah diperbaiki di sini?",
            aId: "Sangat bisa. Ini adalah salah satu masalah paling umum saat ini. Banyak penyedia jasa pembuatan website murah melakukan 'vibecoding'—membuat website secara cepat menggunakan AI tanpa memahami struktur arsitektur yang aman dan efisien. Kami akan mengaudit sistem tersebut, memperbaiki fungsi yang rusak, dan menulis ulang kodenya secara rapi dan profesional agar website berjalan cepat dan aman.",
            qEn: "I bought a website from a freelancer/agency, but it is slow and buggy. Can you fix it?",
            aEn: "Yes, absolutely. This is one of the most common issues we solve. Many cheap website providers rely on 'vibecoding'—instantly generating code using AI with no regard for security or performance. We audit the system, resolve structural crashes, and clean up the codebase to meet industry standards.",
        },
        {
            qId: "Teknologi atau framework apa saja yang bisa diperbaiki di sini?",
            aId: "Kami memiliki tim ahli senior yang menangani berbagai teknologi modern, termasuk Next.js, React, Vue, Node.js, TypeScript, PHP (Laravel, WordPress), HTML/CSS, serta optimasi query database (PostgreSQL, MySQL, MongoDB).",
            qEn: "Which technologies or frameworks can you fix?",
            aEn: "Our senior engineering team handles a wide range of modern technologies, including Next.js, React, Vue, Node.js, TypeScript, PHP (Laravel, WordPress), HTML/CSS, and database query optimization (PostgreSQL, MySQL, MongoDB).",
        },
        {
            qId: "Apakah saya harus membayar jika bug tidak berhasil diperbaiki?",
            aId: "Tentu tidak. Kami bekerja berdasarkan kepastian hasil. Jika setelah proses diagnosis awal kami menyanggupi perbaikan dan ternyata kendala tidak teratasi sesuai kesepakatan, dana Anda akan dikembalikan sesuai jaminan kami.",
            qEn: "Do I have to pay if the bugs cannot be fixed?",
            aEn: "No, absolutely not. We deliver guaranteed outcomes. If we agree on fixing a specific set of bugs and fail to resolve them, you will receive a refund in accordance with our guarantee policy.",
        },
        {
            qId: "Bagaimana jaminan keamanan data dan kerahasiaan source code saya?",
            aId: "Keamanan Anda adalah prioritas kami. Kami siap menandatangani Perjanjian Kerahasiaan (NDA) resmi sebelum Anda memberikan akses ke repositori kode atau database Anda. Seluruh kredensial dikelola secara aman dan dienkripsi.",
            qEn: "How do you guarantee the security of my data and source code?",
            aEn: "Your security is our primary focus. We are ready to sign a formal Non-Disclosure Agreement (NDA) before you grant access to your repositories or databases. All credentials and keys are handled securely and encrypted.",
        },
        {
            qId: "Apakah ada garansi setelah perbaikan website selesai?",
            aId: "Ya, kami memberikan Garansi Bebas Error selama 90 hari setelah proyek serah terima. Jika bug yang sama muncul kembali atau terjadi kendala pada bagian yang kami perbaiki, tim kami akan membereskannya tanpa biaya tambahan.",
            qEn: "Is there a warranty after the website repair is completed?",
            aEn: "Yes, we provide a 90-day Error-Free Warranty post-delivery. If the same bugs reappear or any issues arise within the scope of our repairs, our team will resolve them with no extra charges.",
        },
        {
            qId: "Berapa lama proses diagnosis dan perbaikan biasanya berlangsung?",
            aId: "Proses diagnosis awal (Code Audit) biasanya selesai dalam 24-48 jam. Perbaikan bug taktis dapat selesai dalam 1-3 hari, sedangkan refactoring arsitektur sistem skala besar membutuhkan waktu 2 hingga 4 minggu.",
            qEn: "How long does the diagnosis and repair process usually take?",
            aEn: "Initial code audit and diagnostics are typically completed within 24-48 hours. Quick bug fixes can take 1-3 days, while major architectural refactoring projects take 2 to 4 weeks.",
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
                        className="rounded-2xl border border-white/5 bg-zinc-950 overflow-hidden transition-colors duration-300 hover:border-white/10"
                    >
                        <button
                            onClick={() => toggleFAQ(idx)}
                            className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none"
                        >
                            <span className="font-bold text-sm sm:text-base text-white hover:text-amber-500 transition-colors">
                                {question}
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-300 ${
                                    isOpen ? "rotate-180 text-amber-500" : ""
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
