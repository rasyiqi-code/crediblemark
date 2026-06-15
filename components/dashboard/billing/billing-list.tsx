"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, LayoutGrid, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import "@/types/payment";
import { BillingListItem } from "./billing-list-item";

export interface BillingOrder {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    snapToken: string | null;
    type: string;
    project: {
        title: string;
        description?: string | null;
        invoiceId: string | null;
        estimateId: string | null;
        paymentStatus?: string | null;
    } | null;
}

interface BillingListProps {
    orders: BillingOrder[];
}

type FilterStatus = 'ALL' | 'PAID' | 'PENDING' | 'WAITING_VERIFICATION';

export function BillingList({ orders }: BillingListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = orders.filter(item => {
        // Search Logic
        const matchesSearch =
            item.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter Logic
        let matchesFilter = true;

        if (statusFilter === 'PAID') matchesFilter = item.status === 'paid' || item.status === 'settled';
        if (statusFilter === 'PENDING') matchesFilter = item.status === 'pending';
        if (statusFilter === 'WAITING_VERIFICATION') matchesFilter = item.status === 'waiting_verification';

        return matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (newFilter: FilterStatus) => {
        setStatusFilter(newFilter);
        setCurrentPage(1); // Reset to first page
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const getCount = (filter: FilterStatus) => {
        return orders.filter(item => {
            if (filter === 'ALL') return true;
            if (filter === 'PAID') return item.status === 'paid' || item.status === 'settled';
            if (filter === 'PENDING') return item.status === 'pending';
            if (filter === 'WAITING_VERIFICATION') return item.status === 'waiting_verification';
            return false;
        }).length;
    }

    return (
        <div className="space-y-6">
            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 px-1 border-b border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search invoices or projects..."
                        className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-brand-yellow/50 focus:ring-brand-yellow/20 rounded-full"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                    <BillingFilterButton
                        label="All"
                        icon={<LayoutGrid className="w-3.5 h-3.5" />}
                        active={statusFilter === 'ALL'}
                        count={getCount('ALL')}
                        onClick={() => handleFilterChange('ALL')}
                    />
                    <BillingFilterButton
                        label="Pending"
                        icon={<Clock className="w-3.5 h-3.5" />}
                        active={statusFilter === 'PENDING'}
                        count={getCount('PENDING')}
                        onClick={() => handleFilterChange('PENDING')}
                        color="text-brand-yellow"
                    />
                    <BillingFilterButton
                        label="Waiting Verification"
                        icon={<Hourglass className="w-3.5 h-3.5" />}
                        active={statusFilter === 'WAITING_VERIFICATION'}
                        count={getCount('WAITING_VERIFICATION')}
                        onClick={() => handleFilterChange('WAITING_VERIFICATION')}
                        color="text-blue-500"
                    />
                    <BillingFilterButton
                        label="Paid"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        active={statusFilter === 'PAID'}
                        count={getCount('PAID')}
                        onClick={() => handleFilterChange('PAID')}
                        color="text-emerald-500"
                    />
                </div>
            </div>

            {/* List Content */}
            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                    <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                        <Filter className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-400 font-medium">No billing history found</h3>
                    <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or search query</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchQuery(""); handleFilterChange('ALL'); }}
                        className="text-brand-yellow mt-2"
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <Accordion type="single" collapsible className="space-y-2 mt-4">
                    {paginatedData.map((item) => (
                        <BillingListItem key={item.id} order={item} />
                    ))}
                </Accordion>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="text-xs text-zinc-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-zinc-400 tabular-nums">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
// FilterButton lokal untuk billing (mendukung prop icon untuk versi mobile)
function BillingFilterButton({
    label, icon, active, onClick, count, color,
}: {
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
    count: number;
    color?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2
                ${active ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}
            `}
            title={label}
        >
            <span className={`block sm:hidden ${active && color ? color : ""}`}>{icon}</span>
            <span className={`hidden sm:block ${active && color ? color : ""}`}>{label}</span>
            <span className={`px-1.5 py-0.5 rounded-full bg-zinc-950 text-[10px] min-w-[20px] text-center ${active ? "text-white" : "text-zinc-600"}`}>
                {count}
            </span>
        </button>
    );
}
