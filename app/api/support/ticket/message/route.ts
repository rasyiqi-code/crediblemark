import { prisma } from "@/lib/config/db";
import { NextResponse } from "next/server";
import { hexclaveServerApp } from "@/lib/config/hexclave";

export async function POST(req: Request) {
    const user = await hexclaveServerApp.getUser().catch(() => null);
    // Allow messages if they are from a logged-in user OR it's a guest message to a valid ticket
    // Authentication for admin is still needed if sender is 'admin'

    try {
        const formData = await req.formData();
        const ticketId = formData.get("ticketId") as string;
        const content = formData.get("content") as string;
        const sender = formData.get("sender") as string; // 'user' or 'agent'
        const file = formData.get("file") as File | null;

        if (!ticketId || (!content && !file)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Security: If sender is admin, MUST be a logged in user (admin check should be added here later)
        if (sender === 'admin' && !user) {
            return NextResponse.json({ error: "Unauthorized - Admin must be logged in" }, { status: 401 });
        }

        const attachments = [];
        if (file && file.size > 0 && file.name !== 'undefined') {
            const { uploadFile } = await import("@/lib/integrations/storage");
            const url = await uploadFile(file, `tickets/${ticketId}/${Date.now()}-${file.name}`);
            attachments.push({
                name: file.name,
                url: url,
                type: file.type
            });
        }

        const message = await prisma.supportMessage.create({
            data: {
                ticketId,
                content: content || "",
                sender: sender || "user",
                attachments: attachments.length > 0 ? attachments : undefined
            }
        });

        // Update ticket "updatedAt"
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
