(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/dashboard/tools/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ToolsStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/blocks.js [app-client] (ecmascript) <export default as Blocks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AgentyContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/ActionConfirmationPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$dashboardCopy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/dashboardCopy.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function ToolsStore() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const copy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$dashboardCopy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardCopy"])(searchParams.get("lang") || undefined);
    const { activeAgent, saveAgent, updateActiveAgentConfig } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAgenty"])();
    const [tools, setTools] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            slug: "google-calendar",
            name: "Google Calendar",
            description: "Permite a tu agente revisar disponibilidad y agendar citas automáticamente.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                className: "w-6 h-6 text-blue-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 30,
                columnNumber: 19
            }, this),
            status: "connected",
            category: "Productividad"
        },
        {
            id: 2,
            slug: "payments",
            name: "MercadoPago / Wompi",
            description: "Genera links de pago y verifica si el cliente ya pagó la orden.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                className: "w-6 h-6 text-emerald-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 39,
                columnNumber: 19
            }, this),
            status: "disconnected",
            category: "Ventas"
        },
        {
            id: 3,
            slug: "shopify",
            name: "Shopify Inventory",
            description: "Conecta tu catálogo para que el agente vea el stock en tiempo real.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                className: "w-6 h-6 text-purple-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 48,
                columnNumber: 19
            }, this),
            status: "disconnected",
            category: "E-Commerce"
        },
        {
            id: 4,
            slug: "email",
            name: "Gmail / Outlook",
            description: "Envía correos electrónicos con cotizaciones a petición del cliente.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                className: "w-6 h-6 text-rose-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 57,
                columnNumber: 19
            }, this),
            status: "disconnected",
            category: "Productividad"
        }
    ]);
    const [savingToolId, setSavingToolId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statusMessage, setStatusMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingDeactivateToolId, setPendingDeactivateToolId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Leer tools recomendadas desde el contexto
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToolsStore.useEffect": ()=>{
            if (!activeAgent) return;
            const config = activeAgent.config || activeAgent;
            if (config.recommendedTools && Array.isArray(config.recommendedTools)) {
                setTools({
                    "ToolsStore.useEffect": (prevTools)=>prevTools.map({
                            "ToolsStore.useEffect": (tool)=>({
                                    ...tool,
                                    status: config.recommendedTools.includes(tool.id) ? "connected" : "disconnected"
                                })
                        }["ToolsStore.useEffect"])
                }["ToolsStore.useEffect"]);
            }
        }
    }["ToolsStore.useEffect"], [
        activeAgent
    ]);
    const handleToggleTool = async (toolId)=>{
        if (!activeAgent || savingToolId !== null) return;
        setStatusMessage(null);
        setSavingToolId(toolId);
        const previousTools = tools;
        const nextTools = previousTools.map((tool)=>{
            if (tool.id !== toolId) return tool;
            return {
                ...tool,
                status: tool.status === "connected" ? "disconnected" : "connected"
            };
        });
        // Optimistic update para respuesta inmediata en UI
        setTools(nextTools);
        const recommendedTools = nextTools.filter((tool)=>tool.status === "connected").map((tool)=>tool.id);
        const currentConfig = activeAgent.config || {};
        const mergedConfig = {
            ...currentConfig,
            recommendedTools
        };
        const saved = await saveAgent(activeAgent.id, activeAgent.name, mergedConfig);
        if (!saved) {
            // Rollback si falla persistencia
            setTools(previousTools);
            setStatusMessage({
                type: "error",
                text: copy.tools.updateError
            });
            setSavingToolId(null);
            return;
        }
        updateActiveAgentConfig({
            config: mergedConfig
        });
        setStatusMessage({
            type: "success",
            text: copy.tools.updateSuccess
        });
        setSavingToolId(null);
    };
    const handlePrimaryAction = (tool)=>{
        if (tool.status === "connected") {
            const configTargetBySlug = {
                "google-calendar": "/dashboard/settings?tab=integrations&tool=google-calendar",
                "payments": "/dashboard/settings?tab=integrations&tool=payments",
                "shopify": "/dashboard/knowledge",
                "email": "/dashboard/settings?tab=integrations&tool=email"
            };
            const target = configTargetBySlug[tool.slug];
            setStatusMessage({
                type: "success",
                text: copy.tools.openingConfig(tool.name)
            });
            router.push(target);
            return;
        }
        handleToggleTool(tool.id);
    };
    const openDeactivateConfirm = (toolId)=>{
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(toolId);
    };
    const closeDeactivateConfirm = ()=>{
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(null);
    };
    const confirmDeactivateTool = async ()=>{
        if (pendingDeactivateToolId === null) return;
        await handleToggleTool(pendingDeactivateToolId);
        setPendingDeactivateToolId(null);
    };
    const pendingDeactivateTool = tools.find((tool)=>tool.id === pendingDeactivateToolId) || null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-6xl mx-auto space-y-8 relative z-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold tracking-tight mb-2 flex items-center gap-3",
                        children: [
                            "Tools Store ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__["Blocks"], {
                                className: "w-6 h-6 text-purple-400"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 168,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/tools/page.tsx",
                        lineNumber: 167,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/60",
                        children: 'Instala "habilidades" (Function Calling) en tu agente con un solo clic.'
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/tools/page.tsx",
                        lineNumber: 170,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 166,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
                children: tools.map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start mb-4 relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3 rounded-xl bg-white/5 border border-white/10",
                                        children: tool.icon
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 178,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md",
                                        children: tool.category
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 181,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 177,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold mb-2 relative z-10",
                                children: tool.name
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 186,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-white/50 mb-6 min-h-10 relative z-10",
                                children: tool.description
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 187,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-4 border-t border-white/10 flex justify-between items-center relative z-10",
                                children: [
                                    tool.status === "connected" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm text-emerald-400 font-medium",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                lineNumber: 194,
                                                columnNumber: 37
                                            }, this),
                                            "Activado"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 193,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm text-white/40 font-medium",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 rounded-full bg-white/20"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                lineNumber: 199,
                                                columnNumber: 37
                                            }, this),
                                            "Desactivado"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tool.status === 'connected' ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-white text-black hover:bg-white/90'} ${savingToolId === tool.id ? 'opacity-70 cursor-wait' : ''}`,
                                        onClick: ()=>handlePrimaryAction(tool),
                                        disabled: savingToolId !== null,
                                        children: savingToolId === tool.id ? tool.status === "connected" ? "Guardando..." : "Conectando..." : tool.status === "connected" ? "Configurar" : "Conectar"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 204,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 191,
                                columnNumber: 25
                            }, this),
                            tool.status === "connected" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>openDeactivateConfirm(tool.id),
                                disabled: savingToolId !== null,
                                className: "mt-3 text-xs text-white/40 hover:text-red-400 transition-colors disabled:opacity-50",
                                children: "Desactivar"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 218,
                                columnNumber: 29
                            }, this),
                            tool.status === "connected" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 229,
                                columnNumber: 29
                            }, this)
                        ]
                    }, tool.id, true, {
                        fileName: "[project]/app/dashboard/tools/page.tsx",
                        lineNumber: 175,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 173,
                columnNumber: 13
            }, this),
            pendingDeactivateTool && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: copy.tools.deactivateConfirm(pendingDeactivateTool.name),
                details: copy.tools.deactivateDetails,
                confirmLabel: copy.confirmation.labels.deactivate,
                cancelLabel: copy.confirmation.cancel,
                isLoading: savingToolId === pendingDeactivateTool.id,
                onCancel: closeDeactivateConfirm,
                onConfirm: ()=>{
                    void confirmDeactivateTool();
                }
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 236,
                columnNumber: 17
            }, this),
            statusMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-sm ${statusMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`,
                children: statusMessage.text
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 250,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/tools/page.tsx",
        lineNumber: 163,
        columnNumber: 9
    }, this);
}
_s(ToolsStore, "h62UHy7csVMowqgyPeEzzBImVkQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAgenty"]
    ];
});
_c = ToolsStore;
var _c;
__turbopack_context__.k.register(_c, "ToolsStore");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Calendar
]);
/**
 * @license lucide-react v0.576.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M8 2v4",
            key: "1cmpym"
        }
    ],
    [
        "path",
        {
            d: "M16 2v4",
            key: "4m81vk"
        }
    ],
    [
        "rect",
        {
            width: "18",
            height: "18",
            x: "3",
            y: "4",
            rx: "2",
            key: "1hopcy"
        }
    ],
    [
        "path",
        {
            d: "M3 10h18",
            key: "8toen8"
        }
    ]
];
const Calendar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("calendar", __iconNode);
;
 //# sourceMappingURL=calendar.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Calendar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ShoppingBag
]);
/**
 * @license lucide-react v0.576.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 10a4 4 0 0 1-8 0",
            key: "1ltviw"
        }
    ],
    [
        "path",
        {
            d: "M3.103 6.034h17.794",
            key: "awc11p"
        }
    ],
    [
        "path",
        {
            d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
            key: "o988cm"
        }
    ]
];
const ShoppingBag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("shopping-bag", __iconNode);
;
 //# sourceMappingURL=shopping-bag.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShoppingBag",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_dadd96ca._.js.map