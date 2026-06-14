"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/shared/utils";

interface ViewProofButtonProps {
    estimate: {
        id: string;
        proofUrl?: string | null;
        project?: { title: string; order?: { paymentType?: string | null } | null } | null;
        title?: string | null;
        createdAt: string | Date;
        paymentType?: string | null; // Direct prop or via project order
    };
}

export function ViewProofButton({ estimate }: ViewProofButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isError, setIsError] = useState(false);

    // Resolve payment type and proofUrl
    const paymentType = estimate.paymentType || estimate.project?.order?.paymentType;
    const proofUrl = estimate.proofUrl;

    // 1. If Proof URL exists (Manual Transfer), show View Proof button
    if (proofUrl) {
        // Continue to Dialog logic... passing through to return
        // We do NOT return early here, as we need the logic below to calculate displayUrl etc.
    }
    // 2. If NO Proof URL but YES Payment Type (Online), show Text
    else if (paymentType) {
        return <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">Via Midtrans</span>;
    }
    // 3. Else show nothing
    else {
        return null;
    }

    const isPdf = proofUrl ? proofUrl.toLowerCase().endsWith(".pdf") : false;

    // ... rest of logic
    const invoiceId = estimate.id.slice(-8).toUpperCase();
    const projectTitle = estimate.project?.title || estimate.title || "Untitled";
    const dateStr = estimate.createdAt instanceof Date
        ? estimate.createdAt.toISOString().split('T')[0]
        : new Date(estimate.createdAt).toISOString().split('T')[0];

    const fileName = `Proof-${invoiceId}-${projectTitle.replace(/[^a-z0-9]/gi, '_')}-${dateStr}${isPdf ? '.pdf' : ''}`;

    // Construct Proxy URL if it's an R2 URL (to bypass Public Access blocks)
    let displayUrl = proofUrl || "";
    try {
        if (proofUrl) {
            const urlObj = new URL(proofUrl);
            if (urlObj.host.includes("r2.dev")) {
                const rawPath = decodeURIComponent(urlObj.pathname);
                const key = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
                displayUrl = `/api/storage/proxy?key=${encodeURIComponent(key)}`;
            }
        }
    } catch {
        // invalid url, keep original
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
                setIsError(false);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 p-0 hover:bg-transparent">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs underline hover:no-underline">View Proof</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className={cn(
                "bg-zinc-900 border-white/10 text-white flex flex-col p-6",
                isPdf ? "max-w-[95vw] w-full h-[95vh]" : "max-w-fit w-full max-h-[95vh]"
            )}>
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex justify-between items-center">
                        <span>Payment Proof</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Verify the payment proof uploaded by the client.
                    </DialogDescription>
                </DialogHeader>
                <div className={cn(
                    "mt-4 flex items-center justify-center bg-black/50 rounded-lg p-2 overflow-hidden",
                    isPdf ? "flex-1" : ""
                )}>
                    {isPdf ? (
                        <iframe src={displayUrl} className="w-full h-full border-none" />
                    ) : (
                        <div className="relative">
                            {isError ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-zinc-850/50 rounded-xl text-zinc-400 max-w-sm border border-white/5 mx-auto">
                                    <AlertCircle className="w-12 h-12 text-zinc-500 mb-3" />
                                    <p className="text-sm text-center font-medium text-white">Gagal memuat bukti transfer</p>
                                    <p className="text-xs text-center text-zinc-500 mt-1">
                                        Berkas kemungkinan terhapus dari cloud storage atau koneksi server terputus.
                                    </p>
                                </div>
                            ) : (
                                <Image
                                    src={displayUrl}
                                    alt="Payment Proof"
                                    width={800}
                                    height={600}
                                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md"
                                    onError={() => setIsError(true)}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-4 shrink-0">
                    <Button variant="secondary" size="sm" asChild>
                        <a href={displayUrl} download={fileName} target="_blank">
                            <Download className="w-3.5 h-3.5 mr-2" />
                            Download Original
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
