import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buildRequesterKey, checkRateLimit } from "@/lib/security/traffic-control";

type MetricsCacheValue = {
    expiresAt: number;
    payload: {
        success: true;
        chartData: Array<{ name: string; tokens: number; messages: number; ai: number }>;
        stats: { conversations: number; tasksAutomated: number; tokens: number };
    };
};

const metricsCache = new Map<string, MetricsCacheValue>();
const METRICS_CACHE_TTL_MS = Number(process.env.METRICS_CACHE_TTL_MS || 20000);

function getMetricsCacheKey(businessId: string, days: number) {
    return `${businessId}:${days}`;
}

function getCachedMetrics(key: string) {
    const hit = metricsCache.get(key);
    if (!hit) return null;
    if (hit.expiresAt <= Date.now()) {
        metricsCache.delete(key);
        return null;
    }
    return hit.payload;
}

function setCachedMetrics(key: string, payload: MetricsCacheValue["payload"]) {
    metricsCache.set(key, { payload, expiresAt: Date.now() + METRICS_CACHE_TTL_MS });
}

export async function GET(req: Request) {
    try {
        const requesterKey = buildRequesterKey(req);
        const rate = await checkRateLimit({
            scope: "api-metrics-get",
            key: requesterKey,
            maxRequests: Number(process.env.METRICS_RATE_LIMIT_MAX || 40),
            windowMs: Number(process.env.METRICS_RATE_LIMIT_WINDOW_MS || 60000),
        });

        if (!rate.allowed) {
            return NextResponse.json(
                { error: "Demasiadas solicitudes de métricas. Intenta de nuevo en unos segundos." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
                    },
                }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const url = new URL(req.url);
        const businessId = url.searchParams.get("businessId");
        const rawDays = parseInt(url.searchParams.get("days") || "7");
        const days = Number.isFinite(rawDays) ? Math.max(1, Math.min(90, rawDays)) : 7;

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

        const cacheKey = getMetricsCacheKey(businessId, days);
        const cachedPayload = getCachedMetrics(cacheKey);
        if (cachedPayload) {
            return NextResponse.json(cachedPayload);
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
            },
            take: days,
            select: {
                date: true,
                tokensUsed: true,
                messagesReceived: true,
                messagesSent: true,
                aiResponses: true,
            },
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

        const payload = {
            success: true,
            chartData,
            stats
        } as const;

        setCachedMetrics(cacheKey, payload);

        return NextResponse.json(payload);

    } catch (error: any) {
        console.error("[API Metrics] Error:", error.message);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
