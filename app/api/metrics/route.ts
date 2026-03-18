import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const url = new URL(req.url);
        const businessId = url.searchParams.get("businessId");
        const days = parseInt(url.searchParams.get("days") || "7");

        if (!businessId) {
            return NextResponse.json({ error: "businessId es requerido" }, { status: 400 });
        }

        // Verificar pertenencia
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                user: { email: session.user.email }
            }
        });

        if (!business) {
            return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
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
