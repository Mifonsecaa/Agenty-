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
"[project]/services/whatsapp/evolution.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evolutionService",
    ()=>evolutionService
]);
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const evolutionService = {
    async createInstance (instanceName) {
        try {
            console.log(`[EvolutionService] Creating instance at: ${EVOLUTION_API_URL}/instance/create`);
            const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    instanceName,
                    token: instanceName,
                    integration: 'WHATSAPP-BAILEYS',
                    qrcode: true
                })
            });
            const data = await response.json();
            console.log("[EvolutionService] Create Instance full response:", JSON.stringify(data, null, 2));
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error creating instance:", error);
            throw error;
        }
    },
    async getQR (instanceName) {
        try {
            console.log(`[EvolutionService] Getting QR at: ${EVOLUTION_API_URL}/instance/connect/${instanceName}`);
            const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            });
            const data = await response.json();
            console.log("[EvolutionService] Get QR response:", data);
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error getting QR:", error);
            throw error;
        }
    },
    async getInstanceStatus (instanceName) {
        try {
            console.log(`[EvolutionService] Getting status at: ${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`);
            const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            });
            const data = await response.json();
            console.log("[EvolutionService] Get Status response:", data);
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error getting status:", error);
            return {
                instance: {
                    state: "DISCONNECTED"
                }
            };
        }
    },
    async deleteInstance (instanceName) {
        try {
            console.log(`[EvolutionService] Deleting instance at: ${EVOLUTION_API_URL}/instance/delete/${instanceName}`);
            await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
                method: 'DELETE',
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            });
        } catch (error) {
            console.error("[EvolutionService] Error deleting instance:", error);
        }
    },
    async sendMessage (instanceName, number, text) {
        try {
            console.log(`[EvolutionService] Sending message to ${number} via ${instanceName}`);
            const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    number,
                    text: text,
                    linkPreview: false
                })
            });
            return await response.json();
        } catch (error) {
            console.error("[EvolutionService] Error sending message:", error);
            throw error;
        }
    },
    async fetchContact (instanceName, jid) {
        try {
            console.log(`[EvolutionService] Fetching contact ${jid} via ${instanceName}`);
            const response = await fetch(`${EVOLUTION_API_URL}/contact/fetchContact/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    where: {
                        jid
                    }
                })
            });
            return await response.json();
        } catch (error) {
            console.error("[EvolutionService] Error fetching contact:", error);
            return null;
        }
    },
    async setWebhook (instanceName, url) {
        try {
            console.log(`[EvolutionService] Setting webhook for ${instanceName} to ${url}`);
            const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    webhook: {
                        enabled: true,
                        url: url,
                        webhookByEvents: false,
                        events: [
                            "MESSAGES_UPSERT",
                            "MESSAGES_UPDATE",
                            "MESSAGES_DELETE",
                            "SEND_MESSAGE"
                        ]
                    }
                })
            });
            const data = await response.json();
            console.log("[EvolutionService] Set Webhook response:", JSON.stringify(data, null, 2));
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error setting webhook:", error);
            throw error;
        }
    },
    async sendMedia (instanceName, number, mediaUrl, mediaType = "image", caption = "") {
        try {
            console.log(`[EvolutionService] Sending media to ${number} via ${instanceName}`);
            // Determinar mimetype y tipo basado en extensión si es posible
            let mimetype = "image/jpeg";
            if (mediaUrl.endsWith(".pdf")) {
                mimetype = "application/pdf";
                mediaType = "document";
            } else if (mediaUrl.endsWith(".png")) {
                mimetype = "image/png";
            }
            const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    number,
                    mediatype: mediaType,
                    mimetype: mimetype,
                    media: mediaUrl,
                    fileName: mediaUrl.split("/").pop() || "archivo",
                    caption: caption
                })
            });
            const data = await response.json();
            console.log("[EvolutionService] Send Media response:", data);
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error sending media:", error);
            throw error;
        }
    },
    async fetchMediaBase64 (instanceName, messageObject) {
        try {
            console.log(`[EvolutionService] Fetching media base64 for message in ${instanceName}`);
            // Evolution API endpoint typical structure
            const response = await fetch(`${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY
                },
                body: JSON.stringify({
                    message: messageObject,
                    convertToMp4: false
                })
            });
            const data = await response.json();
            // Expected response: { base64: "..." }
            if (data && data.base64) {
                return data.base64;
            }
            console.warn("[EvolutionService] No base64 found in response:", data);
            return null;
        } catch (error) {
            console.error("[EvolutionService] Error fetching media base64:", error);
            return null;
        }
    }
};
}),
"[project]/app/api/whatsapp/connect/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$whatsapp$2f$evolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/whatsapp/evolution.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(req) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No autorizado"
            }, {
                status: 401
            });
        }
        const { agentId } = await req.json();
        if (!agentId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "agentId es requerido"
            }, {
                status: 400
            });
        }
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].business.findUnique({
            where: {
                id: agentId
            }
        });
        if (!agent) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Agente no encontrado"
            }, {
                status: 404
            });
        }
        // El nombre de la instancia en Evolution API será el agentId
        const instanceName = agentId;
        // 1. Intentamos ver si la instancia ya existe
        const status = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$whatsapp$2f$evolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evolutionService"].getInstanceStatus(instanceName);
        console.log(`[API WhatsApp Connect] Current status for ${instanceName}:`, status.instance?.state);
        // 2. Si NO existe la instancia, la creamos
        if (!status.instance || status.status === 404 || status.error === "Not Found") {
            console.log(`[API WhatsApp Connect] Instance ${instanceName} not found. Creating...`);
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$whatsapp$2f$evolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evolutionService"].createInstance(instanceName);
        }
        // Siempre intentamos configurar el Webhook al conectar para asegurar que esté activo
        // En local usamos la IP de Docker gateway para llegar al host
        const webhookUrl = "http://172.17.0.1:3000/api/whatsapp/webhook";
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$whatsapp$2f$evolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evolutionService"].setWebhook(instanceName, webhookUrl);
        } catch (webhookErr) {
            console.error(`[API WhatsApp Connect] Error setting webhook for ${instanceName}:`, webhookErr);
        }
        // 3. Si ya está conectada, retornamos éxito inmediatamente después de asegurar el Webhook
        if (status.instance?.state === "open") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                state: "CONNECTED"
            });
        }
        // 3. Bucle de sondeo interno (máximo 30 segundos - 10 intentos x 3s)
        // Esto le da a Evolution API el tiempo necesario para inicializar Baileys
        let attempts = 0;
        let base64 = null;
        while(attempts < 10 && !base64){
            console.log(`[API WhatsApp Connect] Polling for QR... attempt ${attempts + 1}/10 for ${instanceName}`);
            // Esperamos 3 segundos entre intentos
            await new Promise((resolve)=>setTimeout(resolve, 3000));
            const qrData = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$whatsapp$2f$evolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evolutionService"].getQR(instanceName);
            console.log(`[API WhatsApp Connect] QR Response attempt ${attempts + 1}:`, JSON.stringify(qrData));
            // En Evolution v2 el QR puede venir en varias rutas:
            // - qrData.base64 (v1/v2 early)
            // - qrData.qrcode.base64 (v2)
            // - qrData.code.base64 (v2 experimental)
            base64 = qrData.base64 || qrData.qrcode?.base64 || qrData.code?.base64;
            if (base64) break;
            attempts++;
        }
        if (base64) {
            console.log(`[API WhatsApp Connect] QR found!`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                state: "READY",
                qrcode: base64
            });
        }
        // Si después de 30s no hay QR, pedimos al frontend que reintente silenciosamente
        console.log(`[API WhatsApp Connect] QR not found after 30s. Returning INITIALIZING.`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            state: "INITIALIZING",
            message: "El QR está tardando en generarse. Reintentando..."
        });
    } catch (error) {
        console.error("[API WhatsApp Connect] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error interno del servidor"
        }, {
            status: 500
        });
    }
}
async function GET(req) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No autorizado"
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get("agentId");
        if (!agentId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "agentId es requerido"
            }, {
                status: 400
            });
        }
        const status = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$whatsapp$2f$evolution$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evolutionService"].getInstanceStatus(agentId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            state: status.instance?.state === "open" ? "CONNECTED" : "DISCONNECTED"
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error al consultar estado"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7e7ae4aa._.js.map