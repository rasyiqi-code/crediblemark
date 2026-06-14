import { ServiceActionButtons } from "@/components/admin/services/service-action-buttons";
import { PriceDisplay } from "@/components/providers/currency-provider";
import Image from "next/image";
import { prisma } from "@/lib/config/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, CreditCard, Zap } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/shared/auth-helpers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminHeaderSetter } from "@/components/admin/admin-header-setter";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
                            const displayDesc = (isId ? (service.description_id || service.description) : service.description).replace(/<[^>]*>?/gm, '');
                            const isSynced = !!service.creemProductId;

                            return (
                                <AccordionItem
                                    value={service.id}
                                    key={service.id}
                                    id={`service-item-${service.id}`}
                                    className="border border-zinc-800/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/80 bg-zinc-950/50 data-[state=open]:border-zinc-700/80 w-full max-w-full relative"
                                >
                                    <AccordionTrigger className="hover:no-underline px-4 py-3.5 cursor-pointer hover:bg-zinc-900/40 group pr-32">
                                        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                                {/* Status indicator dot — green if synced, amber if not */}
                                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${isSynced ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                                                {/* Title + price + date + badges */}
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <span className="font-medium text-white text-sm truncate block">{displayTitle}</span>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-zinc-500 mt-1">
                                                        <span className="truncate">
                                                            <PriceDisplay amount={service.price} baseCurrency={((service as Record<string, unknown>).currency as "USD" | "IDR") || 'USD'} />
                                                        </span>
                                                        <span className="hidden sm:inline-block text-zinc-700">•</span>
                                                        <span className="hidden sm:inline-block whitespace-nowrap">
                                                            {new Date(service.createdAt).toLocaleDateString()}
                                                        </span>

                                                        {/* Badges */}
                                                        <div className="flex flex-wrap items-center gap-1.5 ml-0 sm:ml-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`py-0 px-1.5 h-4 text-[10px] shrink-0 font-medium ${service.visibility === 'PRIVATE'
                                                                    ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                    }`}
                                                            >
                                                                {service.visibility === 'PRIVATE' ? (isId ? 'Private' : 'Private') : (isId ? 'Public' : 'Public')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    {/* Action buttons — moved outside to avoid nested <button> hydration error */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5">
                                        <ServiceActionButtons serviceId={service.id} />
                                    </div>

                                    <AccordionContent className="px-4 pb-4 pt-1 border-t border-zinc-800/40 overflow-hidden min-w-0">
                                        <div className="flex flex-col sm:flex-row items-start gap-4 mt-3">
                                            {/* Service Image — ukuran dibatasi agar responsive di mobile */}
                                            {service.image && (
                                                <div className="relative rounded-lg overflow-hidden border border-white/5 max-w-[200px] sm:w-56 md:w-64 aspect-video shrink-0 bg-black/30 self-start">
                                                    <Image
                                                        src={service.image}
                                                        alt={displayTitle}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 flex flex-col min-w-0">
                                                {/* Detail grid — matching projects style */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                                    <div className="flex items-center gap-2 group/detail">
                                                        <span className="text-zinc-600"><Package className="w-3.5 h-3.5" /></span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">Creem ID</span>
                                                            <span className={`text-xs font-mono truncate block ${isSynced ? 'text-zinc-400' : 'text-amber-500 italic'}`} title={service.creemProductId || undefined}>
                                                                {service.creemProductId || (isId ? 'Belum Sinkron' : 'Not Synced')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 group/detail">
                                                        <span className="text-zinc-600"><Zap className="w-3.5 h-3.5" /></span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">{isId ? 'Interval' : 'Interval'}</span>
                                                            <span className="text-xs text-zinc-400 font-medium">
                                                                {intervalLabel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 group/detail">
                                                        <span className="text-zinc-600"><CreditCard className="w-3.5 h-3.5" /></span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider block">{isId ? 'Model Harga' : 'Price Model'}</span>
                                                            <span className="text-xs text-zinc-400 font-medium">
                                                                {service.priceType === 'STARTING_AT' 
                                                                    ? (isId ? 'Investasi Dasar' : 'Starting At') 
                                                                    : (isId ? 'Harga Tetap' : 'Fixed Price')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tampilan daftar addon service */}
                                                {(() => {
                                                    const addons = (isId ? service.addons_id : service.addons) as Array<{ name: string; description?: string; price: number; currency?: string; interval?: string }> | null;
                                                    if (!addons || addons.length === 0) return null;
                                                    return (
                                                        <div className="mt-3 pt-3 border-t border-zinc-800/40">
                                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold block mb-2">
                                                                {isId ? 'Add-on Tersedia' : 'Available Add-ons'}
                                                            </span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                {addons.map((addon, idx) => (
                                                                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                                                                        <Plus className="w-3 h-3 text-brand-yellow mt-0.5 shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <span className="text-xs text-zinc-300 font-medium block truncate">{addon.name}</span>
                                                                            {addon.description && (
                                                                                <span className="text-[10px] text-zinc-600 block truncate">{addon.description}</span>
                                                                            )}
                                                                            <span className="text-[10px] text-brand-yellow font-mono font-bold">
                                                                                <PriceDisplay amount={addon.price} baseCurrency={(addon.currency as 'USD' | 'IDR') || service.currency as 'USD' | 'IDR' || 'USD'} />
                                                                                {addon.interval && addon.interval !== 'one_time' && (
                                                                                    <span className="text-zinc-600 ml-0.5">/{addon.interval === 'monthly' ? (isId ? 'bln' : 'mo') : (isId ? 'thn' : 'yr')}</span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
