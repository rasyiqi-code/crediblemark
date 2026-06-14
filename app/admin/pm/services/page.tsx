import { ServiceAccordionItem } from "@/components/admin/services/service-accordion-item";
import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
import { Accordion } from "@/components/ui/accordion";
import { getTranslations } from "next-intl/server";

export default async function ServicesPage() {
    // Strict Access Control: Only Admins can manage services
    if (!await isAdmin()) redirect('/dashboard');

    const services = await prisma.service.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const t = await getTranslations("Admin.Services");

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter
                title={
                    <span className="flex items-center gap-3">
                        <span className="hidden sm:inline">{t("catalogTitle")}</span>
                        <span className="sm:hidden">{t("mobileTitle")}</span>
                        <Package className="w-6 h-6 text-zinc-600 hidden sm:inline-block" />
                    </span>
                }
                actions={
                    <Link href="/admin/pm/services/new" className="shrink-0">
                        <Button className="w-auto bg-white text-black hover:bg-zinc-200 h-9 text-xs font-bold px-2.5 sm:px-3 flex items-center justify-center">
                            <Plus className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">
                                {t("createService")}
                            </span>
                        </Button>
                    </Link>
                }
            />

            <div className="w-full space-y-2">
                {services.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                        {t("noServices")}
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-full space-y-2">
                        {services.map((service) => (
                            <ServiceAccordionItem
                                key={service.id}
                                service={service}
                            />
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
