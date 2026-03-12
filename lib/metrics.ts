import { prisma } from "./prisma";

export const metricsService = {
    async incrementMetric(businessId: string, type: 'messagesReceived' | 'messagesSent' | 'aiResponses' | 'tokensUsed', amount: number = 1) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.dailyMetric.upsert({
                where: {
                    businessId_date: {
                        businessId,
                        date: today
                    }
                },
                update: {
                    [type]: {
                        increment: amount
                    }
                },
                create: {
                    businessId,
                    date: today,
                    [type]: amount
                }
            });
        } catch (error) {
            console.error(`[MetricsService] Error incrementing metric ${type}:`, error);
        }
    }
};
