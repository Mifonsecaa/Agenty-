import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { reservationService } from "@/services/database/reservations";

const MONTHS_ES = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
];

const MONTH_INDEX_ES: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
};

const WEEKDAY_INDEX_ES: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
};

const WEEKDAY_NAMES_ES = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
];

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function startOfToday(now = new Date()): Date {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function normalizeNaturalTime(input: string): string | null {
    const raw = input.trim();
    if (!raw) return null;

    const normalized = raw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    if (normalized === "mediodia") return "12:00";
    if (normalized === "medianoche") return "00:00";

    // HH:mm en 24h
    const hhmmMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) {
        const hour = Number(hhmmMatch[1]);
        const minute = Number(hhmmMatch[2]);
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    // Formatos AM/PM: 5pm, 5 pm, 5:30pm, 5:30 pm
    const amPmMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (amPmMatch) {
        let hour = Number(amPmMatch[1]);
        const minute = Number(amPmMatch[2] || "0");
        const meridiem = amPmMatch[3];
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

        if (meridiem === "pm" && hour !== 12) hour += 12;
        if (meridiem === "am" && hour === 12) hour = 0;

        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    // Formatos con lenguaje natural: "5 de la tarde", "8 de la noche", "9 de la manana"
    const daytimeMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?(?:\s*(?:de\s+la\s+)?)?(manana|tarde|noche)$/);
    if (daytimeMatch) {
        let hour = Number(daytimeMatch[1]);
        const minute = Number(daytimeMatch[2] || "0");
        const period = daytimeMatch[3];

        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

        if (period === "manana") {
            if (hour === 12) hour = 0;
        } else {
            // tarde/noche => PM
            if (hour !== 12) hour += 12;
        }

        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    // Hora solo numerica: 17, 5
    const hourOnlyMatch = normalized.match(/^(\d{1,2})$/);
    if (hourOnlyMatch) {
        const hour = Number(hourOnlyMatch[1]);
        if (hour < 0 || hour > 23) return null;
        return `${String(hour).padStart(2, "0")}:00`;
    }

    return null;
}

function isWeekdayOnlyExpression(input: string): boolean {
    const normalized = input
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    return /^(?:el\s+)?(?:(proximo|proxima)\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/.test(normalized);
}

function formatSpanishLongDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    return `${day} de ${MONTHS_ES[month - 1]} del ${year}`;
}

function resolveNextWeekday(targetWeekday: number, now: Date, forceNextWeek: boolean): Date {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let delta = (targetWeekday - candidate.getDay() + 7) % 7;

    // Si menciona "proximo", o cae hoy, saltamos a la semana siguiente para evitar ambiguedad.
    if (forceNextWeek || delta === 0) {
        delta += 7;
    }

    candidate.setDate(candidate.getDate() + delta);
    return candidate;
}

function normalizeNaturalDate(input: string, now = new Date()): string | null {
    const raw = input.trim();
    if (!raw) return null;

    // 1) Ya viene en formato ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const normalized = raw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    // 2) Palabras relativas
    if (normalized === "hoy" || normalized === "today") {
        return toIsoDate(new Date(now));
    }

    if (normalized === "manana" || normalized === "tomorrow") {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return toIsoDate(d);
    }

    if (normalized === "pasado manana" || normalized === "day after tomorrow") {
        const d = new Date(now);
        d.setDate(d.getDate() + 2);
        return toIsoDate(d);
    }

    // 3) Dia de semana: "lunes", "el lunes", "proximo lunes"
    const weekdayMatch = normalized.match(/^(?:el\s+)?(?:(proximo|proxima)\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/);
    if (weekdayMatch) {
        const isNextWeek = Boolean(weekdayMatch[1]);
        const weekday = weekdayMatch[2];
        const weekdayIndex = WEEKDAY_INDEX_ES[weekday];
        const d = resolveNextWeekday(weekdayIndex, now, isNextWeek);
        return toIsoDate(d);
    }

    // 4) "15 de marzo" o "15 de marzo de 2026"
    const textMonthMatch = normalized.match(/^(?:el\s+)?(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{4}))?$/);
    if (textMonthMatch) {
        const day = Number(textMonthMatch[1]);
        const monthName = textMonthMatch[2];
        const month = MONTH_INDEX_ES[monthName];
        let year = textMonthMatch[3] ? Number(textMonthMatch[3]) : now.getFullYear();

        if (!month || day < 1 || day > 31) return null;

        const candidate = new Date(year, month - 1, day);
        if (Number.isNaN(candidate.getTime())) return null;

        if (!textMonthMatch[3] && candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            year += 1;
            const nextYearCandidate = new Date(year, month - 1, day);
            if (Number.isNaN(nextYearCandidate.getTime())) return null;
            return toIsoDate(nextYearCandidate);
        }

        return toIsoDate(candidate);
    }

    // 5) Dia suelto: "15" o "el 15"
    const dayOnlyMatch = normalized.match(/^(?:el\s+)?(\d{1,2})$/);
    if (dayOnlyMatch) {
        const day = Number(dayOnlyMatch[1]);
        if (day < 1 || day > 31) return null;

        const candidate = new Date(now.getFullYear(), now.getMonth(), day);
        // Si ese dia ya paso en el mes actual, usar siguiente mes.
        if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            candidate.setMonth(candidate.getMonth() + 1);
        }
        return toIsoDate(candidate);
    }

    // 6) dd/mm, dd-mm, dd/mm/yyyy, dd-mm-yyyy
    const slashOrDashMatch = normalized.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
    if (slashOrDashMatch) {
        const day = Number(slashOrDashMatch[1]);
        const month = Number(slashOrDashMatch[2]);
        let year = slashOrDashMatch[3] ? Number(slashOrDashMatch[3]) : now.getFullYear();

        if (year < 100) year += 2000;
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;

        const candidate = new Date(year, month - 1, day);
        if (Number.isNaN(candidate.getTime())) return null;
        return toIsoDate(candidate);
    }

    return null;
}

export const createBookingTool = (businessId: string, customerPhone?: string) => {
    return new DynamicStructuredTool({
        name: "booking_manager",
        description: "Use this tool to check availability or create a reservation for the customer. ALWAYS check availability before creating a reservation.",
        schema: z.object({
            action: z.enum(["CHECK", "CREATE", "CANCEL"]).describe("Action to perform: CHECK for availability, CREATE to book, CANCEL to cancel."),
            date: z.string().describe("Date in natural language or YYYY-MM-DD. Examples: 'mañana', 'pasado mañana', 'lunes', 'próximo lunes', '15', '15/03', '15 de marzo', '2026-03-15'."),
            time: z.string().optional().describe("Time in natural language or HH:mm. Examples: '5pm', '5:30 pm', '5 de la tarde', '17:00'. Required for CREATE."),
            details: z.string().optional().describe("Extra details for the reservation (e.g., 'Haircut and beard')."),
            reservationCode: z.string().optional().describe("Optional reservation code (last 4 chars), used for CANCEL."),
        }),
        func: async ({ action, date, time, details, reservationCode }) => {
            try {
                const parsedDate = normalizeNaturalDate(date);
                if ((action === "CHECK" || action === "CREATE" || (action === "CANCEL" && !reservationCode)) && !parsedDate) {
                    return "No pude interpretar la fecha. Dime una fecha como 'mañana', 'pasado mañana', 'lunes', '15', '15/03', '15 de marzo' o '2026-03-15'.";
                }

                const normalizedCode = reservationCode?.trim().toLowerCase();

                const parsedTime = time ? normalizeNaturalTime(time) : null;

                const now = new Date();
                const today = startOfToday(now);
                const candidate = parsedDate ? new Date(`${parsedDate}T00:00:00`) : null;
                if (candidate && candidate < today) {
                    const suggestedDate = resolveNextWeekday(candidate.getDay(), now, false);
                    const suggestedDateText = formatSpanishLongDate(toIsoDate(suggestedDate));
                    const suggestedWeekday = WEEKDAY_NAMES_ES[suggestedDate.getDay()];
                    return `¿Te parece bien el próximo ${suggestedWeekday}, ${suggestedDateText}, a la misma hora, o prefieres otro día?`;
                }

                const fullDateText = parsedDate ? formatSpanishLongDate(parsedDate) : "";

                if (action === "CHECK") {
                    console.log(`[BookingTool] CHECK requested. businessId=${businessId}, rawDate=${date}, parsedDate=${parsedDate}`);
                    const result = await reservationService.checkAvailability(businessId, parsedDate);
                    if (!result.available) {
                        return `No hay disponibilidad para el ${fullDateText}. Motivo: ${result.reason || "Cerrado o sin cupo."}`;
                    }
                    const slots = result.slots || [];
                    if (slots.length === 0) {
                        return `No hay horarios libres para el ${fullDateText}. ¿Te propongo otro día?`;
                    }
                    return `Horarios disponibles para el ${fullDateText}: ${slots.join(", ")}.`;
                }

                if (action === "CREATE") {
                    console.log(
                        `[BookingTool] CREATE requested. businessId=${businessId}, customerPhone=${customerPhone || "missing"}, rawDate=${date}, parsedDate=${parsedDate}, rawTime=${time || "missing"}, parsedTime=${parsedTime || "invalid"}, details=${details || ""}`,
                    );
                    if (!time) return "Necesito la hora para confirmar la reserva (por ejemplo, '5 de la tarde' o '17:00').";
                    if (!parsedTime) return "No pude interpretar la hora. Dímela como '5pm', '5 de la tarde' o '17:00'.";
                    if (!customerPhone) return "Error: Customer phone number is missing. Cannot book.";

                    // Si el usuario dio solo dia de semana, pedimos confirmacion de la fecha exacta.
                    if (isWeekdayOnlyExpression(date)) {
                        return `Para evitar confusiones, ¿confirmas que quieres reservar para el ${fullDateText} a las ${parsedTime}?`;
                    }

                    const reservation = await reservationService.createReservation(businessId, customerPhone, parsedDate, parsedTime, details);
                    const bookingName = reservation.customerName && reservation.customerName !== "Cliente Nuevo"
                        ? reservation.customerName
                        : "Cliente";
                    const safeDetails = details?.trim();
                    console.log(
                        `[BookingTool] CREATE success. reservationId=${reservation.id}, customerPhone=${customerPhone}, date=${parsedDate}, time=${parsedTime}`,
                    );
                    return [
                        "Listo, tu reserva quedó confirmada ✅",
                        `A nombre de: ${bookingName}`,
                        `Fecha: ${fullDateText}`,
                        `Hora (Bogotá): ${parsedTime}`,
                        safeDetails ? `Detalle: ${safeDetails}` : "",
                        `Código de reserva: #${reservation.id.slice(-4)}`,
                    ].filter(Boolean).join("\n");
                }

                if (action === "CANCEL") {
                    console.log(
                        `[BookingTool] CANCEL requested. businessId=${businessId}, customerPhone=${customerPhone || "missing"}, code=${normalizedCode || ""}, rawDate=${date || ""}, parsedDate=${parsedDate || ""}, rawTime=${time || ""}, parsedTime=${parsedTime || ""}`,
                    );

                    if (!customerPhone) return "No tengo el número del cliente para cancelar la reserva.";

                    if (!normalizedCode && !parsedDate) {
                        return "Para cancelar, indícame el código de reserva o una fecha (por ejemplo: 'cancela mi reserva del lunes').";
                    }

                    if (!normalizedCode && !parsedTime) {
                        return "Para cancelar por fecha, también necesito la hora (por ejemplo, '5 de la tarde' o '17:00').";
                    }

                    const cancelled = await reservationService.cancelReservation(businessId, customerPhone, {
                        reservationCode: normalizedCode,
                        dateStr: parsedDate || undefined,
                        timeStr: parsedTime || undefined,
                    });

                    const cancelDateIso = cancelled.startTime instanceof Date
                        ? cancelled.startTime.toISOString().slice(0, 10)
                        : parsedDate || "";
                    const cancelDateText = cancelDateIso ? formatSpanishLongDate(cancelDateIso) : (parsedDate ? formatSpanishLongDate(parsedDate) : "");
                    const cancelTimeText = parsedTime || (cancelled.startTime instanceof Date
                        ? (() => {
                            const bogotaClock = new Date(cancelled.startTime.getTime() - 5 * 60 * 60 * 1000);
                            return `${String(bogotaClock.getUTCHours()).padStart(2, "0")}:${String(bogotaClock.getUTCMinutes()).padStart(2, "0")}`;
                        })()
                        : "");

                    return [
                        "Listo, tu reserva quedó cancelada ✅",
                        cancelled.customerName ? `A nombre de: ${cancelled.customerName}` : "",
                        cancelDateText ? `Fecha: ${cancelDateText}` : "",
                        cancelTimeText ? `Hora (Bogotá): ${cancelTimeText}` : "",
                        `Código de reserva: #${cancelled.reservationCode || cancelled.id.slice(-4)}`,
                    ].filter(Boolean).join("\n");
                }
                
                return "Invalid action.";
            } catch (error: any) {
                console.error(
                    `[BookingTool] Action failed. action=${action}, businessId=${businessId}, customerPhone=${customerPhone || "missing"}, date=${date}, time=${time || "missing"}. Error=${error?.message || error}`,
                );
                return `Error performing booking action: ${error.message}`;
            }
        },
    });
};

