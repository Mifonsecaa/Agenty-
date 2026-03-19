import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: conversationId } = await params;
        if (!conversationId) return NextResponse.json({ error: "No ID" }, { status: 400 });
        
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                business: {
                    include: { user: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        if (conversation.business.user.email !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ 
            success: true, 
            history: conversation.messages.map(m => ({
                id: m.id,
                role: m.role,
                text: m.content,
                createdAt: m.createdAt
            }))
        });

    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: conversationId } = await params;
        const body = await req.json();
        const { text } = body;

        if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { 
                business: {
                     include: { user: true }
                },
                customer: true 
            }
        });

        if (!conversation) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        if (conversation.business.user.email !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // 1. Guardar mensaje en DB
        const message = await prisma.message.create({
            data: {
                conversationId,
                role: "agent",
                content: text
            }
        });

        // 2. Actualizar conversación
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { 
                lastMessageAt: new Date(),
                status: "ACTIVE" 
            }
        });

        // 3. Enviar por WhatsApp
        // Asumiendo instanceName = business.id
        const { evolutionService } = await import("@/services/whatsapp/evolution");
        await evolutionService.sendMessage(
            conversation.business.id, 
            conversation.customer.phone,
            text
        );

        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
