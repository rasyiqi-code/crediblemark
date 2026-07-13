import Link from "next/link";
import { Check, Mail, Phone, Linkedin, Github } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import Image from "next/image";

export async function SiteFooter() {
    const t = await getTranslations("Footer");
    const locale = await getLocale();

    const settings = await getSystemSettings([
        "AGENCY_NAME", 
        "COMPANY_NAME", 
        "AGENCY_LOGO", 
        "AGENCY_LOGO_DISPLAY",
        "CONTACT_PHONE"
    ]);

    const agencyName = settings.find((s) => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const companyName = settings.find((s) => s.key === "COMPANY_NAME")?.value || "Crediblemark";
    const logoUrl = settings.find((s) => s.key === "AGENCY_LOGO")?.value;
    const logoDisplayMode = settings.find((s) => s.key === "AGENCY_LOGO_DISPLAY")?.value || "both";
    const contactPhone = settings.find((s) => s.key === "CONTACT_PHONE")?.value;

    const waUrl = contactPhone ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Halo%20Crediblemark%2C%20saya%20ingin%20berkonsultasi` : "#";
    const email = "hello@crediblemark.com";

    const showLogo = logoDisplayMode === "both" || logoDisplayMode === "logo";
    const showText = logoDisplayMode === "both" || logoDisplayMode === "text";

    return (
        <footer className="border-t border-white/5 bg-[#030303] text-zinc-400 pt-16 pb-12 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                
                {/* Upper Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-white/5">
                    
                    {/* Column 1: Info Brand (4 cols) */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex items-center gap-2.5">
                            {showLogo && (
                                logoUrl ? (
                                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                                        <Image
                                            src={logoUrl}
                                            alt={agencyName}
                                            fill
                                            className="object-cover"
                                            sizes="32px"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-7 w-7 rounded-full bg-brand-yellow flex items-center justify-center">
                                        <Check className="h-3.5 w-3.5 text-black stroke-[3]" />
                                    </div>
                                )
                            )}
                            {showText && (
                                <span className="font-extrabold text-white tracking-tight text-lg uppercase italic">{agencyName}</span>
                            )}
                        </div>
                        
                        <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed max-w-sm">
                            {t("desc")}
                        </p>
                    </div>

                    {/* Column 2: Solusi (2 cols) */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Solusi</h4>
                        <ul className="space-y-2.5 text-xs md:text-sm font-semibold">
                            <li><Link href={`/${locale}#solusi-web`} className="hover:text-brand-yellow transition-colors">Website Bisnis</Link></li>
                            <li><Link href={`/${locale}#solusi-app`} className="hover:text-brand-yellow transition-colors">Aplikasi Khusus</Link></li>
                            <li><Link href={`/${locale}#solusi-app`} className="hover:text-brand-yellow transition-colors">Sistem Operasional</Link></li>
                            <li><Link href={`/${locale}#solusi-support`} className="hover:text-brand-yellow transition-colors">Integrasi</Link></li>
                            <li><Link href={`/${locale}#system-audit`} className="hover:text-brand-yellow transition-colors">Digital System Audit</Link></li>
                            <li><Link href={`/${locale}#solusi-support`} className="hover:text-brand-yellow transition-colors">Maintenance</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Perusahaan (2 cols) */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Perusahaan</h4>
                        <ul className="space-y-2.5 text-xs md:text-sm font-semibold">
                            <li><Link href={`/${locale}#founder-profile`} className="hover:text-brand-yellow transition-colors">Tentang</Link></li>
                            <li><Link href={`/${locale}#cara-kerja`} className="hover:text-brand-yellow transition-colors">Cara Kerja</Link></li>
                            <li><Link href={`/${locale}#studi-kasus`} className="hover:text-brand-yellow transition-colors">Studi Kasus</Link></li>
                            <li><a href="https://blog.crediblemark.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors">Insight</a></li>
                            <li><Link href={`/${locale}/contact`} className="hover:text-brand-yellow transition-colors">Kontak</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal (2 cols) */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Legal</h4>
                        <ul className="space-y-2.5 text-xs md:text-sm font-semibold">
                            <li><Link href={`/${locale}/terms`} className="hover:text-brand-yellow transition-colors">Ketentuan Layanan</Link></li>
                            <li><Link href={`/${locale}/privacy`} className="hover:text-brand-yellow transition-colors">Kebijakan Privasi</Link></li>
                            <li><a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors">Ketentuan Garansi</a></li>
                            <li><a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors">Kepemilikan Sistem</a></li>
                        </ul>
                    </div>

                    {/* Column 5: Kontak & Sosmed (2 cols) */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Kontak</h4>
                        <ul className="space-y-3.5 text-xs md:text-sm font-semibold text-zinc-500">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                                <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
                            </li>
                            {contactPhone && (
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{contactPhone}</a>
                                </li>
                            )}
                            <li className="text-[10px] uppercase tracking-wider text-zinc-600 mt-2 font-black leading-none">Jam Operasional:</li>
                            <li className="text-[11px] leading-relaxed">Senin - Jumat<br />09:00 - 17:00 WIB</li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar Layout */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[11px] text-zinc-600 font-semibold text-center md:text-left">
                        © {new Date().getFullYear()} {companyName}. Hak Cipta Dilindungi.
                    </div>
                    
                    {/* Social Media Links */}
                    <div className="flex items-center gap-4">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-brand-yellow transition-colors shadow-lg">
                            <Linkedin className="w-4 h-4 fill-zinc-500 hover:fill-brand-yellow" />
                        </a>
                        <a href="https://github.com/rasyiqi-code" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-brand-yellow transition-colors shadow-lg">
                            <Github className="w-4 h-4 fill-zinc-500 hover:fill-brand-yellow" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
