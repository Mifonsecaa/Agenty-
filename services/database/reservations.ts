import { prisma } from "@/lib/prisma";

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
            // Parsear fecha localmente (asumiendo input YYYY-MM-DD)
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

            // 3. Buscar reservas existentes DB
            // Usamos rangos de fecha UTC aproximados
            const dayStart = new Date(targetDate);
            dayStart.setHours(0,0,0,0);
            const dayEnd = new Date(targetDate);
            dayEnd.setHours(23,59,59,999);

            const existingReservations = await prisma.reservation.findMany({
                where: {
                    businessId,
                    startTime: {
                        gte: dayStart,
                        lte: dayEnd
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
                    const rH = r.startTime.getHours();
                    const rM = r.startTime.getMinutes();
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

            // 2. Calcular tiempos
            const [year, month, day] = dateStr.split("-").map(Number);
            const [hour, minute] = timeStr.split(":").map(Number);
            
            const startTime = new Date(year, month - 1, day, hour, minute);
            
            // Obtener duración del negocio para calcular endTime
            const business = await prisma.business.findUnique({ where: { id: businessId } });
            const config = business?.config as any;
            const duration = config?.defaultDurationMinutes || 60;
            
            const endTime = new Date(startTime.getTime() + duration * 60000);

            // 3. Crear reserva
            // @ts-ignore
            const reservation = await prisma.reservation.create({
                data: {
                    businessId,
                    customerId: customer.id,
                    startTime,
                    endTime,
                    status: "CONFIRMED",
                    details: details || "Reserva vía Agente IA",
                    metadata: { source: "whatsapp_agent" }
                }
            });

            return reservation;

        } catch (error) {
            console.error("[ReservationService] Create Error:", error);
            throw new Error("No se pudo crear la reserva.");
        }
    }
};

