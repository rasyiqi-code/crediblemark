import { estimateFlow } from '@/app/genkit';
import { prisma } from '@/lib/config/db';
import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/shared/auth-helpers';
import { notifyNewEstimate } from '@/lib/email/admin-notifications';
import { paymentService } from '@/lib/server/payment-service';

export async function GET(req: NextRequest) {
    // Endpoint publik: hanya menampilkan data ringkasan non-sensitif
    // (title, totalHours, totalCost, complexity, creatorName)
    // untuk digunakan oleh komponen RecentEstimates di halaman price-calculator
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '2');
        const cursor = searchParams.get('cursor');

        const estimates = await prisma.estimate.findMany({
            where: {
                prompt: "Instant Quote Calculator"
            },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                totalHours: true,
                totalCost: true,
                createdAt: true,
                complexity: true,
                creatorName: true
            }
        });


        // Determine next cursor
        const nextCursor = estimates.length === limit ? estimates[estimates.length - 1].id : undefined;

        return NextResponse.json({
            items: estimates,
            nextCursor
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch estimates" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await getCurrentUser();
        const userId = user?.id;
        const creatorName = user?.displayName || user?.primaryEmail?.split('@')[0] || "Anonymous";

        // 1. Direct Purchase (Beli Langsung Service dari Catalog)
        if (body.serviceId) {
            if (!userId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const service = await prisma.service.findFirst({
                where: { id: body.serviceId, isActive: true }
            });

            if (!service) {
                return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
            }

            // Hitung total harga termasuk addon yang dipilih dari database global
            const selectedAddons = Array.isArray(body.selectedAddons) ? body.selectedAddons : [];
            const addonIds = selectedAddons.map((a: any) => typeof a === 'string' ? a : a.id).filter(Boolean);
            const addonNames = selectedAddons.map((a: any) => typeof a === 'string' ? '' : a.name).filter(Boolean);
            
            const dbAddons = await prisma.addon.findMany({
                where: {
                    OR: [
                        { id: { in: addonIds } },
                        { name: { in: addonNames } }
                    ],
                    isActive: true
                }
            });

            const rate = await paymentService.getExchangeRate();
            const isServiceIdr = service.currency === 'IDR';

            let addonsTotal = 0;
            dbAddons.forEach((addon) => {
                let addonPriceInServiceCurrency = addon.price;
                if (isServiceIdr && addon.currency === 'USD') {
                    addonPriceInServiceCurrency = addon.price * rate;
                } else if (!isServiceIdr && addon.currency === 'IDR') {
                    addonPriceInServiceCurrency = addon.price / rate;
                }
                addonsTotal += addonPriceInServiceCurrency;
            });

            const totalPrice = service.price + addonsTotal;

            // Bangun summary — simpan marker addon (nama EN) untuk deteksi di checkout
            let summary = service.description;
            if (dbAddons.length > 0) {
                const addonLines = dbAddons.map((a) => `+ ${a.name}`).join('\n');
                summary = `${service.description}\n\nAdd-ons Selected at Checkout:\n${addonLines}`;
            }

            // Buat Estimate untuk pembelian langsung service ini
            const estimate = await prisma.estimate.create({
                data: {
                    prompt: `Direct Service Purchase: ${service.title}`,
                    title: service.title,
                    summary,
                    screens: [],
                    apis: [],
                    totalHours: 0,
                    totalCost: totalPrice,
                    complexity: "medium",
                    status: "pending_payment",
                    serviceId: service.id,
                    userId,
                    creatorName
                }
            });

            // Buat Project terhubung
            await prisma.project.create({
                data: {
                    userId,
                    clientName: user?.displayName || user?.primaryEmail || "Valued Client",
                    title: service.title,
                    description: service.description,
                    spec: JSON.stringify({ screens: [], apis: [] }, null, 2),
                    status: "pending_payment",
                    estimateId: estimate.id,
                    serviceId: service.id,
                    totalAmount: totalPrice
                }
            });

            return NextResponse.json({ id: estimate.id });
        }

        // 2. Finalisasi Proposal Kustom dari Price Calculator
        if (body.action === 'finalize') {
            if (!userId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { estimateId, selectedScreens, selectedApis, totalHours, totalCost } = body;

            if (!estimateId) {
                return NextResponse.json({ error: "Estimate ID is required" }, { status: 400 });
            }

            const estimate = await prisma.estimate.findUnique({
                where: { id: estimateId }
            });

            if (!estimate) {
                return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
            }

            // Perbarui Estimate dengan screens, apis, totalHours, dan totalCost pilihan klien
            const updatedEstimate = await prisma.estimate.update({
                where: { id: estimateId },
                data: {
                    screens: selectedScreens,
                    apis: selectedApis,
                    totalHours: totalHours,
                    totalCost: totalCost,
                    status: "pending_payment",
                    userId
                }
            });

            // Sinkronkan ke Project terkait (buat baru jika belum ada)
            const existingProject = await prisma.project.findUnique({
                where: { estimateId }
            });

            if (existingProject) {
                await prisma.project.update({
                    where: { id: existingProject.id },
                    data: {
                        totalAmount: totalCost,
                        description: estimate.summary,
                        spec: JSON.stringify({ screens: selectedScreens, apis: selectedApis }, null, 2),
                        status: "pending_payment"
                    }
                });
            } else {
                await prisma.project.create({
                    data: {
                        userId,
                        clientName: user?.displayName || user?.primaryEmail || "Valued Client",
                        title: updatedEstimate.title,
                        description: updatedEstimate.summary,
                        spec: JSON.stringify({ screens: selectedScreens, apis: selectedApis }, null, 2),
                        status: "pending_payment",
                        estimateId: updatedEstimate.id,
                        serviceId: updatedEstimate.serviceId,
                        totalAmount: totalCost
                    }
                });
            }

            return NextResponse.json({ id: updatedEstimate.id });
        }

        // 3. Manual Mode (from Calculator/Human) - Default Manual
        if (body.type === 'manual') {
            const { title, summary, complexity, screens, apis, totalHours, totalCost, prompt } = body.data;

            const estimate = await prisma.estimate.create({
                data: {
                    prompt: prompt || "Manual Estimate",
                    title,
                    summary,
                    complexity,
                    screens,
                    apis,
                    totalHours,
                    totalCost,
                    status: 'draft',
                    userId,
                    creatorName
                }
            });
            return NextResponse.json({ id: estimate.id });
        }

        // 4. AI Mode (Genkit) - Default AI Fallback
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Jalankan Genkit Flow
        const result = await estimateFlow(prompt);

        // Simpan ke Database
        const estimate = await prisma.estimate.create({
            data: {
                prompt,
                title: result.title,
                summary: result.summary,
                complexity: result.complexity,
                screens: result.screens,
                apis: result.apis,
                totalHours: result.totalHours,
                totalCost: result.totalCost,
                userId,
                creatorName
            }
        });

        // Kirim Notifikasi Admin secara async (Fire & Forget)
        notifyNewEstimate({
            id: estimate.id,
            title: estimate.title,
            totalCost: estimate.totalCost,
            creatorName: estimate.creatorName || "Anonymous"
        }).catch(err => console.error("Failed to send admin notification:", err));

        return NextResponse.json({ id: estimate.id });
    } catch (error: unknown) {
        console.error("Estimate generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate estimate";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
