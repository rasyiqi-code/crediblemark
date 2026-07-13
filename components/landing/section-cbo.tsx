import { HelpCircle, Cpu, ShieldAlert, ArrowRight, MessageSquare, Code2, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function ConsultBuildOperate() {
    return (
        <section id="cbo" className="py-20 bg-black relative overflow-hidden border-b border-white/5">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 z-0 opacity-[0.02] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                    backgroundSize: '28px 28px'
                }}
            />
            
            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
                        CONSULT • BUILD • OPERATE
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed">
                        Kami tidak sekadar menulis kode. Kami mendampingi bisnis Anda di setiap tahap untuk memastikan sistem bekerja secara maksimal.
                    </p>
                </div>

                {/* 3 Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    
                    {/* Consult */}
                    <div className="p-8 rounded-[2rem] bg-zinc-900/20 border border-white/5 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl" />
                            <MessageSquare className="w-6 h-6 text-blue-400 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-3 group-hover:text-blue-400 transition-colors">CONSULT</h3>
                        <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
                            Menganalisis proses kerja operasional, memetakan masalah utama, menyusun blueprint sistem, dan merancang solusi digital yang relevan dengan tujuan bisnis Anda.
                        </p>
                    </div>

                    {/* Build */}
                    <div className="p-8 rounded-[2rem] bg-zinc-900/20 border border-white/5 flex flex-col items-center text-center group hover:border-purple-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative">
                            <div className="absolute inset-0 bg-purple-500/10 rounded-2xl" />
                            <Code2 className="w-6 h-6 text-purple-400 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-3 group-hover:text-purple-400 transition-colors">BUILD</h3>
                        <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
                            Mengembangkan website penjualan kustom, aplikasi operasional internal, atau integrasi sistem API dengan arsitektur kode clean-code berstandar industri.
                        </p>
                    </div>

                    {/* Operate */}
                    <div className="p-8 rounded-[2rem] bg-zinc-900/20 border border-white/5 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl" />
                            <ShieldCheck className="w-6 h-6 text-emerald-400 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-3 group-hover:text-emerald-400 transition-colors">OPERATE</h3>
                        <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
                            Mendampingi implementasi ke tim Anda, memberikan panduan pelatihan, melakukan monitoring performa server, dan menyediakan garansi bug selama 90 hari.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
