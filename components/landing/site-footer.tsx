import Link from "next/link";
import { Check, Mail, Github } from "lucide-react";
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

    const navLinks = [
        { label: "Layanan", href: `/${locale}/services` },
        { label: "Portfolio", href: `/${locale}/portfolio` },
        { label: "WordPress", href: `/${locale}/wordpress` },
        { label: "Web Repair", href: `/${locale}/web-repair` },
        { label: "Kalkulator", href: `/${locale}/price-calculator` },
        { label: "Insight", href: "https://blog.crediblemark.com", external: true },
    ];

    const legalLinks = [
        { label: "Ketentuan Layanan", href: `/${locale}/terms` },
        { label: "Kebijakan Privasi", href: `/${locale}/privacy` },
    ];

    return (
        <footer className="border-t border-white/5 bg-[#030303] text-zinc-500 py-10 relative">
            <div className="container mx-auto px-6 max-w-5xl">

                {/* Main Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">

                    {/* Brand */}
                    <div className="flex flex-col gap-3 max-w-xs">
                        <div className="flex items-center gap-2">
                            {showLogo && (
                                logoUrl ? (
                                    <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/10">
                                        <Image src={logoUrl} alt={agencyName} fill className="object-cover" sizes="24px" />
                                    </div>
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-brand-yellow flex items-center justify-center">
                                        <Check className="h-3 w-3 text-black stroke-[3]" />
                                    </div>
                                )
                            )}
                            {showText && (
                                <span className="font-extrabold text-white tracking-tight text-sm uppercase italic">{agencyName}</span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                            {t("desc")}
                        </p>
                        {/* Kontak singkat */}
                        <div className="flex flex-col gap-1.5 mt-1">
                            <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                {email}
                            </a>
                            {contactPhone && (
                                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors pl-5">
                                    {contactPhone}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 sm:max-w-sm">
                        {navLinks.map((link) =>
                            link.external ? (
                                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-zinc-500 hover:text-white transition-colors">
                                    {link.label}
                                </a>
                            ) : (
                                <Link key={link.label} href={link.href}
                                    className="text-xs text-zinc-500 hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            )
                        )}
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-zinc-700">
                        © {new Date().getFullYear()} {companyName}. Hak Cipta Dilindungi.
                    </p>
                    <div className="flex items-center gap-4">
                        {legalLinks.map((link) => (
                            <Link key={link.label} href={link.href} className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                        <a href="https://github.com/rasyiqi-code" target="_blank" rel="noopener noreferrer"
                            className="text-zinc-700 hover:text-zinc-400 transition-colors">
                            <Github className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
