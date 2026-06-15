"use client";

import { useState } from "react";
import { FinanceData } from "@/components/admin/finance/finance-columns";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import { FinanceListItem } from "./finance-list-item";
import { FilterButton } from "./filter-button";

interface FinanceListProps {
    data: FinanceData[];
}

type FilterStatus = 'ALL' | 'PAID' | 'PENDING' | 'PARTIAL';

export function FinanceList({ data }: FinanceListProps) {
    const t = useTranslations("Admin.Finance");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filteredData = data.filter(item => {
        // Search Logic
        const matchesSearch =
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.project?.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter Logic
        let matchesFilter = true;
        const isPaid = item.status === 'paid' || item.status === 'settled';
        const isPending = item.status === 'pending_payment' || item.status === 'pending' || item.status === 'payment_pending';
        const isPartial = item.project?.paymentStatus === 'PARTIAL';
        const isRepayment = item.paymentType === 'REPAYMENT';

        if (statusFilter === 'PAID') matchesFilter = isPaid;
        if (statusFilter === 'PENDING') {
            matchesFilter = (isPending && !isPartial) || (isPending && isPartial && isRepayment);
        }
        if (statusFilter === 'PARTIAL') {
            matchesFilter = isPartial && (!isPending || !isRepayment);
        }

        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (newFilter: FilterStatus) => {
        setStatusFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const getCount = (filter: FilterStatus) => {
        return data.filter(item => {
            const isPaid = item.status === 'paid' || item.status === 'settled';
            const isPending = item.status === 'pending_payment' || item.status === 'pending' || item.status === 'payment_pending';
            const isPartial = item.project?.paymentStatus === 'PARTIAL';
            const isRepayment = item.paymentType === 'REPAYMENT';

            if (filter === 'ALL') return true;
            if (filter === 'PAID') return isPaid;
            if (filter === 'PENDING') return (isPending && !isPartial) || (isPending && isPartial && isRepayment);
            if (filter === 'PARTIAL') return isPartial && (!isPending || !isRepayment);
            return false;
        }).length;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-md py-3 md:py-4 border-b border-white/5 -mx-4 sm:-mx-6 px-4 sm:px-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search invoices, clients, or projects..."
                        className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-brand-yellow/50 focus:ring-brand-yellow/20 rounded-full"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-white/5 overflow-x-auto max-w-[85vw] md:max-w-full no-scrollbar">
                    <FilterButton
                        label="All"
                        active={statusFilter === 'ALL'}
                        count={getCount('ALL')}
                        onClick={() => handleFilterChange('ALL')}
                    />
                    <FilterButton
                        label="Pending"
                        active={statusFilter === 'PENDING'}
                        count={getCount('PENDING')}
                        onClick={() => handleFilterChange('PENDING')}
                        color="text-amber-500"
                    />
                    <FilterButton
                        label="Partial (DP)"
                        active={statusFilter === 'PARTIAL'}
                        count={getCount('PARTIAL')}
                        onClick={() => handleFilterChange('PARTIAL')}
                        color="text-indigo-400"
                    />
                    <FilterButton
                        label="Paid"
                        active={statusFilter === 'PAID'}
                        count={getCount('PAID')}
                        onClick={() => handleFilterChange('PAID')}
                        color="text-emerald-500"
                    />
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                    <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                        <Filter className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-400 font-medium">{t("noOrders")}</h3>
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
                        <FinanceListItem key={item.id} data={item} />
                    ))}
                </Accordion>
            )}

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
