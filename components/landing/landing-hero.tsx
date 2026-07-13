import { HeroContent } from "@/components/landing/hero-content";
import { SystemSetting } from "@prisma/client";
import { getSystemSettings } from "@/lib/server/settings";

export async function LandingHero() {
    // Fetch Agency Name & Phone
    // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
    const settings = await getSystemSettings(["AGENCY_NAME", "CONTACT_PHONE"]);
    const agencyName = settings.find((s: SystemSetting) => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const contactPhone = settings.find((s: SystemSetting) => s.key === "CONTACT_PHONE")?.value;
    const waUrl = contactPhone ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Halo%20Crediblemark%2C%20saya%20tertarik%20berkonsultasi%20mengenai%20sistem%20digital` : "#";

    return (
        <section className="relative pt-6 pb-20 md:pt-24 md:pb-0 overflow-hidden min-h-[90vh] flex items-center justify-center">
            <HeroContent agencyName={agencyName} waUrl={waUrl} />
        </section>
    );
}
