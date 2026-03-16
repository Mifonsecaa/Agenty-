import { prisma } from "@/lib/prisma";

const BOGOTA_OFFSET_HOURS = -5; // America/Bogota (UTC-5, sin DST)

function parseIsoDateParts(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return { year, month, day };
}

function bogotaLocalToUtcDate(dateStr: string, timeStr: string): Date {
    const { year, month, day } = parseIsoDateParts(dateStr);
    const [hour, minute] = timeStr.split(":").map(Number);
    // Si Bogota es UTC-5, para llevar a UTC sumamos 5 horas.
    const utcHour = hour - BOGOTA_OFFSET_HOURS;
    return new Date(Date.UTC(year, month - 1, day, utcHour, minute, 0, 0));
}

function getBogotaDayUtcRange(dateStr: string) {
    const { year, month, day } = parseIsoDateParts(dateStr);
    const dayStartUtc = new Date(Date.UTC(year, month - 1, day, -BOGOTA_OFFSET_HOURS, 0, 0, 0));
    const nextDayStartUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);
    const dayEndUtc = new Date(nextDayStartUtc.getTime() - 1);
    return { dayStartUtc, dayEndUtc };
}

function getBogotaTimeParts(dateUtc: Date) {
    // Convertimos el instante UTC a reloj local de Bogota y leemos con getters UTC.
    const bogotaClock = new Date(dateUtc.getTime() + BOGOTA_OFFSET_HOURS * 60 * 60 * 1000);
    return {
        hour: bogotaClock.getUTCHours(),
        minute: bogotaClock.getUTCMinutes(),
    };
}

