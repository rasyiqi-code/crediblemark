
import Link from "next/link";
import { Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";
import { DashboardSidebarNavigation, DashboardSidebarFooter } from "@/components/dashboard/sidebar/navigation";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getSystemSettings } from "@/lib/server/settings";
import { MidtransScript } from "@/components/payment/midtrans/script-loader";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth gate: pastikan user login sebelum akses dashboard
    const user = await hexclaveServerApp.getUser();
    if (!user) {
        redirect('/handler/sign-in');
    }

    // ⚡ Bolt Optimization: Use getSystemSettings (which utilizes unstable_cache) instead of direct prisma query.
    // Impact: Avoids redundant database queries for static system settings on every page load/navigation within the dashboard.
    // Measurement: Next.js Cache Hit logs will show reduced DB query frequency for 'system-settings' tag.
    const settings = await getSystemSettings(["AGENCY_NAME", "AGENCY_LOGO"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const logoUrl = settings.find(s => s.key === "AGENCY_LOGO")?.value;

    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            <SidebarContainer
                header={
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        {logoUrl ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-contain"
                                    sizes="32px"
                                />
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-brand-grey flex items-center justify-center shrink-0">
                                <Check className="h-5 w-5 text-brand-yellow stroke-[3]" />
                            </div>
                        )}
                        <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 truncate transition-all duration-300">
                            {agencyName}
                        </span>
                    </Link>
                }
                footer={<DashboardSidebarFooter />}
            >
                <DashboardSidebarNavigation />
            </SidebarContainer>

            <SidebarContentWrapper>
                <DashboardHeader agencyName={agencyName} logoUrl={logoUrl} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarContentWrapper>
            {/* Memuat script pembayaran Midtrans khusus untuk area dashboard */}
            <MidtransScript />
        </div>
    );
}
