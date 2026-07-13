import Link from "next/link";
import { Check } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import Image from "next/image";
import { ChatTrigger } from "./chat-trigger";

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

    const showLogo = logoDisplayMode === "both" || logoDisplayMode === "logo";
    const showText = logoDisplayMode === "both" || logoDisplayMode === "text";

    return (
        <footer className="border-t border-white/5 bg-[#030303]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">

                    {/* Kiri: Logo */}
                    <div className="flex items-center gap-2">
                        {showLogo && (
                            logoUrl ? (
                                <div className="relative h-5 w-5 overflow-hidden rounded-full border border-white/10">
                                    <Image src={logoUrl} alt={agencyName} fill className="object-cover" sizes="20px" />
                                </div>
                            ) : (
                                <div className="h-5 w-5 rounded-full bg-brand-yellow flex items-center justify-center">
                                    <Check className="h-2.5 w-2.5 text-black stroke-[3]" />
                                </div>
                            )
                        )}
                        {showText && (
                            <span className="font-extrabold text-white tracking-tight text-xs uppercase italic">{agencyName}</span>
                        )}
                    </div>

                    {/* Tengah: Copyright */}
                    <p className="text-[11px] text-zinc-600 order-last sm:order-none">
                        © {new Date().getFullYear()} {companyName}. All Rights Reserved.
                    </p>

                    {/* Kanan: Links */}
                    <div className="flex items-center gap-5">
                        <a href="https://blog.crediblemark.com" target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                            Insight
                        </a>
                        <Link href={`/${locale}/privacy`} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                            Kebijakan Privasi
                        </Link>
                        <Link href={`/${locale}/terms`} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                            Ketentuan Layanan
                        </Link>
                        {contactPhone && (
                            <ChatTrigger 
                                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                Hubungi
                            </ChatTrigger>
                        )}
                    </div>

                </div>
            </div>
        </footer>
    );
}
