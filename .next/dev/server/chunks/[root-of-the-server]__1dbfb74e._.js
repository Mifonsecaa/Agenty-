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
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "query"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/services/database/business.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "saveWhatsAppCredentials",
    ()=>saveWhatsAppCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
async function saveWhatsAppCredentials(userId, accessToken) {
    try {
        // Aquí, en un futuro, podrías usar el token para obtener más detalles
        // como el Phone Number ID y el Business ID desde la API de Meta.
        // Por ahora, guardaremos solo el token.
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                userId
            }
        });
        if (!business) {
            throw new Error(`No se encontró un negocio para el usuario ${userId}`);
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.update({
            where: {
                id: business.id
            },
            data: {
                whatsappAccessToken: accessToken
            }
        });
        console.log(`Credenciales de WhatsApp guardadas para el negocio: ${business.name}`);
        return {
            success: true
        };
    } catch (error) {
        console.error("Error al guardar las credenciales de WhatsApp:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
}),
"[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$facebook$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/facebook.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$next$2d$auth$2f$prisma$2d$adapter$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@next-auth/prisma-adapter/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$business$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/database/business.ts [app-route] (ecmascript)"); // 1. Importar nuestro nuevo servicio
;
;
;
;
;
;
;
;
const authOptions = {
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$next$2d$auth$2f$prisma$2d$adapter$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]),
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$facebook$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "email,public_profile,whatsapp_business_management,whatsapp_business_messaging"
                }
            }
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) throw new Error("Credenciales inválidas");
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user || !user.password) throw new Error("Usuario no encontrado");
                const isPasswordCorrect = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
                if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");
                return user;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async signIn ({ user, account }) {
            // 2. Si la conexión es de Facebook y tenemos un token...
            if (account?.provider === 'facebook' && account.access_token) {
                console.log("Recibido token de Facebook, guardando credenciales...");
                // 3. Llamamos a la función para guardar el token en la base de datos
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$database$2f$business$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveWhatsAppCredentials"])(user.id, account.access_token);
            }
            return true; // Permitir siempre el inicio de sesión/conexión
        },
        async session ({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const ScheduleBlockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    activityName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Nombre del servicio, ej: 'Crossfit', 'Corte de pelo', 'Revisión'"),
    daysOfWeek: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()).describe("Días de la semana, donde 1 es Lunes y 7 es Domingo"),
    startTime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Hora de inicio en formato HH:mm (24h)"),
    endTime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Hora de fin en formato HH:mm (24h)"),
    maxCapacity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe("Cuántas personas pueden asistir al mismo tiempo. Ej: 15 para clases, 1 para citas individuales")
});
const BusinessConfigSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "GROUP_CLASSES",
        "INDIVIDUAL_APPOINTMENTS"
    ]).describe("Tipo de negocio"),
    businessName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("El nombre del negocio inferido del texto"),
    businessDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("Todo el conocimiento clave: productos, precios, reglas de domicilio, detalles de los servicios y requerimientos especiales mencionados por el usuario."),
    schedules: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ScheduleBlockSchema).describe("Lista de todos los horarios disponibles"),
    agentTone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("El tono que debe usar el bot (ej. 'Amable, profesional, paisa, directo')"),
    defaultDurationMinutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe("Duración en minutos de un turno estándar")
});
}),
"[project]/services/ai/onboardingAgent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateBusinessConfig",
    ()=>generateBusinessConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$helpers$2f$zod$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/openai/helpers/zod.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/ai.ts [app-route] (ecmascript)");
;
;
;
async function generateBusinessConfig(userInput) {
    const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
        apiKey: process.env.OPENAI_API_KEY
    });
    const systemPrompt = `
    Eres el arquitecto de datos de 'Agenty', una plataforma de automatización para PyMEs.
    Tu objetivo es leer la descripción que hace el dueño sobre su negocio y extraer absolutamente todas las reglas, horarios y precios.
    
    REGLAS ESTRICTAS DE EXTRACCIÓN:
    1. EXTRACCIÓN DE PRECIOS Y PRODUCTOS: Todo lo relacionado a productos, precios (ej. 'cortes a 5k'), reglas de domicilio o requerimientos especiales DEBE extraerse y guardarse en el campo 'businessDescription'. ¡No omitas ningún precio o servicio!
    2. HORARIOS: Si el cliente dice 'Lunes a Domingo', debes incluir los días [1, 2, 3, 4, 5, 6, 7] en 'daysOfWeek'. Extrae correctamente las horas en formato HH:mm (ej. 7am es 07:00, 7pm es 19:00). Crea los bloques de 'schedules' que sean necesarios.
    3. CAPACIDAD: Si es un salón de belleza, taller o consultorio, 'maxCapacity' es 1 (citas individuales). Si es un gimnasio, 'maxCapacity' > 1.
    4. TONO: Infiere el 'agentTone' para que el bot futuro sea empático.
  `;
    try {
        const response = await openai.chat.completions.create({
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
            response_format: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$helpers$2f$zod$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["zodResponseFormat"])(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BusinessConfigSchema"], "business_config")
        });
        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error("No parsed response from OpenAI");
        }
        const config = JSON.parse(content);
        return config;
    } catch (error) {
        console.error("Error generating business config with OpenAI:", error);
        throw new Error("Fallo al procesar el texto del negocio con Inteligencia Artificial.");
    }
}
}),
"[project]/lib/validation/schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatSchema",
    ()=>chatSchema,
    "createBusinessSchema",
    ()=>createBusinessSchema,
    "generatePromptSchema",
    ()=>generatePromptSchema,
    "improveDescriptionSchema",
    ()=>improveDescriptionSchema,
    "knowledgeCreateSchema",
    ()=>knowledgeCreateSchema,
    "knowledgeQuerySchema",
    ()=>knowledgeQuerySchema,
    "loginSchema",
    ()=>loginSchema,
    "metricsQuerySchema",
    ()=>metricsQuerySchema,
    "onboardingSchema",
    ()=>onboardingSchema,
    "registerSchema",
    ()=>registerSchema,
    "telegramWebhookSchema",
    ()=>telegramWebhookSchema,
    "updateBusinessSchema",
    ()=>updateBusinessSchema,
    "whatsappConnectSchema",
    ()=>whatsappConnectSchema,
    "whatsappWebhookSchema",
    ()=>whatsappWebhookSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const registerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Email inválido"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, "El nombre debe tener al menos 2 caracteres")
});
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Email inválido"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "La contraseña es requerida")
});
const createBusinessSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El nombre del negocio es requerido"),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    config: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const updateBusinessSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El nombre del negocio es requerido").optional(),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    config: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional()
});
const onboardingSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ownerDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10, "La descripción debe tener al menos 10 caracteres")
});
const knowledgeQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido")
});
const knowledgeCreateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El contenido es requerido").optional(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El nombre es requerido").optional(),
    url: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url("La URL no es válida").optional(),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
}).refine((data)=>{
    if (data.url) return true;
    return Boolean(data.text && data.name);
}, {
    message: "Debes enviar URL o contenido con nombre",
    path: [
        "text"
    ]
});
const chatSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El mensaje es requerido"),
    conversationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const improveDescriptionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(5, "El texto debe tener al menos 5 caracteres")
});
const generatePromptSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10, "La descripción debe tener al menos 10 caracteres"),
    context: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const metricsQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    startDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    endDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const telegramWebhookSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    update_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        message_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        from: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            first_name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
        }),
        text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }).optional()
});
const whatsappWebhookSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    messaging_product: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    entry: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        changes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
                messaging_product: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
                messages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional()
            })
        }))
    }))
});
const whatsappConnectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    businessId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El businessId es requerido"),
    phoneNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido"),
    accessToken: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "El accessToken es requerido")
});
}),
"[project]/lib/validation/validate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "serverErrorResponse",
    ()=>serverErrorResponse,
    "successResponse",
    ()=>successResponse,
    "validateData",
    ()=>validateData,
    "validationErrorResponse",
    ()=>validationErrorResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/ZodError.js [app-route] (ecmascript)");
