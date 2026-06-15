"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Search, Mail, User, Phone, Globe, Navigation, Eye } from "lucide-react";
import { toast } from "sonner";
import { getLeadsAction, deleteLeadAction } from "@/app/actions/marketing-admin";
import { LeadDetailDialog } from "./lead-detail-dialog";

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

export function LeadsManager() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const result = await getLeadsAction();
            if (!result.success) throw new Error(result.error);
            setLeads(result.data!);
        } catch {
            toast.error("Gagal memuat leads");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus lead ini?")) return;
        try {
            const result = await deleteLeadAction(id);
            if (!result.success) throw new Error(result.error);

            toast.success("Lead berhasil dihapus");
            loadLeads();
        } catch {
            toast.error("Gagal menghapus lead");
        }
    };

    // Membungkus filter array dengan useMemo untuk optimasi performa render
    const filteredLeads = useMemo(() => {
        return leads.filter(l =>
            l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (l.lastName && l.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (l.subject && l.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [leads, searchQuery]);

    const handleViewLead = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDetailsOpen(true);
    };

    return (
        <div className="grid gap-4 md:gap-6">
            <div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                        placeholder="Cari email, nama, atau subjek..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-black/50 border-white/10 text-sm"
                    />
                </div>
            </div>

            <div className="overflow-hidden overflow-x-auto custom-scrollbar pt-4 border-t border-white/5">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table className="min-w-[1000px]">
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-xs h-10">Lead</TableHead>
                                <TableHead className="text-xs h-10">Kontak</TableHead>
                                <TableHead className="text-xs h-10">Sumber & Konteks</TableHead>
                                <TableHead className="text-xs h-10">Pesan</TableHead>
                                <TableHead className="text-xs h-10">Tanggal</TableHead>
                                <TableHead className="text-right text-xs h-10">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-sm">Memuat...</TableCell>
                                </TableRow>
                            ) : filteredLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-sm">
                                        {searchQuery ? "Lead tidak ditemukan." : "Belum ada lead."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <TableRow key={lead.id} className="border-white/5">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="grid">
                                                    <span className="font-bold text-white text-sm uppercase tracking-tight">
                                                        {lead.firstName} {lead.lastName}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                    <Mail className="w-3 h-3 opacity-50" />
                                                    {lead.email}
                                                </div>
                                                {lead.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                                                        <Phone className="w-2.5 h-2.5 opacity-40" />
                                                        {lead.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                        {lead.source.replace('_', ' ')}
                                                    </span>
                                                    {lead.locale && (
                                                        <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold uppercase">
                                                            <Globe className="w-2.5 h-2.5" />
                                                            {lead.locale}
                                                        </span>
                                                    )}
                                                </div>
                                                {lead.path && (
                                                    <div className="flex items-center gap-1 text-[9px] text-zinc-600 truncate max-w-[150px]">
                                                        <Navigation className="w-2.5 h-2.5 opacity-30" />
                                                        {lead.path}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell 
                                            className="max-w-[250px] cursor-pointer hover:bg-white/5 transition-colors"
                                            onClick={() => handleViewLead(lead)}
                                        >
                                            <div className="space-y-1">
                                                {lead.subject && (
                                                    <div className="text-[11px] font-bold text-zinc-300 truncate">
                                                        {lead.subject}
                                                    </div>
                                                )}
                                                {lead.message && (
                                                    <div className="text-[10px] text-zinc-500 italic line-clamp-2 leading-relaxed">
                                                        &quot;{lead.message}&quot;
                                                    </div>
                                                )}
                                                {!lead.subject && !lead.message && (
                                                    <span className="text-[10px] text-zinc-700 italic">No message</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-500 text-[11px] font-medium font-mono uppercase">
                                            {format(new Date(lead.createdAt), 'MMM dd, HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-zinc-600 hover:text-brand-yellow hover:bg-brand-yellow/10"
                                                    onClick={() => handleViewLead(lead)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => handleDelete(lead.id)}
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

                {/* Mobile View */}
                <div className="block md:hidden divide-y divide-white/5">
                    {isLoading ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">Memuat...</div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-10" />
                            <p className="text-xs font-bold uppercase tracking-widest">{searchQuery ? "Tidak ditemukan" : "Belum ada lead"}</p>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div key={lead.id} className="p-3 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-white text-[13px] tracking-tight uppercase truncate">{lead.firstName} {lead.lastName}</div>
                                            <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                                                <Mail className="w-2.5 h-2.5 opacity-40 shrink-0" />
                                                <span className="text-[10px] font-medium truncate">{lead.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                                        onClick={() => handleDelete(lead.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-1.5 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                        {lead.source.replace('_', ' ')}
                                    </span>
                                    {lead.locale && (
                                        <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold uppercase">
                                            <Globe className="w-2.5 h-2.5" />
                                            {lead.locale}
                                        </span>
                                    )}
                                    {lead.phoneNumber && (
                                        <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
                                            <Phone className="w-2.5 h-2.5 opacity-40 shrink-0" />
                                            {lead.phoneNumber}
                                        </span>
                                    )}
                                </div>

                                <div 
                                    className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1 cursor-pointer active:bg-white/5"
                                    onClick={() => handleViewLead(lead)}
                                >
                                    {lead.subject && (
                                        <div className="text-[11px] font-bold text-zinc-300 truncate">
                                            {lead.subject}
                                        </div>
                                    )}
                                    {lead.message && (
                                        <div className="text-[10px] text-zinc-500 italic line-clamp-3 leading-relaxed">
                                            &quot;{lead.message}&quot;
                                        </div>
                                    )}
                                    {!lead.subject && !lead.message && (
                                        <span className="text-[10px] text-zinc-700 italic">No message</span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-1 text-[9px] text-zinc-600 truncate max-w-[150px]">
                                        {lead.path && (
                                            <>
                                                <Navigation className="w-2.5 h-2.5 opacity-30 shrink-0" />
                                                <span className="truncate">{lead.path}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">
                                        {format(new Date(lead.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <LeadDetailDialog
                lead={selectedLead}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            />
        </div>
    );
}
