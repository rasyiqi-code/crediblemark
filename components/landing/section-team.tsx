import { getTranslations } from "next-intl/server";
import { Linkedin, Mail, Shield } from "lucide-react";
import Image from "next/image";

interface TeamMember {
    name: string;
    roleKey: string;
    skills: string;
    projectRole: string;
    avatar: string;
    linkedin: string;
}

export async function TeamSection() {
    const t = await getTranslations("Team");

    const members: TeamMember[] = [
        {
            name: "Rasyiqi",
            roleKey: "consultant",
            skills: "Analisis Alur Kerja, Arsitektur Sistem, Integrasi Enterprise",
            projectRole: "Merumuskan strategi solusi, menyusun blueprint sistem, memimpin sesi audit bisnis",
            avatar: "/avatars/avatar-1.svg",
            linkedin: "https://linkedin.com"
        },
        {
            name: "Imam",
            roleKey: "lead",
            skills: "Next.js, Node.js, Cloud Architect, PostgreSQL Database",
            projectRole: "Mengkoordinasi koding tim engineer, optimasi infrastruktur server, menjaga performa sistem",
            avatar: "/avatars/avatar-2.svg",
            linkedin: "https://linkedin.com"
        },
        {
            name: "Zaki",
            roleKey: "ui",
            skills: "Figma UI/UX, User Flow, Wireframing, Product Styling",
            projectRole: "Merancang desain mockup sistem yang intuitif, memandu estetika antarmuka visual (UI)",
            avatar: "/avatars/avatar-3.svg",
            linkedin: "https://linkedin.com"
        }
    ];

    return (
        <section id="tim-kami" className="py-20 md:py-28 bg-black overflow-hidden border-b border-white/5 relative">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-yellow/5 rounded-full blur-[110px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight">
                        {t("title")}
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Team members grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {members.map((member, idx) => (
                        <div key={idx} className="p-6 rounded-[2.5rem] bg-zinc-900/10 border border-white/5 backdrop-blur-sm flex flex-col items-center text-center group hover:border-brand-yellow/20 transition-all duration-500 relative">
                            {/* Avatar frame */}
                            <div className="w-24 h-24 rounded-full bg-zinc-950 border border-white/10 p-1 mb-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                                    <Image 
                                        src={member.avatar} 
                                        alt={member.name}
                                        fill
                                        className="object-cover scale-110"
                                        sizes="96px"
                                    />
                                </div>
                            </div>

                            {/* Name & Role */}
                            <h3 className="text-xl font-extrabold text-white tracking-tight leading-none mb-1 group-hover:text-brand-yellow transition-colors">{member.name}</h3>
                            <p className="text-brand-yellow text-xs font-bold uppercase tracking-widest mb-4">{t(`roles.${member.roleKey}`)}</p>

                            {/* Divider */}
                            <div className="w-12 h-0.5 bg-white/5 mb-4" />

                            {/* Details */}
                            <div className="space-y-3.5 mb-6 text-xs md:text-sm">
                                <div className="space-y-1">
                                    <div className="font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Keahlian Utama</div>
                                    <p className="text-zinc-400 font-light leading-relaxed">{member.skills}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Peran Proyek</div>
                                    <p className="text-zinc-300 font-semibold leading-relaxed">{member.projectRole}</p>
                                </div>
                            </div>

                            {/* LinkedIn Link */}
                            <div className="mt-auto pt-4 flex gap-3">
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-brand-yellow hover:border-brand-yellow/30 transition-all duration-300 shadow-xl">
                                    <Linkedin className="w-4 h-4 fill-zinc-500 hover:fill-brand-yellow" />
                                </a>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
