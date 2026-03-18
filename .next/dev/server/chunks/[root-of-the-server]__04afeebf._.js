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
"[project]/app/api/business/connections/telegram/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "POST",
    ()=>POST
]);
// app/api/business/connections/telegram/route.ts
// POST  - Guardar token del bot de Telegram y registrar webhook
// DELETE - Desconectar Telegram
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
;
function normalizeBaseUrl(raw) {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(withProtocol);
        // Telegram requiere HTTPS para webhooks.
        if (url.protocol !== "https:") return null;
        return url.origin;
    } catch  {
        return null;
    }
}
async function resolveWebhookBaseUrl(req) {
    const envCandidates = [
        {
            value: process.env.PUBLIC_BASE_URL,
            source: "PUBLIC_BASE_URL"
        },
        {
            value: process.env.WEBHOOK_BASE_URL,
            source: "WEBHOOK_BASE_URL"
        },
        {
            value: process.env.NEXTAUTH_URL,
            source: "NEXTAUTH_URL"
        },
        {
            value: process.env.VERCEL_URL,
            source: "VERCEL_URL"
        }
    ];
    for (const candidate of envCandidates){
        const normalized = normalizeBaseUrl(candidate.value);
        if (normalized) {
            return {
                baseUrl: normalized,
                source: candidate.source
            };
        }
    }
    const requestOrigin = normalizeBaseUrl(req.nextUrl.origin);
    if (requestOrigin && !requestOrigin.includes("localhost") && !requestOrigin.includes("127.0.0.1")) {
        return {
            baseUrl: requestOrigin,
            source: "request_origin"
        };
    }
    const ngrokApiBases = [
        process.env.NGROK_API_URL,
        "http://127.0.0.1:4040",
        "http://localhost:4040",
        "http://host.docker.internal:4040"
    ].filter(Boolean);
    for (const ngrokApiBase of ngrokApiBases){
        try {
            const apiUrl = ngrokApiBase.endsWith("/api/tunnels") ? ngrokApiBase : `${ngrokApiBase.replace(/\/$/, "")}/api/tunnels`;
            const res = await fetch(apiUrl, {
                cache: "no-store"
            });
            if (!res.ok) continue;
            const data = await res.json();
            const tunnels = Array.isArray(data?.tunnels) ? data.tunnels : [];
            const httpsTunnel = tunnels.find((t)=>{
                const publicUrl = typeof t?.public_url === "string" ? t.public_url : "";
                return publicUrl.startsWith("https://");
            });
            if (httpsTunnel?.public_url) {
                const normalized = normalizeBaseUrl(httpsTunnel.public_url);
                if (normalized) {
                    return {
                        baseUrl: normalized,
                        source: `ngrok:${ngrokApiBase}`
                    };
                }
            }
        } catch  {
        // Intentamos el siguiente endpoint de ngrok.
        }
    }
    return {
        baseUrl: null,
        source: "not_found"
    };
}
async function POST(req) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user?.email) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No autorizado"
        }, {
            status: 401
        });
    }
    const body = await req.json();
    const { businessId, botToken, botUsername } = body;
    if (!businessId || !botToken) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "businessId y botToken son requeridos"
        }, {
            status: 400
        });
    }
    try {
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                id: businessId,
                user: {
                    email: session.user.email
                }
            }
        });
        if (!business) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Negocio no encontrado"
            }, {
                status: 404
            });
        }
        // Validate token with Telegram API
        const testRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const testData = await testRes.json();
        if (!testData.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Token de Telegram inválido. Verifica que sea correcto."
            }, {
                status: 400
            });
        }
        const resolvedUsername = testData.result?.username || botUsername;
        const resolved = await resolveWebhookBaseUrl(req);
        if (!resolved.baseUrl) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No se encontró un túnel HTTPS activo de ngrok ni una URL pública configurada.",
                details: "Inicia ngrok y vuelve a intentar. Opcional: define PUBLIC_BASE_URL en .env."
            }, {
                status: 400
            });
        }
        const webhookUrl = `${resolved.baseUrl}/api/telegram/webhook?businessId=${businessId}`;
        const webhookRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: webhookUrl,
                allowed_updates: [
                    "message",
                    "callback_query"
                ]
            })
        });
        const webhookData = await webhookRes.json().catch(()=>({}));
        if (!webhookData.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No se pudo registrar el webhook en Telegram.",
                details: webhookData?.description || "Error desconocido al registrar webhook",
                webhookUrl
            }, {
                status: 400
            });
        }
        // Save to database only after webhook registration succeeds.
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.update({
            where: {
                id: businessId
            },
            data: {
                telegramBotToken: botToken,
                telegramBotUsername: resolvedUsername
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Bot @${resolvedUsername} conectado exitosamente`,
            botUsername: resolvedUsername,
            webhookUrl,
            webhookSource: resolved.source
        });
    } catch (error) {
        console.error("[POST /connections/telegram]", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error interno al guardar"
        }, {
            status: 500
        });
    }
}
async function DELETE(req) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user?.email) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No autorizado"
        }, {
            status: 401
        });
    }
    const { businessId } = await req.json();
    if (!businessId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "businessId requerido"
        }, {
            status: 400
        });
    }
    try {
        const business = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findFirst({
            where: {
                id: businessId,
                user: {
                    email: session.user.email
                }
            },
            select: {
                telegramBotToken: true
            }
        });
        if (!business) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Negocio no encontrado"
            }, {
                status: 404
            });
        }
        // Delete webhook from Telegram before removing token
        if (business.telegramBotToken) {
            await fetch(`https://api.telegram.org/bot${business.telegramBotToken}/deleteWebhook`).catch(()=>{});
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.update({
            where: {
                id: businessId
            },
            data: {
                telegramBotToken: null,
                telegramBotUsername: null
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error("[DELETE /connections/telegram]", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error interno"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__04afeebf._.js.map