;
;
function validateData(data, schema) {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData
        };
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodError"]) {
            const errors = error.issues.map((err)=>({
                    field: err.path.join(".") || "root",
                    message: err.message
                }));
            return {
                success: false,
                errors
            };
        }
        return {
            success: false,
            errors: [
                {
                    field: "root",
                    message: "Error de validación desconocido"
                }
            ]
        };
    }
}
function validationErrorResponse(errors) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: "Datos inválidos",
        details: errors
    }, {
        status: 400
    });
}
function serverErrorResponse(message = "Error interno del servidor") {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: message
    }, {
        status: 500
    });
}
function successResponse(data, status = 200) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data
    }, {
        status
    });
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/lib/rag/retriever.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invalidateRagRetrieverCacheForBusiness",
    ()=>invalidateRagRetrieverCacheForBusiness,
    "retrieveRagContext",
    ()=>retrieveRagContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
const retrievalCache = new Map();
const retrievalKeysByBusiness = new Map();
const knowledgePresenceCache = new Map();
const RAG_RETRIEVAL_CACHE_TTL_MS = Number(process.env.RAG_RETRIEVAL_CACHE_TTL_MS || 90000);
const RAG_RETRIEVAL_CACHE_MAX_ENTRIES = Number(process.env.RAG_RETRIEVAL_CACHE_MAX_ENTRIES || 600);
const RAG_RETRIEVAL_CANDIDATES = Number(process.env.RAG_RETRIEVAL_CANDIDATES || 10);
const RAG_RETRIEVAL_TOP_K = Number(process.env.RAG_RETRIEVAL_TOP_K || 4);
const RAG_MIN_VECTOR_SIMILARITY = Number(process.env.RAG_MIN_VECTOR_SIMILARITY || 0.6);
const RAG_CONTEXT_MAX_CHARS = Number(process.env.RAG_CONTEXT_MAX_CHARS || 2600);
const RAG_CONTEXT_MAX_TOKENS = Number(process.env.RAG_CONTEXT_MAX_TOKENS || 900);
const RAG_MULTI_QUERY_ENABLED = (process.env.RAG_MULTI_QUERY_ENABLED || "true").toLowerCase() !== "false";
const RAG_MULTI_QUERY_MAX_VARIANTS = Number(process.env.RAG_MULTI_QUERY_MAX_VARIANTS || 2);
const RAG_KNOWLEDGE_PRESENCE_TTL_MS = Number(process.env.RAG_KNOWLEDGE_PRESENCE_TTL_MS || 90000);
let embeddingsClient = null;
function getEmbeddingsClient() {
    if (!embeddingsClient) {
        embeddingsClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-3-small"
        });
    }
    return embeddingsClient;
}
function nowMs() {
    return Date.now();
}
function buildKey(parts) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(parts)).digest("hex");
}
function normalizeForMatch(value) {
    return value.toLowerCase().replace(/[^a-z0-9\u00c0-\u017f\s]/gi, " ").replace(/\s+/g, " ").trim();
}
function extractTerms(value) {
    return normalizeForMatch(value).split(" ").filter((term)=>term.length >= 3).slice(0, 20);
}
function lexicalOverlapScore(queryTerms, content) {
    if (!queryTerms.length || !content) return 0;
    const normalized = normalizeForMatch(content);
    let hits = 0;
    for (const term of queryTerms){
        if (normalized.includes(term)) hits += 1;
    }
    return hits / queryTerms.length;
}
function estimateTokens(value) {
    return Math.max(1, Math.ceil(value.length / 4));
}
function shouldSkipRag(query) {
    if ((process.env.RAG_ENABLE_HEURISTIC_SKIP || "true").toLowerCase() === "false") {
        return {
            skipped: false
        };
    }
    const normalized = normalizeForMatch(query);
    if (!normalized || normalized.length < 8) {
        return {
            skipped: true,
            reason: "short_query"
        };
    }
    const smallTalk = [
        "hola",
        "buenas",
        "gracias",
        "ok",
        "dale",
        "hello",
        "thanks",
        "hi"
    ];
    if (smallTalk.includes(normalized)) {
        return {
            skipped: true,
            reason: "small_talk"
        };
    }
    return {
        skipped: false
    };
}
function buildQueryVariants(query) {
    const normalized = normalizeForMatch(query);
    const variants = new Set();
    variants.add(query.trim());
    if (!RAG_MULTI_QUERY_ENABLED) {
        return Array.from(variants).filter(Boolean);
    }
    const withoutPoliteness = normalized.replace(/\b(por favor|porfa|me ayudas|me puedes|podrias|podrias decirme|quiero saber)\b/gi, " ").replace(/\s+/g, " ").trim();
    if (withoutPoliteness && withoutPoliteness !== normalized) {
        variants.add(withoutPoliteness);
    }
    const tokens = normalized.split(" ").filter((t)=>t.length >= 3);
    if (tokens.length >= 6) {
        variants.add(tokens.slice(0, 6).join(" "));
    }
    return Array.from(variants).filter(Boolean).slice(0, Math.max(1, Math.min(3, RAG_MULTI_QUERY_MAX_VARIANTS)));
}
async function retrieveRowsForQuery(params) {
    const queryVector = await params.embeddings.embedQuery(params.queryText);
    const vectorStr = `[${queryVector.join(",")}]`;
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
    SELECT content, metadata, (embedding <-> ${vectorStr}::vector) AS distance
    FROM "KnowledgeItem"
    WHERE "businessId" = ${params.businessId}
      AND embedding IS NOT NULL
    ORDER BY embedding <-> ${vectorStr}::vector
    LIMIT ${params.candidatesLimit}
  `;
    return rows;
}
function pruneExpired(cache) {
    const now = nowMs();
    for (const [key, entry] of cache.entries()){
        if (entry.expiresAt <= now) {
            cache.delete(key);
        }
    }
}
function enforceMaxEntries(cache, maxEntries) {
    if (cache.size <= maxEntries) return;
    const ordered = Array.from(cache.entries()).sort((a, b)=>a[1].lastAccessAt - b[1].lastAccessAt);
    const toDelete = cache.size - maxEntries;
    for(let i = 0; i < toDelete; i++){
        const key = ordered[i]?.[0];
        if (key) cache.delete(key);
    }
}
function getCachedResult(key) {
    const entry = retrievalCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= nowMs()) {
        retrievalCache.delete(key);
        return null;
    }
    entry.lastAccessAt = nowMs();
    return entry.value;
}
function setCachedResult(businessId, key, value) {
    retrievalCache.set(key, {
        value,
        expiresAt: nowMs() + RAG_RETRIEVAL_CACHE_TTL_MS,
        lastAccessAt: nowMs()
    });
    const keySet = retrievalKeysByBusiness.get(businessId) || new Set();
    keySet.add(key);
    retrievalKeysByBusiness.set(businessId, keySet);
    pruneExpired(retrievalCache);
    enforceMaxEntries(retrievalCache, RAG_RETRIEVAL_CACHE_MAX_ENTRIES);
}
function capContext(chunks) {
    const maxChars = Math.max(600, RAG_CONTEXT_MAX_CHARS);
    const maxTokens = Math.max(200, RAG_CONTEXT_MAX_TOKENS);
    const selected = [];
    let usedChars = 0;
    let usedTokens = 0;
    for (const chunk of chunks){
        const value = chunk.trim();
        if (!value) continue;
        const nextChars = value.length + 2;
        const nextTokens = estimateTokens(value);
        if (selected.length > 0 && (usedChars + nextChars > maxChars || usedTokens + nextTokens > maxTokens)) {
            break;
        }
        if (selected.length === 0 && (nextChars > maxChars || nextTokens > maxTokens)) {
            const maxFromTokens = Math.max(200, maxTokens * 4);
            selected.push(value.slice(0, Math.min(maxChars, maxFromTokens)));
            break;
        }
        selected.push(value);
        usedChars += nextChars;
        usedTokens += nextTokens;
    }
    return selected;
}
async function hasKnowledgeForBusiness(businessId) {
    const cached = getCacheValue(knowledgePresenceCache, businessId);
    if (typeof cached === "boolean") {
        return cached;
    }
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findFirst({
        where: {
            businessId
        },
        select: {
            id: true
        }
    });
    const hasKnowledge = Boolean(row?.id);
    setCachedResultForPresence(businessId, hasKnowledge);
    return hasKnowledge;
}
function setCachedResultForPresence(businessId, hasKnowledge) {
    knowledgePresenceCache.set(businessId, {
        value: hasKnowledge,
        expiresAt: nowMs() + RAG_KNOWLEDGE_PRESENCE_TTL_MS,
        lastAccessAt: nowMs()
    });
    pruneExpired(knowledgePresenceCache);
    enforceMaxEntries(knowledgePresenceCache, 1000);
}
async function retrieveRagContext(params) {
    const businessId = params.businessId;
    const query = (params.query || "").trim();
    if (!query || !process.env.OPENAI_API_KEY) {
        return {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: true,
            skipReason: "missing_query_or_key"
        };
    }
    const skip = shouldSkipRag(query);
    if (skip.skipped) {
        return {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: true,
            skipReason: skip.reason
        };
    }
    const hasKnowledge = await hasKnowledgeForBusiness(businessId);
    if (!hasKnowledge) {
        return {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: true,
            skipReason: "no_knowledge"
        };
    }
    const cacheKey = buildKey([
        "retrieval",
        businessId,
        normalizeForMatch(query)
    ]);
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
    const embeddings = getEmbeddingsClient();
    const queryTerms = extractTerms(query);
    const candidatesLimit = Math.max(4, Math.min(20, RAG_RETRIEVAL_CANDIDATES));
    const topK = Math.max(1, Math.min(8, RAG_RETRIEVAL_TOP_K));
    const variants = buildQueryVariants(query);
    const rowBatches = await Promise.all(variants.map((variant)=>retrieveRowsForQuery({
            businessId,
            queryText: variant,
            embeddings,
            candidatesLimit
        })));
    const rows = [];
    for (const batch of rowBatches){
        for(let i = 0; i < batch.length; i++){
            rows.push({
                ...batch[i],
                rank: i + 1
            });
        }
    }
    if (!rows.length) {
        const empty = {
            selected: [],
            ragContext: "",
            availableFiles: [],
            skipped: false
        };
        setCachedResult(businessId, cacheKey, empty);
        return empty;
    }
    const fusedByKey = new Map();
    for (const row of rows){
        const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
        const distance = Number(row.distance ?? 2);
        const vectorScore = Math.max(0, 1 - distance);
        const lexicalScore = lexicalOverlapScore(queryTerms, row.content || "");
        const rrfBoost = 1 / (row.rank + 50);
        const combinedScore = vectorScore * 0.66 + lexicalScore * 0.24 + rrfBoost * 0.10;
        const stableId = typeof metadata.contentHash === "string" && metadata.contentHash ? metadata.contentHash : buildKey([
            row.content.slice(0, 180),
            metadata.sourceId || ""
        ]);
        const current = {
            content: row.content,
            metadata,
            distance,
            vectorScore,
            lexicalScore,
            combinedScore
        };
        const prev = fusedByKey.get(stableId);
        if (!prev || current.combinedScore > prev.combinedScore) {
            fusedByKey.set(stableId, current);
        }
    }
    const ranked = Array.from(fusedByKey.values()).filter((item)=>item.vectorScore >= RAG_MIN_VECTOR_SIMILARITY || item.lexicalScore >= 0.28).sort((a, b)=>b.combinedScore - a.combinedScore).slice(0, topK);
    const availableFiles = [];
    const contextChunks = [];
    const seenHashes = new Set();
    for (const item of ranked){
        const hash = typeof item.metadata.contentHash === "string" ? item.metadata.contentHash : buildKey([
            "fallback",
            item.content.slice(0, 180)
        ]);
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);
        const fileUrl = typeof item.metadata.fileUrl === "string" ? item.metadata.fileUrl : "";
        const title = typeof item.metadata.title === "string" ? item.metadata.title : typeof item.metadata.fileName === "string" ? item.metadata.fileName : "Archivo adjunto";
        let text = item.content;
        if (fileUrl) {
            availableFiles.push({
                url: fileUrl,
                description: `Documento: ${title}`
            });
            text += `\n[ESTE FRAGMENTO CONTIENE UN ARCHIVO: ${fileUrl}]`;
        }
        contextChunks.push(text);
    }
    const ragContext = capContext(contextChunks).join("\n\n");
    const result = {
        selected: ranked,
        ragContext,
        availableFiles,
        skipped: false
    };
    setCachedResult(businessId, cacheKey, result);
    return result;
}
function invalidateRagRetrieverCacheForBusiness(businessId) {
    const keys = retrievalKeysByBusiness.get(businessId);
    if (!keys) return;
    for (const key of keys.values()){
        retrievalCache.delete(key);
    }
    retrievalKeysByBusiness.delete(businessId);
    knowledgePresenceCache.delete(businessId);
}
}),
"[project]/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aiService",
    ()=>aiService,
    "invalidateAiCachesForBusiness",
    ()=>invalidateAiCachesForBusiness
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/retriever.ts [app-route] (ecmascript)");
;
;
;
;
;
console.log("[AIService] Module Loading...");
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || '');
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY || ''
});
const RESPONSE_CACHE_TTL_MS = Number(process.env.AI_RESPONSE_CACHE_TTL_MS || 45000);
const RESPONSE_CACHE_MAX_ENTRIES = Number(process.env.AI_RESPONSE_CACHE_MAX_ENTRIES || 300);
const responseCache = new Map();
const responseKeysByBusiness = new Map();
const businessCache = new Map();
const BUSINESS_CACHE_TTL_MS = Number(process.env.AI_BUSINESS_CACHE_TTL_MS || 45000);
function nowMs() {
    return Date.now();
}
function pruneExpired(cache) {
    const now = nowMs();
    for (const [key, entry] of cache.entries()){
        if (entry.expiresAt <= now) {
            cache.delete(key);
        }
    }
}
function enforceMaxEntries(cache, maxEntries) {
    if (cache.size <= maxEntries) return;
    const entriesByLastAccess = Array.from(cache.entries()).sort((a, b)=>a[1].lastAccessAt - b[1].lastAccessAt);
    const toDelete = cache.size - maxEntries;
    for(let i = 0; i < toDelete; i++){
        const key = entriesByLastAccess[i]?.[0];
        if (key) cache.delete(key);
    }
}
function getCacheValue(cache, key) {
    const entry = cache.get(key);
    if (!entry) return null;
    const now = nowMs();
    if (entry.expiresAt <= now) {
        cache.delete(key);
        return null;
    }
    entry.lastAccessAt = now;
    return entry.value;
}
function setCacheValue(cache, key, value, ttlMs, maxEntries) {
    const now = nowMs();
    cache.set(key, {
        value,
        expiresAt: now + ttlMs,
        lastAccessAt: now
    });
    pruneExpired(cache);
    enforceMaxEntries(cache, maxEntries);
}
function registerCacheKey(index, businessId, key) {
    if (!businessId) return;
    const set = index.get(businessId) || new Set();
    set.add(key);
    index.set(businessId, set);
}
async function getBusinessSnapshot(businessId) {
    const cached = getCacheValue(businessCache, businessId);
    if (cached) {
        return cached;
    }
    const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findUnique({
        where: {
            id: businessId
        },
        select: {
            id: true,
            name: true,
            config: true
        }
    });
    if (!business) {
        return null;
    }
    setCacheValue(businessCache, businessId, business, BUSINESS_CACHE_TTL_MS, 500);
    return business;
}
function clearCacheByBusiness(cache, index, businessId) {
    const keys = index.get(businessId);
    if (!keys) return;
    for (const key of keys.values()){
        cache.delete(key);
    }
    index.delete(businessId);
}
function buildCacheKey(parts) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(parts)).digest("hex");
}
function compactMessagesForKey(messages) {
    return messages.slice(-6).map((m)=>({
            role: m.role,
            content: m.content.slice(0, 300)
        }));
}
const aiService = {
    async generateResponse (businessId, messages, options = {}) {
        try {
            console.log(`[AIService] Starting generation for businessId: ${businessId}`);
            // 1. Obtener la configuración del negocio
            const business = options.businessSnapshot || await getBusinessSnapshot(businessId);
            if (!business) {
                console.error(`[AIService] Business NOT FOUND in DB for ID: ${businessId}`);
                throw new Error("Negocio no encontrado en la base de datos");
            }
            // 2. Recuperar Contexto RAG (Base de Conocimiento)
            let ragContext = "";
            let availableFiles = [];
            try {
                const lastUserMessage = messages.filter((m)=>m.role === 'user').pop()?.content || "";
                if (lastUserMessage && process.env.OPENAI_API_KEY) {
                    const retrieval = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveRagContext"])({
                        businessId,
                        query: lastUserMessage
                    });
                    ragContext = retrieval.ragContext;
                    availableFiles = retrieval.availableFiles;
                    console.log(`[AIService] RAG retrieval selected ${retrieval.selected.length} chunks`);
                }
            } catch (ragError) {
                console.error("[AIService] Error en RAG retrieval:", ragError);
            }
            const config = business.config;
            let systemPrompt = options.systemPrompt?.trim() || config?.systemPrompt || `Eres un asistente virtual experto para ${business.name}. Sé amable, conciso y utiliza emojis. Contexto del negocio: ${config?.businessDescription || ''}`;
            // Inyectar contexto RAG al prompt
            if (ragContext) {
                systemPrompt += `\n\nINFORMACIÓN RELEVANTE DE TU BASE DE CONOCIMIENTO (RAG):\n${ragContext}`;
            }
            // Inyectar instrucciones para archivos
            if (availableFiles.length > 0) {
                systemPrompt += `\n\nTIENES ACCESO A LOS SIGUIENTES ARCHIVOS. Si el usuario solicita explícitamente ver el menú, catálogo, horario o documento mencionado, DEBES añadir al final de tu respuesta el comando: [MEDIA_URL: <url_del_archivo>].
                
                Archivos disponibles:
                ${availableFiles.map((f)=>`- ${f.description} (URL: ${f.url})`).join("\n")}`;
            }
            // 2. Determinar proveedor - Preferimos OpenAI si está disponible debido a restricciones regionales de Gemini
            const provider = options.provider || config?.aiProvider || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini');
            console.log(`[AIService] Business: ${business.name}, Provider Initial Choice: ${provider}`);
            const responseCacheKey = buildCacheKey([
                "response",
                businessId,
                provider,
                systemPrompt,
                compactMessagesForKey(messages)
            ]);
            const cachedResponse = getCacheValue(responseCache, responseCacheKey);
            if (cachedResponse) {
                console.log("[AIService] Response cache hit");
                return cachedResponse;
            }
            const callOpenAI = async ()=>{
                if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
                console.log("[AIService] Calling OpenAI (gpt-4o-mini)...");
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        ...messages
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                });
                return response.choices[0].message.content;
            };
            const callGitHub = async ()=>{
                if (!process.env.GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");
                console.log("[AIService] Calling GitHub Models (gpt-4o)...");
                const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
                    baseURL: "https://models.inference.ai.azure.com",
                    apiKey: process.env.GITHUB_TOKEN
                });
                const response = await client.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        ...messages
                    ],
                    model: "gpt-4o",
                    temperature: 0.7,
                    max_tokens: 300
                });
                return response.choices[0].message.content;
            };
            const callGemini = async ()=>{
                if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
                console.log("[AIService] Calling Gemini (gemini-1.5-flash)...");
                const model = genAI.getGenerativeModel({
                    model: 'gemini-1.5-flash'
                });
                const history = messages.slice(0, -1).map((msg)=>({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [
                            {
                                text: msg.content
                            }
                        ]
                    }));
                const lastMessage = messages[messages.length - 1].content;
                const chat = model.startChat({
                    history,
                    systemInstruction: {
                        role: "system",
                        parts: [
                            {
                                text: systemPrompt
                            }
                        ]
                    },
                    generationConfig: {
                        maxOutputTokens: 300,
                        temperature: 0.7
                    }
                });
                const result = await chat.sendMessage(lastMessage);
                return result.response.text();
            };
            let finalResponse = "";
            if (provider === 'openai') {
                finalResponse = await callOpenAI() || "";
            } else if (provider === 'github') {
                finalResponse = await callGitHub() || "";
            } else {
                try {
                    finalResponse = await callGemini() || "";
                } catch (geminiErr) {
                    console.error("[AIService] Gemini failed, checking for OpenAI fallback...", geminiErr.message || geminiErr);
                    if (process.env.OPENAI_API_KEY) {
                        console.log("[AIService] FALLBACK TO OPENAI TRIGGERED");
                        finalResponse = await callOpenAI() || "";
                    } else {
                        throw geminiErr;
                    }
                }
            }
            setCacheValue(responseCache, responseCacheKey, finalResponse, RESPONSE_CACHE_TTL_MS, RESPONSE_CACHE_MAX_ENTRIES);
            registerCacheKey(responseKeysByBusiness, businessId, responseCacheKey);
            return finalResponse;
        } catch (error) {
            console.error("[AIService] FINAL CRITICAL ERROR:", error.message || error);
            return "Lo siento, tuve un problema técnico al procesar tu mensaje. ¿Podrías repetirlo?";
        }
    }
};
function invalidateAiCachesForBusiness(businessId) {
    clearCacheByBusiness(responseCache, responseKeysByBusiness, businessId);
    businessCache.delete(businessId);
}
}),
"[project]/lib/rag/ingestion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IngestionService",
    ()=>IngestionService,
    "ingestionService",
    ()=>ingestionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/textsplitters/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$text_splitter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/textsplitters/dist/text_splitter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/retriever.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function normalizeContent(value) {
    return value.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function hashText(value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(value).digest("hex");
}
function estimateTokenCount(value) {
    return Math.max(1, Math.ceil(value.length / 4));
}
function detectLang(value) {
    return /[\u00C0-\u017F]|\b(el|la|los|las|de|para|con|sin|que|por)\b/i.test(value) ? "es" : "unknown";
}
function buildSourceId(businessId, metadata) {
    if (typeof metadata.sourceId === "string" && metadata.sourceId.trim()) {
        return metadata.sourceId.trim();
    }
    const seed = [
        metadata.url || "",
        metadata.fileName || "",
        metadata.title || "",
        metadata.source || "manual_ingestion"
    ].join("|");
    if (!seed.replace(/\|/g, "").trim()) {
        return `manual:${businessId}`;
    }
    return `src:${hashText(seed).slice(0, 16)}`;
}
class IngestionService {
    splitter;
    embeddings;
    constructor(){
        this.splitter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$textsplitters$2f$dist$2f$text_splitter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RecursiveCharacterTextSplitter"]({
            chunkSize: Number(process.env.RAG_CHUNK_SIZE || 700),
            chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP || 120),
            separators: [
                "\n\n",
                "\n",
                ". ",
                "? ",
                "! ",
                "; ",
                ", ",
                " "
            ]
        });
        this.embeddings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
            modelName: "text-embedding-3-small"
        });
    }
    async ingestText(businessId, text, metadata = {}) {
        console.log(`[Ingestion] Iniciando ingesta para negocio: ${businessId}`);
        console.log(`[Ingestion] Tamaño del texto: ${text.length} caracteres`);
        try {
            const normalizedText = normalizeContent(text || "");
            if (!normalizedText) {
                throw new Error("EMPTY_TEXT_AFTER_NORMALIZATION");
            }
            const minChunkChars = Number(process.env.RAG_MIN_CHUNK_CHARS || 60);
            const sourceId = buildSourceId(businessId, metadata);
            // 1. Dividir texto en fragmentos (Chunks)
            console.log("[Ingestion] Dividiendo texto en chunks...");
            const docs = await this.splitter.createDocuments([
                normalizedText
            ]);
            console.log(`[Ingestion] Creados ${docs.length} chunks`);
            const candidateChunks = docs.map((doc)=>normalizeContent(doc.pageContent || "")).filter((chunk)=>chunk.length >= minChunkChars);
            if (!candidateChunks.length) {
                throw new Error("NO_VALID_CHUNKS");
            }
            // Deduplicacion intra-documento por hash de contenido normalizado.
            const localDedup = new Set();
            const dedupedChunks = [];
            for (const chunk of candidateChunks){
                const contentHash = hashText(chunk);
                if (localDedup.has(contentHash)) continue;
                localDedup.add(contentHash);
                dedupedChunks.push({
                    content: chunk,
                    hash: contentHash
                });
            }
            // Deduplicacion contra chunks ya ingestados para el mismo sourceId.
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.findMany({
                where: {
                    businessId,
                    metadata: {
                        path: [
                            "sourceId"
                        ],
                        equals: sourceId
                    }
                },
                select: {
                    metadata: true
                },
                take: 3000,
                orderBy: {
                    createdAt: "desc"
                }
            });
            const existingHashes = new Set();
            for (const row of existing){
                const meta = row.metadata;
                if (meta && typeof meta === "object" && !Array.isArray(meta)) {
                    const hash = meta.contentHash;
                    if (typeof hash === "string" && hash) {
                        existingHashes.add(hash);
                    }
                }
            }
            const finalChunks = dedupedChunks.filter((chunk)=>!existingHashes.has(chunk.hash));
            if (!finalChunks.length) {
                console.log("[Ingestion] Todos los chunks ya existian para sourceId. Se omite ingesta.");
                return 0;
            }
            console.log(`[Ingestion] Generando embeddings batch para ${finalChunks.length} chunks...`);
            const embeddings = await this.embeddings.embedDocuments(finalChunks.map((chunk)=>chunk.content));
            if (embeddings.length !== finalChunks.length) {
                throw new Error("EMBEDDING_BATCH_SIZE_MISMATCH");
            }
            // 2. Procesar cada fragmento
            let processedItems = 0;
            for (const [index, chunk] of finalChunks.entries()){
                console.log(`[Ingestion] Generando embedding para chunk ${processedItems + 1}/${finalChunks.length}...`);
                const embedding = embeddings[index];
                const vectorString = `[${embedding.join(",")}]`;
                // 3. Guardar en la DB con el vector
                console.log(`[Ingestion] Guardando chunk ${processedItems + 1} en base de datos...`);
                // @ts-ignore - Prisma types might be out of sync
                const knowledgeItem = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.create({
                    data: {
                        businessId,
                        content: chunk.content,
                        metadata: {
                            ...metadata,
                            source: metadata.source || "manual_ingestion",
                            sourceId,
                            chunkIndex: processedItems,
                            contentHash: chunk.hash,
                            tokenCount: estimateTokenCount(chunk.content),
                            title: typeof metadata.title === "string" && metadata.title.trim() ? metadata.title : typeof metadata.fileName === "string" ? metadata.fileName : "document",
                            fileType: metadata.fileType || metadata.type || "txt",
                            lang: typeof metadata.lang === "string" ? metadata.lang : detectLang(chunk.content),
                            ingestedAt: new Date().toISOString()
                        }
                    }
                });
                console.log(`[Ingestion] Actualizando embedding para item ID: ${knowledgeItem.id}`);
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE "KnowledgeItem" SET embedding = $1::vector WHERE id = $2`, vectorString, knowledgeItem.id);
                } catch (vectorError) {
                    console.warn(`[Ingestion] Warning: No se pudo guardar el vector para item ${knowledgeItem.id}. ¿pgvector instalado?`, vectorError.message);
                    // Intentamos fallback a JSON si la columna es JSON (por compatibilidad temporal)
                    try {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE "KnowledgeItem" SET embedding = $1::jsonb WHERE id = $2`, vectorString, knowledgeItem.id);
                    } catch (jsonError) {
                    // Ignoramos si también falla
                    }
                }
                processedItems++;
            }
            console.log(`[Ingestion] Ingesta completada con éxito: ${processedItems} items.`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateAiCachesForBusiness"])(businessId);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$retriever$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateRagRetrieverCacheForBusiness"])(businessId);
            return processedItems;
        } catch (error) {
            console.error("[Ingestion] Error durante la ingesta:", error);
            throw error;
        }
    }
    async deleteAllKnowledge(businessId) {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.deleteMany({
            where: {
                businessId
            }
        });
    }
    async deleteKnowledgeItem(itemId, businessId) {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.deleteMany({
            where: {
                id: itemId,
                businessId
            }
        });
    }
    async deleteKnowledgeItems(itemIds, businessId) {
        if (itemIds.length === 0) {
            return {
                count: 0
            };
        }
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.deleteMany({
            where: {
                businessId,
                id: {
                    in: itemIds
                }
            }
        });
    }
    async ingestStructuredKnowledge(businessId, item, metadata = {}) {
        console.log(`[Ingestion] Ingesting Structured Knowledge Chunk for business ${businessId} (Content size: ${item.content.length}, tags: ${item.tags.join(',')})`);
        try {
            // Generar embedding (que es obligatorio para vector store)
            const embedding = await this.embeddings.embedQuery(item.content);
            const vectorString = `[${embedding.join(",")}]`;
            // Guardar en DB con metadatos enriquecidos por el Agente
            const knowledgeItem = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeItem.create({
                data: {
                    businessId,
                    content: item.content,
                    metadata: {
                        ...metadata,
                        tags: item.tags,
                        relevance: item.relevance,
                        isAgentGenerated: true,
                        source: metadata.source || "agent_ingestion"
                    }
                }
            });
            // Actualizar vector
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE "KnowledgeItem" SET embedding = $1::vector WHERE id = $2`, vectorString, knowledgeItem.id);
            return knowledgeItem;
        } catch (error) {
            console.error("[Ingestion] Error ingesting structured chunk:", error);
            throw error;
        }
    }
}
const ingestionService = new IngestionService();
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/services/ai/knowledgeAgent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KnowledgeAgent",
    ()=>KnowledgeAgent,
    "knowledgeAgent",
    ()=>knowledgeAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$helpers$2f$zod$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/openai/helpers/zod.mjs [app-route] (ecmascript)");
