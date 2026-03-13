import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get("businessId");

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        // Verificar propiedad
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                user: { email: session.user.email }
            }
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const conversations = await prisma.conversation.findMany({
            where: { businessId },
            orderBy: { lastMessageAt: 'desc' },
            include: {
                customer: {
                    select: { name: true, phone: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Formatear para el frontend
        const formatted = conversations.map(c => ({
            id: c.id,
            name: c.customer.name || c.customer.phone,
            phone: c.customer.phone,
            source: c.channel.toLowerCase(),
            status: c.status.toLowerCase(),
            time: c.lastMessageAt.toISOString(), // Frontend deberá formatear "2 min ago"
            preview: c.messages[0]?.content || "Nueva conversación",
            role: c.messages[0]?.role || "system"
        }));

        return NextResponse.json({ success: true, chats: formatted });

    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

