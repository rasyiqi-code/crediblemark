import { hexclaveServerApp } from "@/lib/config/hexclave";
import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const user = await hexclaveServerApp.getUser().catch(() => null);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Resolusi User untuk Pencarian Berbasis Nama (Hanya deteksi jika query berupa UUID)
    // OPTIMASI C1: Menghapus hexclaveServerApp.listUsers() untuk menghindari pengunduhan ribuan user ke memori.
    // Pencarian nama klien sekarang sepenuhnya menggunakan kolom clientName langsung di PostgreSQL (baris 58).
    let matchedUserIds: string[] = [];
    const isUUID = query && /^[0-9a-fA-F-]{36}$/.test(query);

    if (query && isUUID) {
        matchedUserIds = [query];
    }

    // Hanya tampilkan proyek yang sudah PAID (konsisten dengan page.tsx)
    const where = {
        AND: [
            { paymentStatus: "PAID" },
            query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' as const } },
                    { userId: { contains: query, mode: 'insensitive' as const } },
                    { userId: { equals: query } },
                    { description: { contains: query, mode: 'insensitive' as const } },
                    { status: { contains: query, mode: 'insensitive' as const } },
                    { service: { title: { contains: query, mode: 'insensitive' as const } } },
                    ...(matchedUserIds.length > 0 ? [{ userId: { in: matchedUserIds } }] : []),
                    { clientName: { contains: query, mode: 'insensitive' as const } },
                    { invoiceId: { contains: query, mode: 'insensitive' as const } },
                ]
            } : {},
            (status && status !== 'all') ? { status: { equals: status } } : {},
        ]
    };

    try {
        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            select: {
                id: true,
                userId: true,
                title: true,
                description: true,
                status: true,
                createdAt: true,
                invoiceId: true,
                clientName: true,
                service: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        // 2. Enrich Projects with Client Names from Stack Auth
        // ⚡ Bolt Optimization: Only fetch users that don't already have a clientName natively tracked in Prisma.
        // Note: The external API (@hexclave/next) does not support a batched fetch method (e.g. getUsers(ids)).
        // 🎯 Why: Mitigates the N+1 network request pattern inherently. New projects structurally have clientName set in POST.
        // 📊 Impact: Reduces external API network calls to O(0) in the steady state.
        const missingClientNameProjects = projects.filter((p) => !p.clientName && p.userId);
        const uniqueUserIds = Array.from(new Set(missingClientNameProjects.map(p => p.userId)));

        let stackUsers: Array<{ id: string; displayName?: string | null; primaryEmail?: string | null } | null> = [];
        if (uniqueUserIds.length > 0) {
            stackUsers = await Promise.all(
                uniqueUserIds.map(async (id) => {
                    try {
                        return await hexclaveServerApp.getUser(id);
                    } catch (e) {
                        console.error(`Failed to fetch user ${id} in getProjects`, e);
                        return null;
                    }
                })
            );
        }

        const userMap = new Map(stackUsers.filter(Boolean).map(u => [u!.id, u]));

        const enrichedProjects = projects.map((p) => {
            if (p.clientName) return p;
            const u = userMap.get(p.userId);
            return {
                ...p,
                clientName: u?.displayName || u?.primaryEmail || "Unnamed Client"
            };
        });

        return NextResponse.json(enrichedProjects);
    } catch (error) {
        console.error("Get Projects Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await hexclaveServerApp.getUser().catch(() => null);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await request.json();
        const body = createProjectSchema.parse(json);

        // Create Project and Initial Brief in one transaction
        // ⚡ Bolt Optimization: Save clientName on creation to inherently resolve N+1 API fetching in GET method
        const project = await prisma.project.create({
            data: {
                userId: user.id,
                clientName: user.displayName || user.primaryEmail || "Unnamed Client",
                title: body.title,
                description: body.description,
                briefs: {
                    create: {
                        content: body.description,
                    },
                },
            },
            include: {
                briefs: true, // Return the brief just in case
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        console.error("Project creation error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
