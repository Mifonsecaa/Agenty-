import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { authorizeBusinessAccessSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const url = new URL(req.url);
        const businessId = url.searchParams.get("businessId");
        const days = parseInt(url.searchParams.get("days") || "7");

        if (!businessId) {
            return NextResponse.json({ error: "businessId es requerido" }, { status: 400 });
        }

        try {
            await authorizeBusinessAccessSession(session, businessId);
        } catch (authErr: any) {
            return NextResponse.json({ error: authErr.message || 'Forbidden' }, { status: authErr.status || 403 });
        }

        // Calcular fecha de inicio
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Obtener métricas por día
        const metrics = await prisma.dailyMetric.findMany({
            where: {
                businessId,
                date: {
                    gte: startDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Formatear datos para el gráfico
        const chartData = metrics.map((m: any) => ({
            name: m.date.toLocaleDateString('es-ES', { weekday: 'short' }),
            tokens: m.tokensUsed,
            messages: m.messagesReceived + m.messagesSent,
            ai: m.aiResponses
        }));

        // Calcular totales
        const stats = metrics.reduce((acc: any, current: any) => ({
            conversations: acc.conversations + current.messagesReceived,
            tasksAutomated: acc.tasksAutomated + current.aiResponses,
            tokens: acc.tokens + current.tokensUsed
        }), { conversations: 0, tasksAutomated: 0, tokens: 0 });

        return NextResponse.json({
            success: true,
            chartData,
            stats
        });

    } catch (error: any) {
        console.error("[API Metrics] Error:", error.message);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
