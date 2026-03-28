import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get("businessId");

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        // Verificar propiedad (Assuming "Business" table exists and relation user via userId)
        // Need to check if user.email matches session.user.email.
        // Prisma: user: { email: ... }
        // Supabase: inner join user on userId, filter by email.
        const { data: business } = await supabase
            .from('Business')
            .select('*, user:User!inner(email)')
            .eq('id', businessId)
            .eq('user.email', session.user.email)
            .single();

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const { data: conversations, error } = await supabase
            .from('Conversation')
            .select('*, customer:Customer(name, phone)')
            .eq('businessId', businessId)
            .order('lastMessageAt', { ascending: false });

        if (error) throw error;

        // Fetch latest message for each conversation (N+1, effectively mimicking Prisma include)
        const conversationsWithMessages = await Promise.all((conversations || []).map(async (c) => {
            const { data: messages } = await supabase
                .from('Message')
                .select('*')
                .eq('conversationId', c.id)
                .order('createdAt', { ascending: false })
                .limit(1);

            return {
                ...c,
                messages: messages || []
            };
        }));

        // Formatear para el frontend
        const formatted = conversationsWithMessages.map(c => {
            const parsedLastMessageAt = c.lastMessageAt ? new Date(c.lastMessageAt) : null;
            const safeTime = parsedLastMessageAt && !Number.isNaN(parsedLastMessageAt.getTime())
                ? parsedLastMessageAt.toISOString()
                : new Date().toISOString();

            return {
                id: c.id,
                name: c.customer.name || c.customer.phone,
                phone: c.customer.phone,
                source: c.channel.toLowerCase(),
                status: c.status.toLowerCase(),
                time: safeTime, // Frontend deberá formatear "2 min ago"
                preview: c.messages[0]?.content || "Nueva conversación",
                role: c.messages[0]?.role || "system"
            };
        });

        return NextResponse.json({ success: true, chats: formatted });

    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
