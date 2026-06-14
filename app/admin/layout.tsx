
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header/main";
import { isAdmin, canManageProjects, canManageBilling } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { AdminSidebarNavigation } from "@/components/admin/admin-sidebar-navigation";
import { SidebarContainer } from "@/components/dashboard/sidebar/container";
import { SidebarContentWrapper } from "@/components/dashboard/sidebar/content-wrapper";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getSystemSettings } from "@/lib/server/settings";
import { SystemAlerts } from "@/components/admin/system-alerts";
import { cookies } from "next/headers";
import { RoleSwitcher } from "@/components/admin/role-switcher";
import { MidtransScript } from "@/components/payment/midtrans/script-loader";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ⚡ Bolt Optimization: Use getSystemSettings (which utilizes unstable_cache) instead of direct prisma query.
    // Impact: Avoids redundant database queries for static system settings on every page load/navigation within the admin panel.
    // Measurement: Next.js Cache Hit logs will show reduced DB query frequency for 'system-settings' tag.
    const settings = await getSystemSettings(["AGENCY_NAME", "AGENCY_LOGO"]);
    const agencyName = settings.find(s => s.key === "AGENCY_NAME")?.value || "Crediblemark";
    const logoUrl = settings.find(s => s.key === "AGENCY_LOGO")?.value;

    // Security Guard: Admin Only
    if (!await isAdmin()) {
        redirect('/dashboard');
    }

    // Pemeriksaan Peran & Akses
    const pmAccess = await canManageProjects();
    const financeAccess = await canManageBilling();

    // Membaca cookie peran aktif pilihan admin (jika ia memiliki kedua peran/Super Admin)
    const cookieStore = await cookies();
    const activeViewRole = cookieStore.get("admin_view_role")?.value || "admin";

    let effectivePmAccess = pmAccess;
    let effectiveFinanceAccess = financeAccess;

    if (pmAccess && financeAccess) {
        if (activeViewRole === "pm") {
            effectiveFinanceAccess = false;
        } else if (activeViewRole === "finance") {
            effectivePmAccess = false;
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-black">
            <SidebarContainer
                header={
                    <Link href="/admin" className="flex items-center gap-2 group">
                        {logoUrl ? (
                            <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                                <Image
                                    src={logoUrl}
                                    alt={agencyName}
                                    fill
                                    className="object-contain"
                                    sizes="36px"
                                />
                            </div>
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-sm font-bold text-white truncate max-w-[140px] leading-tight">
                                {agencyName}
                            </span>
                            <div className="flex mt-0.5">
                                {pmAccess && financeAccess ? (
                                    <RoleSwitcher currentRole={activeViewRole as "admin" | "pm" | "finance"} />
                                ) : (
                                    <Badge variant="outline" className="h-[18px] px-1.5 text-[9px] uppercase tracking-widest border-red-500/50 text-red-500 bg-red-500/10 font-black">
                                        Admin
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Link>
                }
                footer={
                    <Link
                        href="/dashboard"
                        className="flex w-full items-center gap-3 rounded-lg px-5 py-2 text-zinc-500 transition-all hover:text-white hover:bg-white/5"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="truncate group-data-[collapsed=true]:hidden transition-all duration-300">
                            Exit to Client View
                        </span>
                    </Link>
                }
            >
                <AdminSidebarNavigation
                    pmAccess={effectivePmAccess}
                    financeAccess={effectiveFinanceAccess}
                />
            </SidebarContainer>

            <SidebarContentWrapper>
                <DashboardHeader
                    agencyName={agencyName}
                    logoUrl={logoUrl ?? undefined}
                    navChildren={<AdminSidebarNavigation pmAccess={effectivePmAccess} financeAccess={effectiveFinanceAccess} />}
                    navFooter={
                        <Link
                            href="/dashboard"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-white hover:bg-white/5"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span className="truncate">Exit to Client View</span>
                        </Link>
                    }
                />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 min-w-0">
                    <SystemAlerts />
                    {children}
                </main>
            </SidebarContentWrapper>
            {/* Memuat script pembayaran Midtrans khusus untuk area admin */}
            <MidtransScript />
        </div>
    );
}
