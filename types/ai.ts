import { z } from "zod";

// 1. Definimos un bloque de horario (Sirve para la peluquería, el taller o el gimnasio)
export const ScheduleBlockSchema = z.object({
    activityName: z.string().describe("Nombre del servicio, ej: 'Crossfit', 'Corte de pelo', 'Revisión'"),
    daysOfWeek: z.array(z.number()).describe("Días de la semana, donde 1 es Lunes y 7 es Domingo"),
    startTime: z.string().describe("Hora de inicio en formato HH:mm (24h)"),
    endTime: z.string().describe("Hora de fin en formato HH:mm (24h)"),
    maxCapacity: z.number().describe("Cuántas personas pueden asistir al mismo tiempo. Ej: 15 para clases, 1 para citas individuales"),
});

// 2. Definimos el esquema maestro del negocio (Lo que irá a la columna JSONB de PostgreSQL)
export const BusinessConfigSchema = z.object({
    businessType: z.enum(["GROUP_CLASSES", "INDIVIDUAL_APPOINTMENTS"]).describe("Tipo de negocio"),
    businessName: z.string().describe("El nombre del negocio inferido del texto"),
    schedules: z.array(ScheduleBlockSchema).describe("Lista de todos los horarios disponibles"),
    agentTone: z.string().describe("El tono que debe usar el bot (ej. 'Amable, profesional, paisa, directo')"),
    defaultDurationMinutes: z.number().describe("Duración en minutos de un turno estándar"),
});

// Exportamos el tipo nativo de TypeScript para usarlo en el resto de la app
export type BusinessConfig = z.infer<typeof BusinessConfigSchema>;