;
;
;
;
// Esquema para la respuesta estructurada del agente
const KnowledgeExtractionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("El fragmento de conocimiento, hecho, regla o información extraída."),
        tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).describe("Etiquetas clave para búsqueda (ej. 'precio', 'horario', 'menú')."),
        relevance: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe("Nivel de importancia del 1 al 10")
    })).describe("Lista de fragmentos de conocimiento extraídos del documento")
});
class KnowledgeAgent {
    openai = null;
    gemini = null;
    constructor(){
        // Inicializamos clientes según disponibilidad, priorizando GitHub/OpenAI
        if (process.env.GITHUB_TOKEN) {
            this.openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
                baseURL: "https://models.inference.ai.azure.com",
                apiKey: process.env.GITHUB_TOKEN
            });
        } else if (process.env.OPENAI_API_KEY) {
            this.openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
        if (process.env.GEMINI_API_KEY) {
            this.gemini = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
        }
    }
    async processDocument(text, sourceName) {
        console.log(`[KnowledgeAgent] Procesando documento "${sourceName}" de forma agéntica...`);
        const systemPrompt = `
            Eres un Experto en Gestión del Conocimiento (Knowledge Manager) para Agentes de IA.
            Tu tarea es leer documentos de negocios (PDFs, TXTs, Menús, Reglas) y "atomizar" el conocimiento.
            
            En lugar de cortar el texto ciegamente, debes:
            1. Entender el significado semántico.
            2. Extraer reglas claras, listas de precios, horarios y descripciones como items independientes.
            3. Si hay un menú, crea un item por categoría o grupo de platos, no cortes un plato a la mitad.
            4. Ignora pies de página, numeración irrelevante o texto legal genérico sin valor operativo.
            
            Documento Fuente: "${sourceName}"
        `;
        // Versión OpenAI / GitHub
        if (this.openai) {
            try {
                const model = process.env.GITHUB_TOKEN ? "gpt-4o" : "gpt-4o-mini";
                console.log(`[KnowledgeAgent] Usando modelo ${model} (OpenAI/GitHub)`);
                const completion = await this.openai.chat.completions.create({
                    model: model,
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: `Analiza y extrae el conocimiento de este texto:\n\n${text.substring(0, 30000)}`
                        } // Límite de seguridad
                    ],
                    response_format: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$helpers$2f$zod$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["zodResponseFormat"])(KnowledgeExtractionSchema, "knowledge_extraction"),
                    temperature: 0.3
                });
                const content = completion.choices[0].message.content;
                if (!content) throw new Error("Respuesta vacía del modelo");
                return JSON.parse(content);
            } catch (error) {
                console.error("[KnowledgeAgent] Error con OpenAI/GitHub:", error);
            // Fallback a lógica simple si falla el agente
            }
        }
        // Fallback Gemini (Más manual porque structured output es diferente en cada versión SDK)
        if (this.gemini) {
            try {
                console.log(`[KnowledgeAgent] Usando modelo Gemini 1.5 Flash`);
                const model = this.gemini.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                });
                const prompt = `${systemPrompt}\n\nExtrae los items en formato JSON compatible con este esquema: { items: [{ content: string, tags: string[], relevance: number }] }\n\nTexto:\n${text.substring(0, 30000)}`;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                return JSON.parse(responseText);
            } catch (error) {
                console.error("[KnowledgeAgent] Error con Gemini:", error);
            }
        }
        // Si todo falla, devolvemos un chunk gigante (fallback legacy)
        return {
            items: [
                {
                    content: text,
                    tags: [
                        "raw",
                        "fallback"
                    ],
                    relevance: 5
                }
            ]
        };
    }
}
const knowledgeAgent = new KnowledgeAgent();
}),
"[project]/app/api/onboarding/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$ai$2f$onboardingAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/ai/onboardingAgent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validation/schemas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validation/validate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rag/ingestion.ts [app-route] (ecmascript)");
// import pdf from "pdf-parse"; // Removed in favor of require inside the function to avoid strict ESM issues with this old lib
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$ai$2f$knowledgeAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/ai/knowledgeAgent.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || "");
async function describeImage(buffer, mimeType) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });
        const result = await model.generateContent([
            "Describe detalladamente el contenido de esta imagen. Si es un menú, lista los platos y precios. Si es un horario, lista las horas. Si es un producto, descríbelo.",
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: mimeType
                }
            }
        ]);
        return result.response.text();
    } catch (error) {
        console.error("Error describiendo imagen con Gemini:", error);
        return "";
    }
}
async function POST(req) {
    try {
        console.log("[Onboarding] Recibiendo solicitud de onboarding...");
        // 1. Verificamos sesión
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No autorizado. Inicia sesión primero."
            }, {
                status: 401
            });
        }
        let ownerDescription = "";
        let filesContent = [];
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            ownerDescription = formData.get("ownerDescription") || "";
            const files = formData.getAll("files");
            if (files && files.length > 0) {
                // Asegurar directorio de subida
                const uploadDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "public", "uploads");
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(uploadDir, {
                    recursive: true
                });
                for (const file of files){
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        // Guardar archivo físicamente para poder enviarlo después
                        const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
                        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(uploadDir, uniqueName);
                        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"])(filePath, buffer);
                        const publicUrl = `/uploads/${uniqueName}`; // URL accesible por el navegador/bot
                        let fileText = "";
                        // Detectar PDF por tipo o extensión
                        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                            try {
                                const pdf = __turbopack_context__.r("[externals]/pdf-parse [external] (pdf-parse, cjs, [project]/node_modules/pdf-parse)"); // Usar require para evitar problemas de ESM
                                const data = await pdf(buffer);
                                fileText = data.text;
                                console.log(`[Onboarding] PDF procesado: ${file.name} (${fileText.length} chars)`);
                            } catch (pdfErr) {
                                console.error(`[Onboarding] Error parseando PDF ${file.name}:`, pdfErr);
                            }
                        } else if (file.type.startsWith("image/")) {
                            // Procesar imagen con Gemini Vision
                            console.log(`[Onboarding] Procesando imagen ${file.name} con IA...`);
                            const description = await describeImage(buffer, file.type);
                            if (description) {
                                fileText = `[IMAGEN: ${file.name}]\nDescripción visual: ${description}`;
                                console.log(`[Onboarding] Imagen descrita: ${description.substring(0, 50)}...`);
                            }
                        } else if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv")) {
                            fileText = buffer.toString("utf-8");
                        }
                        if (fileText && fileText.trim().length > 0) {
                            // Sanitizamos el texto
                            fileText = fileText.replace(/\0/g, '');
                            // Guardamos metadata extendida
                            filesContent.push({
                                name: file.name,
                                content: fileText,
                                // @ts-ignore
                                metadata: {
                                    fileUrl: publicUrl,
                                    fileType: file.type,
                                    fileName: file.name
                                }
                            });
                            ownerDescription += `\n\n--- CONTENIDO DEL ARCHIVO ${file.name} (URL: ${publicUrl}) ---\n${fileText}\n--- FIN ARCHIVO ---\n`;
                        } else {
                            console.warn(`[Onboarding] Archivo ${file.name} vacío o no procesado correctamente.`);
                        }
                    } catch (err) {
                        console.error("Error reading file:", err);
                    }
                }
            }
        } else {
            // 2. Recibimos y validamos texto (JSON legacy)
            const body = await req.json();
            if (body.ownerDescription) {
                ownerDescription = body.ownerDescription;
            }
        }
        const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateData"])({
            ownerDescription
        }, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["onboardingSchema"]);
        if (!validation.success) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validationErrorResponse"])(validation.errors);
        }
        // 3. Pasamos texto a la IA
        const aiConfig = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$ai$2f$onboardingAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateBusinessConfig"])(ownerDescription);
        // 4. Buscamos al usuario o lo creamos si no existe
        let user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: session.user.email
            }
        });
        if (!user) {
            user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || "Dueño del Negocio"
                }
            });
        }
        // 5. Guardamos el nuevo negocio en PostgreSQL
        const negocio = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.create({
            data: {
                name: aiConfig.businessName || "Negocio Nuevo",
                config: aiConfig,
                userId: user.id
            }
        });
        // 6. Si hubo archivos, procesamos con AGENTE de Conocimiento
        if (filesContent.length > 0) {
            console.log(`[Onboarding] Invocando Agente de Conocimiento para ${filesContent.length} archivos...`);
            // Procesamiento en segundo plano (pero esperamos para demo)
            await Promise.allSettled(filesContent.map(async (file)=>{
                try {
                    // 6.1. El Agente "Lee" y estructura la info
                    const structuredKnowledge = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$ai$2f$knowledgeAgent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["knowledgeAgent"].processDocument(file.content, file.name);
                    console.log(`[Onboarding] Agente extrajo ${structuredKnowledge.items.length} items de ${file.name}`);
                    // 6.2. Ingestar items estructurados
                    for (const item of structuredKnowledge.items){
                        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].ingestStructuredKnowledge(negocio.id, item, {
                            source: file.name,
                            type: "agentic_extraction",
                            fileUrl: file.metadata?.fileUrl,
                            fileType: file.metadata?.fileType
                        });
                    }
                } catch (err) {
                    console.error(`[Onboarding] Error agéntico en ${file.name}, fallback a simple:`, err);
                    // Fallback: ingesta simple si falla el agente
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rag$2f$ingestion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestionService"].ingestText(negocio.id, file.content, {
                        source: file.name,
                        type: "fallback_simple",
                        fileUrl: file.metadata?.fileUrl
                    });
                }
            }));
        }
        // 7. Respondemos éxito
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["successResponse"])({
            business: negocio
        }, 201);
    } catch (error) {
        console.error("Error en la API de onboarding:", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverErrorResponse"])("Error al crear el negocio");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1dbfb74e._.js.map