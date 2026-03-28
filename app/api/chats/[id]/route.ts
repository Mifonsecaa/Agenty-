import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions) as any;
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

        // Prisma: findUnique include business -> user (email check)
        // Supabase: inner join user on business.userId
        const { data: conversation, error: fetchError } = await supabase
            .from('Conversation')
            .select(`
                *,
                business:Business!inner(
                    *,
                    user:User!inner(email)
                )
            `)
            .eq('id', conversationId)
            .single();

        if (fetchError || !conversation) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

        // Check ownership
        // conversation.business corresponds to the joined data.
        // It should be an object (since N-1).
        // user is inside business.
        if (conversation.business?.user?.email !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data: updatedChat, error: updateError } = await supabase
            .from('Conversation')
            .update({ status })
            .eq('id', conversationId)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, chat: updatedChat });

    } catch (error) {
        console.error("Error updating chat:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
