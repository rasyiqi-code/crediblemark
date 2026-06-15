"use client";

import {
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    User,
    Copy,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PriceDisplay } from "@/components/providers/currency-provider";
import { toast } from "sonner";
import { ConfirmPaymentButton } from "@/components/admin/orders/confirm-payment";
import { UnpaidButton } from "@/components/admin/orders/unpaid-button";
import { ViewProofButton } from "@/components/admin/orders/view-proof-button";
import { CancelOrderButton } from "@/components/admin/orders/cancel-button";
import { DeleteOrderButton } from "@/components/admin/orders/delete-button";
import { useTranslations } from "next-intl";
import { formatPaymentMethod } from "@/lib/shared/utils";
import { FinanceData } from "@/components/admin/finance/finance-columns";

/**
 * Single item accordion dalam daftar keuangan admin.
 * Diekstrak dari `finance-list.tsx` agar dapat dikelola secara mandiri.
 */
export function FinanceListItem({ data }: { data: FinanceData }) {
    const t = useTranslations("Admin.Finance.Status");

    const isPaid     = data.status === "paid"      || data.status === "settled";
    const isPending  = data.status === "pending_payment" || data.status === "pending" || data.status === "payment_pending";
    const isPartial  = data.project?.paymentStatus === "PARTIAL";
    const isSettledDP = (data.project?.paymentStatus === "PARTIAL" || data.project?.paymentStatus === "PAID") && data.paymentType === "DP";

    let statusClass = "text-zinc-400 border-zinc-700 bg-zinc-800/50";
    let statusIcon  = <Clock className="w-3 h-3" />;

    if (isPaid) {
        statusClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        statusIcon  = <CheckCircle2 className="w-3 h-3" />;
    } else if (isPartial) {
        statusClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        statusIcon  = <AlertCircle className="w-3 h-3" />;
    } else if (isPending) {
        statusClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
        statusIcon  = <Clock className="w-3 h-3" />;
    } else if (data.status === "cancelled") {
        statusClass = "bg-red-500/10 text-red-500 border-red-500/20";
        statusIcon  = <XCircle className="w-3 h-3" />;
    }

    const copyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(data.id);
        toast.success("System ID copied");
    };

    const copyShortId = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parts   = data.id.split("-");
        const shortId = parts.length > 1 ? `CM${parts[parts.length - 1]}` : data.id.slice(-4).toUpperCase();
        navigator.clipboard.writeText(shortId);
        toast.success(`Invoice ID #${shortId} copied`);
    };

    return (
        <AccordionItem value={data.id} className="border border-white/5 rounded-xl bg-zinc-900/50 overflow-hidden px-0">
            <AccordionTrigger className="px-3 sm:px-4 py-3 hover:bg-zinc-800/50 hover:no-underline [&[data-state=open]]:bg-zinc-800/30 transition-all group">
                <div className="flex items-stretch gap-3 w-full text-left relative">
                    {/* Indikator status vertikal */}
                    <div className={`w-1 rounded-full ${isPaid ? "bg-emerald-500" : isPartial ? "bg-indigo-500" : data.status === "cancelled" ? "bg-red-500" : "bg-amber-500"} shrink-0 my-0.5`} />

                    <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                        {/* Baris atas: Judul & Harga */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 pr-1">
                                <h4 className="font-semibold text-white truncate text-sm leading-tight max-w-[140px] sm:max-w-none">
                                    {data.project?.title || data.title || "Untitled Project"}
                                </h4>
                                <span className="text-zinc-600 hidden sm:inline">/</span>
                                <span className="text-xs text-zinc-400 hidden sm:flex items-center gap-1.5 truncate">
                                    <User className="w-3 h-3" />
                                    {data.project?.clientName || "Direct Order"}
                                </span>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <div className="font-bold text-white text-sm tabular-nums text-right">
                                    <PriceDisplay
                                        amount={
                                            data.paymentType === "DP"
                                                ? (data.transactionAmount || (data.project?.totalAmount || 0) * 0.5)
                                                : data.paymentType === "REPAYMENT" && !isPaid
                                                    ? Math.max(0, (data.project?.totalAmount || 0) - (data.project?.paidAmount || 0))
                                                    : (data.transactionAmount || data.project?.totalAmount || data.totalCost)
                                        }
                                        baseCurrency={(data.paymentType === "REPAYMENT" && !isPaid) ? "USD" : (data.isLegacyMismatched ? "USD" : data.currency) as "USD" | "IDR"}
                                        exchangeRate={data.exchangeRate || undefined}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Baris bawah: Klien mobile & status badge */}
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 min-w-0">
                                <span className="sm:hidden flex items-center gap-1 truncate">
                                    <User className="w-3 h-3" />
                                    <span className="truncate max-w-[80px]">{data.project?.clientName?.split(" ")[0] || "Client"}</span>
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="font-mono hover:text-zinc-300 cursor-pointer transition-colors" onClick={copyShortId}>
                                    #{(() => {
                                        const parts = data.id.split("-");
                                        return `CM${parts[parts.length - 1]}`;
                                    })()}
                                </span>
                                <span>•</span>
                                <span>{new Date(data.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {data.paymentType && (
                                    <Badge variant="secondary" className={`text-[9px] h-5 px-1.5 border ${
                                        (data.paymentType === "REPAYMENT" && isPaid) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        data.paymentType === "DP"                   ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                        data.paymentType === "REPAYMENT"            ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    }`}>
                                        {(data.paymentType === "REPAYMENT" && isPaid) ? t("full") :
                                         data.paymentType === "DP"                    ? t("dp") :
                                         data.paymentType === "REPAYMENT"             ? t("repayment") :
                                         t("full")}
                                    </Badge>
                                )}
                                <Badge variant="outline" className={`py-0.5 px-2 text-[10px] h-5 sm:h-6 flex items-center gap-1.5 whitespace-nowrap ${statusClass}`}>
                                    {statusIcon}
                                    <span className="hidden sm:inline max-w-[80px] sm:max-w-none truncate">
                                        {isPending && data.paymentType === "REPAYMENT" ? t("pending") : isPartial ? t("partial") : data.status.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-2 bg-zinc-900/30 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">System ID</span>
                            <span className="font-mono text-zinc-300 flex items-center gap-2">
                                {data.id}
                                <Copy className="w-3 h-3 cursor-pointer hover:text-white" onClick={copyId} />
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Payment Type</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] px-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 h-5">
                                    {data.paymentType || (isPartial ? "DP" : "FULL")}
                                </Badge>
                                {isPartial && !isSettledDP && (
                                    <span className="text-[10px] text-indigo-400">
                                        {data.paymentType === "REPAYMENT" ? t("waitingConfirmation") : t("waitingRepayment")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                            <span className="text-zinc-500">Payment Method</span>
                            <span className="text-zinc-300 font-medium uppercase text-[10px] tracking-wider">
                                {formatPaymentMethod(data.paymentMethod, data.paymentMetadata)}
                            </span>
                        </div>

                        {(data.proofUrl || data.project?.order?.proofUrl) && (
                            <div className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/50 border border-white/5">
                                <span className="text-zinc-500">Proof of Payment</span>
                                <ViewProofButton estimate={{
                                    ...data,
                                    proofUrl: (data.proofUrl || data.project?.order?.proofUrl) as string,
                                    paymentType: data.paymentType
                                }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end justify-center gap-3 p-4 rounded-lg bg-zinc-950/30 border border-white/5 border-dashed">
                        <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest mb-1 w-full text-right block border-b border-zinc-800 pb-2">
                            Quick Actions
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                            <Link href={`/id/invoices/${data.id}`} target="_blank">
                                <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-brand-yellow text-zinc-400" title="Open Invoice">
                                    <FileText className="w-4 h-4" />
                                </Button>
                            </Link>
                            {isPending && !isSettledDP && (
                                <div className="flex items-center">
                                    <span className="text-xs text-amber-500 italic mr-2">{t("waitingConfirmation")}</span>
                                    <ConfirmPaymentButton estimateId={data.id} paymentType={data.paymentType} />
                                </div>
                            )}
                            {isPaid && (
                                <div className="flex items-center">
                                    <span className="text-xs text-emerald-500 italic mr-2">{t("paymentVerified")}</span>
                                    <UnpaidButton estimateId={data.id} />
                                </div>
                            )}
                            {isSettledDP && (
                                <span className="text-xs text-zinc-500 italic">{t("dpSettled")} - No Action Needed</span>
                            )}
                            {data.status !== "cancelled" && <CancelOrderButton estimateId={data.id} />}
                            {data.status === "cancelled" && <DeleteOrderButton id={data.id} />}
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