export const reservationService = {
    /**
     * Verifica disponibilidad para una fecha específica (YYYY-MM-DD)
     */
    async checkAvailability(businessId: string, dateStr: string) {
        console.log(`[ReservationService] Checking availability for business ${businessId} on ${dateStr}`);
        
        try {
            const business = await prisma.business.findUnique({
                where: { id: businessId }
            });

            if (!business) throw new Error("Negocio no encontrado");

            const config = business.config as any;
            // Parsear fecha local del negocio (America/Bogota)
            const [year, month, day] = dateStr.split("-").map(Number);
            const targetDate = new Date(year, month - 1, day);
            const dayOfWeek = targetDate.getDay() || 7; // 0=Domingo -> 7

            // 1. Buscar horario para este día
            const schedule = config.schedules?.find((s: any) => s.daysOfWeek.includes(dayOfWeek));

            if (!schedule) {
                return { available: false, reason: "El negocio está cerrado este día." };
            }

            // 2. Generar slots
            const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
            const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
            const duration = config.defaultDurationMinutes || 60;

            // Convertir todo a minutos para facilitar cálculos
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            const allSlots: string[] = [];
            for (let time = startTotalMinutes; time < endTotalMinutes; time += duration) {
                const h = Math.floor(time / 60).toString().padStart(2, '0');
                const m = (time % 60).toString().padStart(2, '0');
                allSlots.push(`${h}:${m}`);
            }

            // 3. Buscar reservas existentes DB para el dia local en Bogota
            const { dayStartUtc, dayEndUtc } = getBogotaDayUtcRange(dateStr);

            const existingReservations = await prisma.reservation.findMany({
                where: {
                    businessId,
                    startTime: {
                        gte: dayStartUtc,
                        lte: dayEndUtc
                    },
                    status: "CONFIRMED"
                }
            });

            // 4. Filtrar slots ocupados
            const availableSlots = allSlots.filter(slot => {
                const [h, m] = slot.split(":").map(Number);
                const slotTime = new Date(targetDate);
                slotTime.setHours(h, m, 0, 0);

                // Contar cuántas reservas hay en este slot (mismo inicio)
                const conflicts = existingReservations.filter(r => {
                    const { hour: rH, minute: rM } = getBogotaTimeParts(r.startTime);
                    return rH === h && rM === m;
                });
                
                // Verificar capacidad (default 1)
                return conflicts.length < (schedule.maxCapacity || 1);
            });

            return { available: true, slots: availableSlots };

        } catch (error) {
            console.error("[ReservationService] Error:", error);
            throw new Error("Error verificando disponibilidad.");
        }
    },

    /**
     * Crea una nueva reserva
     */
    async createReservation(businessId: string, customerPhone: string, dateStr: string, timeStr: string, details?: string) {
        console.log(`[ReservationService] Creating reservation for ${customerPhone} at ${dateStr} ${timeStr}`);
        
        try {
            // 1. Validar cliente
            let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
            if (!customer) {
                // Si no existe, lo creamos
                customer = await prisma.customer.create({
                    data: { phone: customerPhone, name: "Cliente Nuevo" }
                });
            }

            // 2. Calcular tiempos en zona horaria de Bogota y guardar en UTC
            const startTime = bogotaLocalToUtcDate(dateStr, timeStr);
            
            // Obtener duración del negocio para calcular endTime
            const business = await prisma.business.findUnique({ where: { id: businessId } });
            const config = business?.config as any;
            const duration = config?.defaultDurationMinutes || 60;
            
            const endTime = new Date(startTime.getTime() + duration * 60000);

            // 3. Crear reserva
            // @ts-ignore
            return {
                ...(await prisma.reservation.create({
                    data: {
                        businessId,
                        customerId: customer.id,
                        startTime,
                        endTime,
                        status: "CONFIRMED",
                        details: details || "Reserva vía Agente IA",
                        metadata: { source: "ai_agent" }
                    }
                })),
                customerName: customer.name || "Cliente",
                customerPhone: customer.phone,
                timeZone: "America/Bogota",
            };

        } catch (error) {
            console.error("[ReservationService] Create Error:", error);
            throw new Error("No se pudo crear la reserva.");
        }
    }
    ,

    /**
     * Cancela una reserva confirmada del cliente
     */
    async cancelReservation(
        businessId: string,
        customerPhone: string,
        params: { reservationCode?: string; dateStr?: string; timeStr?: string }
    ) {
        console.log(
            `[ReservationService] Cancelling reservation for ${customerPhone}. business=${businessId}, code=${params.reservationCode || ""}, date=${params.dateStr || ""}, time=${params.timeStr || ""}`,
        );

        try {
            const customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
            if (!customer) {
                throw new Error("No encontré un cliente asociado a este chat.");
            }

            let reservation = null as any;

            if (params.reservationCode) {
                reservation = await prisma.reservation.findFirst({
                    where: {
                        businessId,
                        customerId: customer.id,
                        status: "CONFIRMED",
                        id: { endsWith: params.reservationCode.toLowerCase() },
                    },
                    orderBy: { createdAt: "desc" },
                });
            } else if (params.dateStr && params.timeStr) {
                const startTime = bogotaLocalToUtcDate(params.dateStr, params.timeStr);
                reservation = await prisma.reservation.findFirst({
                    where: {
                        businessId,
                        customerId: customer.id,
                        status: "CONFIRMED",
                        startTime,
                    },
                    orderBy: { createdAt: "desc" },
                });
            } else {
                throw new Error("Para cancelar necesito el código de reserva o fecha y hora.");
            }

            if (!reservation) {
                throw new Error("No encontré una reserva activa con esos datos.");
            }

            const cancelled = await prisma.reservation.update({
                where: { id: reservation.id },
                data: {
                    status: "CANCELLED",
                    metadata: {
                        ...(reservation.metadata as any || {}),
                        cancelledBy: "ai_agent",
                        cancelledAt: new Date().toISOString(),
                    },
                },
            });

            return {
                ...cancelled,
                customerName: customer.name || "Cliente",
                customerPhone: customer.phone,
                reservationCode: cancelled.id.slice(-4),
                timeZone: "America/Bogota",
            };
        } catch (error) {
            console.error("[ReservationService] Cancel Error:", error);
            throw new Error(error instanceof Error ? error.message : "No se pudo cancelar la reserva.");
        }
    }
};

