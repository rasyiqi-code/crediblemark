"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { DeleteServiceButton } from "./delete-service-button";
import { ExportPdfButton } from "./export-pdf-button";

interface ServiceData {
    id: string;
    title: string;
    title_id?: string | null;
    description: string;
    description_id?: string | null;
    price: number;
    discount?: number | null;
    currency?: string | null;
    interval: string;
    priceType: string;
    addons?: unknown;
    addons_id?: unknown;
}

interface ServiceActionButtonsProps {
    service: ServiceData;
}

export function ServiceActionButtons({ service }: ServiceActionButtonsProps) {
    return (
        <div 
            className="flex items-center gap-1 sm:gap-2 mr-2 relative z-20" 
            onClick={(e) => {
                // Mencegah klik tombol agar tidak mentrigger ekspansi accordion
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <ExportPdfButton service={service} />
            <Link href={`/admin/pm/services/${service.id}/edit`}>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                </Button>
            </Link>
            <DeleteServiceButton serviceId={service.id} />
        </div>
    );
}
