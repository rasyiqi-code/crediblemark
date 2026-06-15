"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Globe, Eye, Calendar, ExternalLink, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getAdminPromotions, deletePromotionAction, updatePromotionAction } from "@/app/actions/marketing-admin";
import { PromotionDialog } from "./promotion-dialog";

interface Promotion {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    ctaText: string | null;
    ctaUrl: string | null;
    couponCode: string | null;
    isActive: boolean;
    startDate: string | Date | null;
    endDate: string | Date | null;
}

export function PromotionsManager() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const data = await getAdminPromotions();
            setPromotions(data.map((p: Promotion) => ({
                ...p,
                startDate: p.startDate instanceof Date ? p.startDate.toISOString() : p.startDate,
                endDate: p.endDate instanceof Date ? p.endDate.toISOString() : p.endDate,
            })));
        } catch {
            toast.error("Gagal memuat data promosi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (promo?: Promotion) => {
        if (promo) {
            setEditingPromo(promo);
        } else {
            setEditingPromo(null);
        }
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus promosi ini?")) return;

        try {
            await deletePromotionAction(id);
            toast.success("Promosi dihapus");
            fetchPromotions();
        } catch {
            toast.error("Gagal menghapus");
        }
    };

    const toggleStatus = async (promo: Promotion) => {
        try {
            await updatePromotionAction(promo.id, { isActive: !promo.isActive });
            fetchPromotions();
        } catch {
            toast.error("Gagal mengubah status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-6 h-6 text-brand-yellow" />
                        Manajemen Poster Promosi
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Kelola banner dan penawaran spesial di halaman publik.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                        <a href="/promosi" target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            Pratinjau
                        </a>
                    </Button>
                    <Button onClick={() => handleOpenDialog()} className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Promo
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden pt-4 border-t border-white/5">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[100px] text-zinc-400">Poster</TableHead>
                            <TableHead className="text-zinc-400">Info Promosi</TableHead>
                            <TableHead className="text-zinc-400">Kupon</TableHead>
                            <TableHead className="text-zinc-400">Periode</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-right text-zinc-400">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-white/5">
                                    <TableCell colSpan={6} className="h-20 animate-pulse bg-white/5" />
                                </TableRow>
                            ))
                        ) : promotions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-500">
                                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Belum ada promosi yang dibuat.</p>
                                        <Button 
                                            variant="link" 
                                            className="text-brand-yellow mt-2"
                                            onClick={() => handleOpenDialog()}
                                        >
                                            Buat Promo Sekarang
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            promotions.map((promo) => (
                                <TableRow key={promo.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell>
                                        <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                                            <Image 
                                                src={promo.imageUrl} 
                                                alt={promo.title} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm group-hover:text-brand-yellow transition-colors">{promo.title}</span>
                                            <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-[250px]">{promo.description || "Tidak ada deskripsi"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {promo.couponCode ? (
                                            <Badge variant="outline" className="bg-brand-yellow/5 text-brand-yellow border-brand-yellow/20 font-mono text-[10px] px-2 py-0.5">
                                                {promo.couponCode}
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] text-zinc-600 italic">Tanpa Kupon</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-[11px] text-zinc-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-zinc-600" />
                                                <span>Ends: {promo.endDate ? new Date(promo.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : "∞"}</span>
                                            </div>
                                            {promo.ctaUrl && (
                                                <div className="flex items-center gap-1.5 text-zinc-600 mt-0.5 max-w-[150px] truncate">
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span className="truncate">{promo.ctaUrl}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Switch 
                                                checked={promo.isActive} 
                                                onCheckedChange={() => toggleStatus(promo)}
                                                className="scale-75 data-[state=checked]:bg-brand-yellow"
                                            />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${promo.isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                                {promo.isActive ? 'Active' : 'Off'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10"
                                                onClick={() => handleOpenDialog(promo)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                onClick={() => handleDelete(promo.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isDialogOpen && (
                <PromotionDialog 
                    key={editingPromo?.id || "new-promo"}
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    editingPromo={editingPromo}
                    onSaveSuccess={() => {
                        setIsDialogOpen(false);
                        fetchPromotions();
                    }}
                />
            )}
        </div>
    );
}
