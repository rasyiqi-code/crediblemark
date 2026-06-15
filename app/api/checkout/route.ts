import { prisma } from "@/lib/config/db";
import { Prisma } from "@prisma/client";
import { hexclaveServerApp } from "@/lib/config/hexclave";
import { ServiceAddon } from "@/lib/shared/types";
import { NextResponse } from "next/server";
import { paymentService } from "@/lib/server/payment-service";
import { createSubscriber } from "@/lib/server/marketing";
import { secureRandomInt } from "@/lib/utils/crypto";
import { cleanSummaryText } from "@/lib/shared/utils";

export async function POST(req: Request) {
    const debugSteps: string[] = [];
    try {
        debugSteps.push("Starting checkout");
        const user = await hexclaveServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        debugSteps.push("User authenticated: " + user.id);

        const { projectId, estimateId, paymentType = "FULL", currency = "USD", selectedAddons = [], shouldSubscribe } = await req.json();
        debugSteps.push(`Request parsed. Project: ${projectId}, Estimate: ${estimateId}, Type: ${paymentType}`);

        if (!projectId && !estimateId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let dbAmount = 0;
        let finalProjectId = projectId;
        let projectTotalAmount = 0;

        // If no projectId but we have estimateId, find or create the project
        if (!finalProjectId && estimateId) {
            debugSteps.push("Looking up estimate");
            const estimate = await prisma.estimate.findUnique({
                where: { id: estimateId },
                include: { project: true, service: true }
            });

            if (!estimate) {
                return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
            }
            debugSteps.push("Estimate found");

            let currentTotalCost = estimate.totalCost;
            let currentSummary = estimate.summary;

            // Handle dynamically selected addons from checkout page
            if (estimate.service) {
                // Rebuild the estimate's total cost and summary from the TRUE base!
                const basePrice = estimate.service.price;
                
                // Remove previous addons text if it exists
                const addonsMarker = "\n\nAdd-ons Selected at Checkout:";
                const baseSummary = cleanSummaryText(estimate.summary);
                
                let addonsTotal = 0;
                let addonsSummaryText = "";

                if (selectedAddons && selectedAddons.length > 0) {
                    const addonsInput = selectedAddons as (string | { id?: string; name?: string })[];
                    const addonIds = addonsInput.map((a) => typeof a === 'string' ? a : a.id).filter((id): id is string => !!id);
                    const addonNames = addonsInput.map((a) => typeof a === 'string' ? '' : a.name).filter((name): name is string => !!name);
                    
                    const dbAddons = await prisma.addon.findMany({
                        where: {
                            OR: [
                                { id: { in: addonIds } },
                                { name: { in: addonNames } }
                            ],
                            isActive: true
                        }
                    });

                    if (dbAddons.length > 0) {
                        addonsSummaryText = addonsMarker;
                        const rate = await paymentService.getExchangeRate();
                        const isServiceIdr = estimate.service.currency === 'IDR';

                        dbAddons.forEach((addon: ServiceAddon) => {
                            let addonPriceInServiceCurrency = addon.price;
                            
                            if (isServiceIdr && addon.currency === 'USD') {
                                // Konversi harga addon dari USD ke IDR
                                addonPriceInServiceCurrency = addon.price * rate;
                            } else if (!isServiceIdr && addon.currency === 'IDR') {
                                // Konversi harga addon dari IDR ke USD
                                addonPriceInServiceCurrency = addon.price / rate;
                            }
                            
                            addonsTotal += addonPriceInServiceCurrency;
                            const currencySymbol = isServiceIdr ? 'Rp' : '$';
                            const displayPrice = isServiceIdr 
                                ? (addon.currency === 'IDR' ? addon.price : addon.price * rate) 
                                : (addon.currency === 'USD' ? addon.price : addon.price / rate);
                            
                            const formattedPrice = isServiceIdr 
                                ? new Intl.NumberFormat('id-ID').format(Math.ceil(displayPrice))
                                : displayPrice.toFixed(2);

                            addonsSummaryText += `\n- + ${addon.name} (${currencySymbol}${formattedPrice} ${addon.interval === "monthly" ? "Monthly" : addon.interval === "yearly" ? "Yearly" : "One-time"})`;
                        });
                    }
                }

                currentTotalCost = basePrice + addonsTotal;
                currentSummary = baseSummary + addonsSummaryText;
                
                // Selalu perbarui estimasi di DB agar sesuai dengan pilihan saat ini
                await prisma.estimate.update({
                    where: { id: estimate.id },
                    data: {
                        totalCost: currentTotalCost,
                        summary: currentSummary
                    }
                });
                
                if (estimate.project) {
                    await prisma.project.update({
                        where: { id: estimate.project.id },
                        data: {
                            totalAmount: currentTotalCost,
                            description: currentSummary
                        }
                    });
                }
            }

            dbAmount = currentTotalCost;

            // Check currency for estimate
            if (estimate.service?.currency === 'IDR') {
                const { rate } = await paymentService.convertToIDR(1);
                dbAmount = dbAmount / rate;
            }

            projectTotalAmount = dbAmount;

            if (estimate.project) {
                finalProjectId = estimate.project.id;
            } else {
                debugSteps.push("Creating new project");
                // Create new project from estimate
                const newProject = await prisma.project.create({
                    data: {
                        userId: user.id,
                        clientName: user.displayName || user.primaryEmail || "Unnamed Client",
                        title: estimate.title,
                        description: estimate.summary,
                        spec: JSON.stringify({ screens: estimate.screens, apis: estimate.apis }, null, 2),
                        status: "pending_payment",
                        estimateId: estimateId,
                        totalAmount: projectTotalAmount,
                    }
                });
                finalProjectId = newProject.id;
            }
        } else if (finalProjectId) {
            debugSteps.push("Looking up existing project");
            // Existing project - find the price from estimate or service
            const project = await prisma.project.findUnique({
                where: { id: finalProjectId },
                include: { estimate: { include: { service: true } }, service: true }
            });

            if (!project) {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }
            debugSteps.push("Project found");

            if (project.estimate) {
                dbAmount = project.estimate.totalCost;
                // Estimates are usually in USD by default, but check service if linked
                if (project.estimate.service?.currency === 'IDR') {
                    const { rate } = await paymentService.convertToIDR(1);
                    dbAmount = dbAmount / rate;
                }
            } else if (project.service) {
                dbAmount = project.service.price;
                if (project.service.currency === 'IDR') {
                    const { rate } = await paymentService.convertToIDR(1);
                    dbAmount = dbAmount / rate;
                }
            } else {
                return NextResponse.json({ error: "No pricing source found for this project" }, { status: 400 });
            }
            projectTotalAmount = dbAmount;

            // Update totalAmount if it's 0 (migration for existing projects)
            if (project.totalAmount === 0 && dbAmount > 0) {
                await prisma.project.update({
                    where: { id: finalProjectId },
                    data: { totalAmount: dbAmount }
                });
            }
        }

        if (dbAmount <= 0) {
            return NextResponse.json({ error: "Invalid payment amount calculation" }, { status: 400 });
        }

        debugSteps.push("Calculating amount to pay");
        // Calculate amount based on payment type
        let amountToPay = dbAmount;

        if (paymentType === "DP") {
            amountToPay = dbAmount * 0.5; // 50% DP
        } else if (paymentType === "REPAYMENT") {
            const project = await prisma.project.findUnique({ where: { id: finalProjectId } });
            const paid = project?.paidAmount || 0;
            const total = project?.totalAmount || dbAmount;
            amountToPay = total - paid;

            if (amountToPay <= 0) {
                return NextResponse.json({ message: "Project already fully paid" }, { status: 400 });
            }
        }



        if (amountToPay <= 0) {
            return NextResponse.json({ error: "Invalid payment amount after discount" }, { status: 400 });
        }

        debugSteps.push("Converting currency");
        // Convert to IDR and ensure integer for Midtrans
        // Determine Rate and IDR Amount based on requested currency
        let finalRate = 1;
        let finalIdrAmount = 0;

        // Fetch current rate
        const { idrAmount: calculatedIdrAmount, rate } = await paymentService.convertToIDR(amountToPay);

        // Lock the rate and calculate IDR amount regardless of selected currency
        // This ensures consistent rate display and logging
        finalRate = rate;
        finalIdrAmount = Math.ceil(calculatedIdrAmount);

        console.log(`[CHECKOUT] Type: ${paymentType}, Currency: ${currency}, Amount: ${amountToPay} USD -> ${finalIdrAmount} IDR (Rate: ${finalRate})`);

        debugSteps.push("Checking for existing pending order");
        // Check for existing pending order for this project AND this payment type
        const existingOrder = await prisma.order.findFirst({
            where: {
                projectId: finalProjectId,
                type: paymentType,
                status: 'pending'
            }
        });

        // Reuse existing order logic
        if (existingOrder && existingOrder.amount === amountToPay) {
            debugSteps.push("Reusing existing order: " + existingOrder.id);
            const orderId = existingOrder.id;

            // Sync invoiceId to project for easier dashboard access
            await prisma.project.update({
                where: { id: finalProjectId },
                data: { invoiceId: orderId }
            });

            return NextResponse.json({ orderId });
        } else if (existingOrder) {
            // Amount changed, delete old pending order
            await prisma.order.delete({ where: { id: existingOrder.id } });
        }

        debugSteps.push("Creating new order ID");
        // Create a unique order ID
        const orderId = `ORDER-${Date.now()}-${secureRandomInt(0, 1000)}`;

        const finalOrderAmount = currency === "IDR" ? finalIdrAmount : amountToPay;

        debugSteps.push("Saving order to DB");
        // Save order to database
        await prisma.order.create({
            data: {
                id: orderId,
                amount: finalOrderAmount,
                userId: user.id,
                project: finalProjectId ? { connect: { id: finalProjectId } } : undefined,
                status: "pending",
                type: paymentType,
                currency: currency,
                exchangeRate: finalRate,
                paymentMetadata: {} as unknown as Prisma.InputJsonValue,
            },
        });

        // Sync invoiceId to project and RESET estimate if REPAYMENT
        const updateData = {
            invoiceId: orderId,
            totalAmount: projectTotalAmount // Ensure total amount is set
        };

        if (paymentType === 'REPAYMENT' && estimateId) {
            // Reset estimate to pending to show up in Admin Finance as "Awaiting Confirmation"
            await prisma.estimate.update({
                where: { id: estimateId },
                data: {
                    status: 'pending_payment',
                    // Optional: we can track the current payment type in the estimate too if needed
                }
            });
        }

        await prisma.project.update({
            where: { id: finalProjectId },
            data: updateData
        });

        // Handle newsletter subscription automatically if checked
        if (shouldSubscribe && user.primaryEmail) {
            try {
                await createSubscriber(user.primaryEmail, user.displayName || undefined);
            } catch (err) {
                console.warn("[CHECKOUT_API] Gagal mendaftarkan subscriber otomatis:", err);
            }
        }

        debugSteps.push("Success");
        return NextResponse.json({ orderId });
    } catch (error) {
        console.error("[MIDTRANS_CHECKOUT_ERROR]", error);
        const isProd = process.env.NODE_ENV === "production";
        return NextResponse.json({
            error: isProd ? "Internal Error" : (error instanceof Error ? error.message : "Internal Error"),
            ...(isProd ? {} : {
                debugSteps,
                details: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            })
        }, { status: 500 });
    }
}

