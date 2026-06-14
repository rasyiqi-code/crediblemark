import { ServiceAccordionItem } from "@/components/admin/services/service-accordion-item";
import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
import { Accordion } from "@/components/ui/accordion";

export default async function ServicesPage() {
    // Strict Access Control: Only Admins can manage services
    if (!await isAdmin()) redirect('/dashboard');

    const services = await prisma.service.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en-US';
    const isId = locale === 'id-ID' || locale === 'id';

    return (
        <div className="w-full py-6">
            <AdminHeaderSetter
                title={
                    <span className="flex items-center gap-3">
                        {isId ? 'Katalog Layanan' : 'Service Catalog'}
                        <Package className="w-6 h-6 text-zinc-600" />
                    </span>
                }
                actions={
                    <Link href="/admin/pm/services/new" className="shrink-0">
                        <Button className="w-auto bg-white text-black hover:bg-zinc-200 h-9 text-xs font-bold px-2.5 sm:px-3 flex items-center justify-center">
                            <Plus className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">
                                {isId ? 'Buat Layanan' : 'Create Service'}
                            </span>
                        </Button>
                    </Link>
                }
            />

            <div className="w-full space-y-2">
                {services.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 py-16 text-center text-zinc-600 text-sm">
                        {isId ? 'Belum ada layanan.' : 'No services defined yet.'}
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-full space-y-2">
                        {services.map((service) => {
                            const intervalLabel = service.interval === 'one_time'
                                ? (isId ? 'Sekali Bayar' : 'One Time')
                                : (isId ? (service.interval === 'monthly' ? 'Bulanan' : 'Tahunan') : service.interval);
                            const displayTitle = isId ? (service.title_id || service.title) : service.title;

                            return (
                                <ServiceAccordionItem
                                    key={service.id}
                                    service={service}
                                    displayTitle={displayTitle}
                                    intervalLabel={intervalLabel}
                                    isId={isId}
                                />
                            );
                        })}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
