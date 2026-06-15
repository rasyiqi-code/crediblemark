"use client";

import Link from "next/link";
import { LayoutDashboard, Layers, ShoppingCart, Settings, Package, Mail, Users, Megaphone, ShieldCheck, MessageSquare, Images, Repeat, UserPlus, Sparkles, Puzzle } from "lucide-react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/shared/utils";
import { useSyncExternalStore, type ComponentType } from "react";
import { useTranslations } from "next-intl";

const subscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

import { usePathname } from "next/navigation";

export function SidebarLink({ href, icon: Icon, label, iconClass }: { href: string; icon: ComponentType<{ className?: string }>; label: string; iconClass?: string }) {
    const { isCollapsed } = useSidebarStore();
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const collapsed = isClient ? isCollapsed : false;
    const pathname = usePathname();
    const cleanHrefPath = href.split('?')[0];
    const isActive = pathname === cleanHrefPath || (
        cleanHrefPath !== '/admin' &&
        cleanHrefPath !== '/dashboard' &&
        cleanHrefPath !== '/' &&
        pathname?.startsWith(cleanHrefPath)
    );

    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5 cursor-pointer",
                isActive ? "text-brand-yellow bg-brand-yellow/10" : "text-zinc-400 hover:text-white",
                "group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2"
            )}
        >
            <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
            <span className="truncate group-data-[collapsed=true]:hidden">{label}</span>
        </Link>
    );
}

export function SidebarSectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-3 mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate transition-all duration-300 group-data-[collapsed=true]:h-0 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:my-0 group-data-[collapsed=true]:py-0 group-data-[collapsed=true]:pointer-events-none group-data-[collapsed=true]:overflow-hidden">
            {children}
        </div>
    );
}

export function SidebarSuperAdmin() {
    const t = useTranslations("Dashboard.Sidebar");

    return (
        <>
            {/* Overview utama */}
            <SidebarLink href="/admin" icon={LayoutDashboard} label={t("overview")} />

            {/* 1. OPERASIONAL AGENSI */}
            <SidebarSectionHeader>Agency Ops</SidebarSectionHeader>
            <SidebarLink href="/admin/pm/projects" icon={Layers} label={t("missionBoard")} />
            <SidebarLink href="/admin/pm/services" icon={Package} label={t("serviceCatalog")} />
            <SidebarLink href="/admin/pm/addons" icon={Puzzle} label={t("addons")} />
            <SidebarLink href="/admin/clients" icon={Users} label={t("clients")} />
            <SidebarLink href="/admin/support" icon={Mail} label={t("supportInbox")} />

            {/* 2. KEUANGAN & TRANSAKSI AGENSI */}
            <SidebarSectionHeader>Finance & Billing (Agency)</SidebarSectionHeader>
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label="Direct Orders" />
            <SidebarLink href="/admin/finance/quotes" icon={MessageSquare} label="Offline Trx" />
            <SidebarLink href="/admin/finance/subscriptions" icon={Repeat} label="Subscriptions" />

            {/* 3. PEMASARAN & AUDIENS (SERVICES) */}
            <SidebarSectionHeader>Campaigns & Leads</SidebarSectionHeader>
            <SidebarLink href="/admin/marketing/promotions" icon={Megaphone} label="Visual Promos" />
            <SidebarLink href="/admin/marketing/popups" icon={Sparkles} label="Promotional Popups" />
            <SidebarLink href="/admin/portfolio" icon={Images} label="Portfolio Admin" />
            <SidebarLink href="/admin/testimonials" icon={MessageSquare} label="Testimonials" />
            <SidebarLink href="/admin/marketing/leads" icon={UserPlus} label="Contact Leads" />
            <SidebarLink href="/admin/marketing/subscribers" icon={Mail} label="Newsletter Subs" />

            {/* 4. SISTEM & KONFIGURASI */}
            <SidebarSectionHeader>System & Tools</SidebarSectionHeader>
            <SidebarLink href="/admin/media" icon={Images} label="Media Library" />
            <SidebarLink href="/admin/team" icon={ShieldCheck} label="Team Roles" />
            <SidebarLink href="/admin/system/settings" icon={Settings} label={t("system")} />
        </>
    );
}

export function SidebarFinance() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("financeConsole")}</SidebarSectionHeader>
            <SidebarLink href="/admin/finance" icon={LayoutDashboard} label={t("dashboard")} />
            <SidebarLink href="/admin/finance/orders" icon={ShoppingCart} label="Direct Orders" />
            <SidebarLink href="/admin/finance/quotes" icon={MessageSquare} label="Offline Trx" />
            <SidebarLink href="/admin/finance/subscriptions" icon={Repeat} label="Subscriptions" />
        </>
    );
}

export function SidebarPM() {
    const t = useTranslations("Dashboard.Sidebar");
    return (
        <>
            <SidebarSectionHeader>{t("projectConsole")}</SidebarSectionHeader>
            <SidebarLink href="/admin/pm" icon={LayoutDashboard} label={t("dashboard")} />
            <SidebarLink href="/admin/pm/projects" icon={Layers} label={t("missionBoard")} />
            <SidebarLink href="/admin/pm/services" icon={Package} label={t("serviceCatalog")} />
            <SidebarLink href="/admin/pm/addons" icon={Puzzle} label={t("addons")} />
            <SidebarLink href="/admin/media" icon={Images} label="Media" />
        </>
    );
}
