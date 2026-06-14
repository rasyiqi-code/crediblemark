import { prisma } from "@/lib/config/db";
import { getCore } from "@/lib/integrations/midtrans";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return new NextResponse("Missing orderId", { status: 400 });
    }

    try {

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                status: true,
                transactionId: true,
                projectId: true
            }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // Smart Check: If pending and has transactionId, check upstream
        if (order.status === 'pending' && order.transactionId) {
            try {
                const core = await getCore();
                const midtransStatus = await core.transaction.status(order.transactionId);
                const transactionStatus = midtransStatus.transaction_status;

                let dbStatus = "pending";
                if (transactionStatus === "capture" || transactionStatus === "settlement") {
                    dbStatus = "settled";
                } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
                    dbStatus = transactionStatus;
                }

                if (dbStatus !== "pending") {
                    // Update Order
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: dbStatus,
                            paymentType: midtransStatus.payment_type
                        }
                    });

                    // Update Project/Estimate if settled
                    if (dbStatus === "settled") {
                        const updatedOrder = await prisma.order.findUnique({
                            where: { id: orderId },
                            include: { project: true }
                        });

                        if (updatedOrder?.project) {
                            // Hitung paidAmount dan paymentStatus
                            const currentPaid = updatedOrder.project.paidAmount || 0;
                            const newPaid = currentPaid + updatedOrder.amount;

                            let paymentStatus = "UNPAID";
                            if (updatedOrder.type === "FULL" || updatedOrder.type === "REPAYMENT") {
                                paymentStatus = "PAID";
                            } else if (updatedOrder.type === "DP") {
                                paymentStatus = "PARTIAL";
                            }

                            await prisma.project.update({
                                where: { id: updatedOrder.project.id },
                                data: {
                                    status: "queue",
                                    paymentStatus: paymentStatus,
                                    paidAmount: newPaid,
                                }
                            });

                            if (updatedOrder.project.estimateId) {
                                await prisma.estimate.update({
                                    where: { id: updatedOrder.project.estimateId },
                                    data: { status: "paid" }
                                });
                            }
                        }

                    }

                    // Return updated status
                    return NextResponse.json({ status: dbStatus });
                }
            } catch (midtransError) {
                console.error("Midtrans check failed:", midtransError);
                // Fallback to existing DB status if upstream check fails
            }
        }

        // Redirect logic for user or JSON for polling
        const mode = searchParams.get('mode');

        if (mode === 'json') {
            return NextResponse.json({
                status: order.status,
                transactionId: order.transactionId
            });
        }

        if (order.status === 'paid' || order.status === 'settled') {
            return NextResponse.redirect(new URL(`/invoices/${orderId}?status=success`, req.url));
        } else {
            // If still pending, redirect but maybe with pending status?
            // Or verify if we should just redirect to invoice page anyway.
            return NextResponse.redirect(new URL(`/invoices/${orderId}?status=pending`, req.url));
        }

    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
