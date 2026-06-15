"use client";

import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Mail,
    Phone,
    Globe,
    MapPin,
    Hash,
    Calendar,
} from "lucide-react";

interface Lead {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phoneNumber: string | null;
    subject: string | null;
    message: string | null;
    source: string;
    path: string | null;
    locale: string | null;
    createdAt: string | Date;
}

interface LeadDetailDialogProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Dialog untuk menampilkan detail lengkap sebuah lead.
 * Diekstrak dari `leads-manager.tsx` agar dapat dikelola secara mandiri.
 */
export function LeadDetailDialog({ lead, isOpen, onClose }: LeadDetailDialogProps) {
    if (!lead) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-5xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-brand-yellow/20 via-transparent to-transparent p-5 pb-3 flex-none border-b border-white/5">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white">
                                        {lead.firstName} {lead.lastName}
                                    </DialogTitle>
                                    <DialogDescription className="text-zinc-400 flex items-center gap-2 mt-0.5 text-[11px]">
                                        <Calendar className="w-3 h-3" />
                                        Diterima pada {format(new Date(lead.createdAt), "dd MMMM yyyy, HH:mm")}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Kontak */}
                            <div className="space-y-1.5 flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Informasi Kontak</span>
                                <div className="flex-1 space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Email</span>
                                            <span className="text-sm font-medium truncate">{lead.email}</span>
                                        </div>
                                    </div>
                                    {lead.phoneNumber && (
                                        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Telepon</span>
                                                <span className="text-sm font-medium truncate">{lead.phoneNumber}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Konteks */}
                            <div className="space-y-1.5 flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Konteks</span>
                                <div className="flex-1 space-y-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Sumber</span>
                                            <Badge variant="outline" className="w-fit mt-0.5 bg-zinc-800/50 text-zinc-300 border-white/5 text-[10px] font-black uppercase tracking-widest px-2 py-0">
                                                {lead.source.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                    {lead.locale && (
                                        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Bahasa</span>
                                                <Badge variant="outline" className="w-fit mt-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold uppercase px-2 py-0">
                                                    {lead.locale}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigasi */}
                            <div className="space-y-1.5 flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Navigasi</span>
                                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group flex items-start gap-3 h-full">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Halaman Terakhir</span>
                                        <span className="text-sm font-mono break-all text-zinc-300 mt-0.5">
                                            {lead.path || "/"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-white/5" />

                        {/* Pesan */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pesan Lead</span>
                            <div className="p-4 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10 relative">
                                {lead.subject && (
                                    <div className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                                        {lead.subject}
                                    </div>
                                )}
                                {lead.message ? (
                                    <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap italic">
                                        &quot;{lead.message}&quot;
                                    </div>
                                ) : (
                                    <div className="text-sm text-zinc-600 italic">
                                        Tidak ada pesan yang disertakan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex justify-end flex-none">
                        <Button
                            variant="outline"
                            className="bg-transparent border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
                            onClick={onClose}
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
