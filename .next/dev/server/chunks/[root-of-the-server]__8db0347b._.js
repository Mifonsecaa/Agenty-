module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/types/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessConfigSchema",
    ()=>BusinessConfigSchema,
    "ScheduleBlockSchema",
    ()=>ScheduleBlockSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const ScheduleBlockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    activityName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Nombre del servicio, ej: 'Crossfit', 'Corte de pelo', 'Revisión'"),
    daysOfWeek: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()).describe("Días de la semana, donde 1 es Lunes y 7 es Domingo"),
    startTime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Hora de inicio en formato HH:mm (24h)"),
    endTime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Hora de fin en formato HH:mm (24h)"),
    maxCapacity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe("Cuántas personas pueden asistir al mismo tiempo. Ej: 15 para clases, 1 para citas individuales")
});
const BusinessConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "GROUP_CLASSES",
        "INDIVIDUAL_APPOINTMENTS"
    ]).describe("Tipo de negocio"),
    businessName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("El nombre del negocio inferido del texto"),
    schedules: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ScheduleBlockSchema).describe("Lista de todos los horarios disponibles"),
    agentTone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("El tono que debe usar el bot (ej. 'Amable, profesional, paisa, directo')"),
    defaultDurationMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe("Duración en minutos de un turno estándar")
});
}),
"[project]/services/ai/onboardingAgent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateBusinessConfig",
    ()=>generateBusinessConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$helpers$2f$zod$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/openai/helpers/zod.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/ai.ts [app-route] (ecmascript)");
;
;
;
// Inicializamos el cliente de OpenAI (Requiere que OPENAI_API_KEY esté en el archivo .env)
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]();
async function generateBusinessConfig(userInput) {
    const systemPrompt = `
    Eres el arquitecto de datos de 'Agenty', una plataforma de automatización para PyMEs.
    Tu objetivo es leer la descripción que hace el dueño sobre su negocio y extraer las reglas de agendamiento.
    
    REGLAS ESTRICTAS:
    - Asume que el negocio está en Colombia (zona horaria America/Bogota).
    - Si el dueño menciona un tono local (ej. Medellín, Bogotá), ajusta el 'agentTone' para que el bot futuro sea empático con esa región.
    - Si es un salón de belleza, taller o consultorio, 'maxCapacity' suele ser 1 (citas individuales).
    - Si es un centro de entrenamiento o gimnasio, 'maxCapacity' es mayor a 1 (clases grupales).
  `;
    try {
        const response = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userInput
                }
            ],
            // ¡Aquí está la magia! Obligamos a la IA a responder con la estructura exacta de Zod
            response_format: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$helpers$2f$zod$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["zodResponseFormat"])(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BusinessConfigSchema"], "business_configuration"),
            temperature: 0.2
        });
        const parsedData = response.choices[0].message.parsed;
        if (!parsedData) {
            throw new Error("La IA no pudo generar la configuración.");
        }
        return parsedData;
    } catch (error) {
        console.error("Error en el Onboarding Agent:", error);
        throw new Error("Fallo al procesar el texto del negocio.");
    }
}
}),
"[project]/app/api/onboarding/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$ai$2f$onboardingAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/ai/onboardingAgent.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        // 1. Extraemos el texto que el dueño escribió en la página web
        const body = await request.json();
        const { ownerDescription } = body;
        if (!ownerDescription) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "La descripción del negocio es obligatoria."
            }, {
                status: 400
            });
        }
        // 2. Le pasamos el texto a nuestro Agente de Onboarding
        console.log("Procesando texto con IA...");
        const businessConfig = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$ai$2f$onboardingAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateBusinessConfig"])(ownerDescription);
        // 3. Aquí iría el código para guardar en PostgreSQL (Prisma)
        // const newBusiness = await prisma.business.create({
        //   data: { config: businessConfig, ownerEmail: "..." }
        // });
        // 4. Devolvemos el JSON estructurado al Frontend para mostrar la confirmación
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "¡Agente configurado exitosamente!",
            data: businessConfig
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Hubo un problema al crear la configuración del agente."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8db0347b._.js.map