"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PriceDisplay } from "@/components/providers/currency-provider";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    FileText,
    CreditCard,
    Copy,
} from "lucide-react";
import type { BillingOrder } from "./billing-list";

/**
 * Card item accordion untuk satu order di daftar billing klien.
 * Diekstrak dari `billing-list.tsx` agar mudah diuji dan dikembangkan sendiri.
 */
export function BillingListItem({ order }: { order: BillingOrder }) {
    const isPaid = order.status === "paid" || order.status === "settled";
    const isPending = order.status === "pending";
    const isWaiting = order.status === "waiting_verification";
    const isPartial = order.project?.paymentStatus === "PARTIAL" && order.type === "DP";

    // Status indicator
    let statusClass = "text-zinc-400 border-zinc-700 bg-zinc-800/50";
    let statusIcon = <Clock className="w-3 h-3" />;

    if (isPartial) {
        statusClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        statusIcon = <AlertCircle className="w-3 h-3" />;
    } else if (isPaid) {
        statusClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        statusIcon = <CheckCircle2 className="w-3 h-3" />;
    } else if (isPending) {
        statusClass = "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
        statusIcon = <Clock className="w-3 h-3" />;
    } else if (isWaiting) {
        statusClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
        statusIcon = <Clock className="w-3 h-3" />;
    }

    const copyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(order.id);
        toast.success("System ID copied");
    };

    const copyShortId = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parts = order.id.split("-");
        const shortId = parts.length > 1 ? `CM${parts[parts.length - 1]}` : order.id.slice(-8).toUpperCase();
        navigator.clipboard.writeText(shortId);
        toast.success(`Invoice ID #${shortId} copied`);
    };

    return (
        <AccordionItem value={order.id} className="border border-white/5 rounded-xl bg-zinc-900/50 overflow-hidden px-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/50 hover:no-underline [&[data-state=open]]:bg-zinc-800/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 text-left">
                    {/* Kiri: Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-1 h-8 rounded-full ${isPaid ? "bg-emerald-500" : isPending ? "bg-brand-yellow" : isWaiting ? "bg-blue-500" : "bg-zinc-500"} shrink-0`} />
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                <h4 className="font-bold text-white truncate text-sm">{order.project?.title || "Project Deposit"}</h4>
                                {(order.type === "DP" || order.type === "REPAYMENT") && (
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                                        {order.type}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span
                                    className="font-mono hover:text-zinc-300 cursor-pointer flex items-center gap-1 transition-colors hover:underline"
                                    onClick={copyShortId}
                                    title="Copy ID"
                                >
                                    #{(() => {
                                        const parts = order.id.split("-");
                                        return `CM${parts[parts.length - 1]}`;
                                    })()}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Kanan: Status & Jumlah */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:mr-2 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                        <Badge variant="outline" className={`py-0.5 px-2 text-[10px] h-5 flex items-center gap-1.5 whitespace-nowrap ${statusClass}`}>
                            {statusIcon}
                            {isPartial ? "PARTIAL (DP)" : order.status.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                        <div className="font-black text-white text-base tabular-nums text-right min-w-[80px] tracking-tighter">
                            <PriceDisplay amount={order.amount} />
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-2 bg-zinc-900/30 border-t border-white/5">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end mt-2">
                    <div className="space-y-1 text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                            <span>System ID:</span>
                            <span className="font-mono text-zinc-300">{order.id}</span>
                            <Copy className="w-3 h-3 cursor-pointer hover:text-white" onClick={copyId} />
                        </div>
                        {order.project?.invoiceId && (
                            <div className="flex items-center gap-2">
                                <span>Reference ID:</span>
                                <span className="font-mono text-zinc-300">{order.project.invoiceId}</span>
                            </div>
                        )}
                        {order.project?.paymentStatus && (
                            <div className="flex items-center gap-2 mt-1">
                                <span>Project Status:</span>
                                <Badge variant="outline" className="text-[9px] px-1.5 h-4 border-zinc-700 text-zinc-400">
                                    {order.project.paymentStatus.replace(/_/g, " ")}
                                </Badge>
                            </div>
                        )}
                        {order.project?.description && order.project.description.includes("Add-ons:") && (
                            <div className="flex flex-col gap-1 mt-2 p-2 bg-zinc-950 rounded-md border border-white/5">
                                <span className="font-semibold text-zinc-400">Add-ons Included:</span>
                                <span className="text-zinc-500 whitespace-pre-line leading-relaxed">
                                    {order.project.description.split("Add-ons:")[1].trim()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {order.status === "pending" && order.project?.estimateId ? (
                            <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs bg-brand-yellow hover:bg-brand-yellow/80 text-black border-0 font-bold"
                                asChild
                            >
                                <Link href={`/checkout/${order.project.estimateId}?paymentType=${order.type}`}>
                                    <CreditCard className="w-3 h-3 mr-1.5" />
                                    {order.type === "DP" ? "Pay DP" : order.type === "REPAYMENT" ? "Pay Remaining" : "Pay Now"}
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/10 border-white/10 bg-zinc-950"
                                asChild
                            >
                                <Link href={`/invoices/${order.id}${order.snapToken ? `?token=${order.snapToken}` : ""}`} target="_blank">
                                    <FileText className="w-3 h-3 mr-1.5" />
                                    View Invoice
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
