import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: conversationId } = await params;
        const body = await req.json();
        const { status } = body;

        if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });

        // Validar status permitido
        const validStatuses = ["ACTIVE", "HANDOFF", "RESOLVED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                business: {
                    include: { user: true }
                }
            }
        });

        if (!conversation) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        if (conversation.business.user.email !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedChat = await prisma.conversation.update({
            where: { id: conversationId },
            data: { status }
        });

        return NextResponse.json({ success: true, chat: updatedChat });

    } catch (error) {
        console.error("Error updating chat:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

