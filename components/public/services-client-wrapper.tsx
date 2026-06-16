"use client";

import { useEffect, useState } from "react";
import { Sparkles, Search, Shuffle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ServiceListItem } from "./services/service-list-item";
import { getDailyRandomSeed, shuffleArray } from "@/lib/shared/utils";

interface Service {
    id: string;
    title: string;
    title_id?: string | null;
    slug?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    currency?: string | null;
    interval: string;
    features: unknown;
    features_id?: unknown;
    image: string | null;
}

interface ServicesClientWrapperProps {
    services: Service[];
    pageTitle?: string | null;
}

export function ServicesClientWrapper({ services, pageTitle }: ServicesClientWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [randomServices, setRandomServices] = useState<Service[]>(() => {
        if (services && services.length > 0) {
            const seed = getDailyRandomSeed();
            return shuffleArray(services, seed).slice(0, 3);
        }
        return [];
    });

    const isId = pathname.startsWith("/id") || pathname.includes("/id/");

    const handleShuffle = () => {
        if (services.length <= 3) {
            toast.info(isId ? "Tidak cukup layanan untuk diacak" : "Not enough services to shuffle");
            return;
        }
        const shuffled = shuffleArray(services).slice(0, 3);
        setRandomServices(shuffled);
        toast.success(isId ? "Layanan berhasil diacak secara instan!" : "Services shuffled instantly!");
    };
    // Helper: serialize Json field apapun bentuknya menjadi string yang bisa dicari
    const jsonToSearchText = (val: unknown): string => {
        if (!val) return "";
        if (typeof val === "string") return val;
        // Array of strings atau objects — JSON.stringify lalu strip tanda kutip & kurung
        return JSON.stringify(val).replace(/["\[\]{}]/g, " ");
    };

    // Filter reaktif terhadap daftar layanan berdasarkan input pencarian
    const filteredServices = services.filter((service) => {
        const q = searchQuery.toLowerCase();
        const titleText = ((isId ? service.title_id : null) || service.title || "").toLowerCase();

        // Strip HTML tags dari deskripsi agar pencarian tidak terganggu tag HTML
        const rawDesc = (isId ? service.description_id : null) || service.description || "";
        const descText = rawDesc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").toLowerCase();

        // Serialize Json features ke teks — handles array, object, maupun string
        const featuresRaw = isId ? service.features_id : service.features;
        const featuresText = jsonToSearchText(featuresRaw).toLowerCase();

        const match = titleText.includes(q) || descText.includes(q) || featuresText.includes(q);

        // Debug log — hapus setelah masalah teratasi
        if (searchQuery.length > 0) {
            console.log(`[SEARCH] "${q}" | "${service.title}" => title:${titleText.includes(q)} desc:${descText.includes(q)} feat:${featuresText.includes(q)} → ${match}`);
        }

        return match;
    });

    useEffect(() => {
        // Handle post-login checkout
        const action = searchParams.get('action');
        if (action === 'checkout') {
            const pendingServiceId = sessionStorage.getItem('pendingServiceCheckout');
            if (pendingServiceId) {
                sessionStorage.removeItem('pendingServiceCheckout');

                // Trigger checkout for the pending service
                const proceedToCheckout = async () => {
                    try {
                        const res = await fetch("/api/estimates", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ serviceId: pendingServiceId })
                        });

                        const data = await res.json();

                        if (!res.ok) {
                            toast.error(data.error || "Failed to create order");
                            return;
                        }

                        if (data.id) {
                            router.push(`/checkout/${data.id}`);
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to proceed to checkout");
                    }
                };

                proceedToCheckout();
            }
        }
    }, [searchParams, router]);

    const st = useTranslations("Services");

    return (
        <div className="relative bg-black overflow-hidden min-h-[70vh]">
            {/* Landing Style Background */}
            <div className="absolute inset-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>

            <div className="container mx-auto px-4 pt-6 pb-16 sm:py-24 relative z-10">
                <div className="mb-12 text-center max-w-3xl mx-auto flex flex-col items-center justify-center mt-8">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-yellow/10 rounded-2xl mb-6 ring-1 ring-brand-yellow/20 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                        <Sparkles className="w-6 h-6 text-brand-yellow" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
                        {pageTitle || st("title")}
                    </h1>
                    <p className="text-zinc-400 text-base sm:text-lg max-w-2xl font-medium">
                        {isId ? "Eksplorasi layanan terbaik untuk mendukung bisnis Anda." : "Explore the best services to support your business."}
                    </p>
                </div>

                {/* Bilah Pencarian Jasa Premium */}
                <div className="mb-16 max-w-2xl mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-0">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-yellow/40 via-brand-yellow/10 to-brand-yellow/30 rounded-2xl opacity-40 group-hover:opacity-75 transition duration-500 group-focus-within:opacity-100" />
                        <div className="relative flex items-center bg-zinc-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-white/20 group-focus-within:border-brand-yellow/50 group-focus-within:ring-2 group-focus-within:ring-brand-yellow/20">
                            <div className="flex items-center justify-center pl-6">
                                <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-brand-yellow transition-colors duration-300" />
                            </div>
                            <input
                                type="text"
                                placeholder={isId ? `${services.length} layanan tersedia, ketik untuk cari.` : `${services.length} services available, type to search.`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent py-4 sm:py-5 pl-4 pr-20 text-white placeholder-zinc-500 focus:outline-none text-base font-medium"
                            />
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 text-xs font-bold text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg transition-all"
                                >
                                    {isId ? "Hapus" : "Clear"}
                                </button>
                            ) : (
                                <div className="absolute right-4 flex items-center pointer-events-none">
                                    <kbd className="hidden sm:flex items-center gap-1 bg-white/5 text-zinc-500 text-[10px] font-mono px-2 py-1 rounded border border-white/10">
                                        Enter <span className="text-xs leading-none">↵</span>
                                    </kbd>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Daily Random Services (Tampil saat tidak melakukan search) */}
                {searchQuery.length === 0 && randomServices.length > 0 && (
                    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                                {isId ? "Rekomendasi Layanan Hari Ini" : "Today's Recommended Services"}
                            </span>
                            <button
                                onClick={handleShuffle}
                                className="flex items-center gap-1.5 text-xs text-brand-yellow hover:text-yellow-300 font-bold tracking-wide transition-all duration-300 cursor-pointer bg-transparent border-0 p-0 text-left group"
                            >
                                <Shuffle className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
                                {isId ? "Acak Layanan" : "Shuffle Services"}
                            </button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {randomServices.map((service, idx) => (
                                <ServiceListItem
                                    key={`random-${service.id}`}
                                    service={service}
                                    isId={isId}
                                    indexNumber={idx + 1}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Hasil Pencarian List Premium */}
                {searchQuery.length > 0 && filteredServices.length > 0 && (
                    <div className="max-w-4xl mx-auto divide-y divide-white/5 animate-in fade-in slide-in-from-top-3 duration-500">
                        {filteredServices.map((service, idx) => (
                            <ServiceListItem key={service.id} service={service} isId={isId} indexNumber={idx + 1} />
                        ))}
                    </div>
                )}

                {/* State Kosong (Tidak ada hasil cocok) */}
                {searchQuery.length > 0 && filteredServices.length === 0 && (
                    <div className="max-w-md mx-auto text-center py-16 bg-zinc-950/20 border-b border-white/5 rounded-none p-6 shadow-xl animate-in fade-in duration-300">
                        <p className="text-zinc-400 text-sm font-semibold">
                            {isId ? "Tidak ada layanan yang cocok dengan pencarian Anda." : "No services match your search query."}
                        </p>
                        <p className="text-zinc-600 text-xs mt-1">
                            {isId ? "Silakan coba dengan kata kunci lain." : "Please try using different keywords."}
                        </p>
                    </div>
                )}

                {/* Jika database kosong secara keseluruhan */}
                {services.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-zinc-950/30 rounded-none border-b border-white/5 max-w-4xl mx-auto">
                        <p className="text-zinc-500 text-lg font-medium">
                            {isId ? "Belum ada layanan publik yang tersedia saat ini." : "No services available publicly at the moment."}
                        </p>
                        <p className="text-zinc-600 text-sm mt-2">
                            {isId ? "Silakan periksa kembali beberapa saat lagi." : "Check back soon for updates."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
