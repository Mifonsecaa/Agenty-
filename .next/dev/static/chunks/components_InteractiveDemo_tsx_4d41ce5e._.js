(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/InteractiveDemo.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InteractiveDemo",
    ()=>InteractiveDemo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const TASKS = [
    {
        id: 'start',
        text: 'Inicio de la conversación'
    },
    {
        id: 'context',
        text: 'Análisis del contexto del negocio'
    },
    {
        id: 'understanding',
        text: 'Comprensión de la petición del usuario'
    },
    {
        id: 'generation',
        text: 'Generación de respuesta de IA'
    },
    {
        id: 'response',
        text: 'Respuesta enviada'
    }
];
const InteractiveDemo = ({ onClose })=>{
    _s();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            role: 'assistant',
            content: '¡Hola! Soy AgentyBot 🤖, el experto en ventas de Agenty.ai. ¿Te gustaría saber cómo podemos automatizar la atención y reservas de tu negocio en WhatsApp? (O si prefieres, escribe el contexto de tu negocio a la derecha para probarme en vivo).'
        }
    ]);
    const [userInput, setUserInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [demoContext, setDemoContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [provider, setProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('openai');
    const [taskState, setTaskState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        start: 'completed',
        context: 'pending',
        understanding: 'pending',
        generation: 'pending',
        response: 'pending'
    });
    const chatEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveDemo.useEffect": ()=>{
            chatEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["InteractiveDemo.useEffect"], [
        messages
    ]);
    const handleSendMessage = async (e)=>{
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        const userMessage = {
            role: 'user',
            content: userInput
        };
        const newMessages = [
            ...messages,
            userMessage
        ];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setTaskState((prev)=>({
                ...prev,
                context: 'in_progress',
                understanding: 'in_progress'
            }));
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: newMessages,
                    provider,
                    isDemo: true,
                    demoContext
                })
            });
            setTaskState((prev)=>({
                    ...prev,
                    context: 'completed',
                    understanding: 'completed',
                    generation: 'in_progress'
                }));
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'La respuesta de la API no fue exitosa');
            setMessages((prev)=>[
                    ...prev,
                    data
                ]);
            setTaskState((prev)=>({
                    ...prev,
                    generation: 'completed',
                    response: 'completed'
                }));
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: `Error: ${error.message}`
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMessage
                ]);
            setTaskState((prev)=>({
                    ...prev,
                    context: 'completed',
                    understanding: 'completed',
                    generation: 'completed',
                    response: 'pending'
                }));
        } finally{
            setIsLoading(false);
            setTimeout(()=>setTaskState((prev)=>({
                        ...prev,
                        understanding: 'pending',
                        generation: 'pending',
                        response: 'pending'
                    })), 2000);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#0a0a0a] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl shadow-blue-500/10 flex flex-col relative overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute top-4 right-4 text-white/40 hover:text-white transition-colors bg-white/5 p-1 rounded-lg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/components/InteractiveDemo.tsx",
                        lineNumber: 81,
                        columnNumber: 145
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/InteractiveDemo.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6 py-3 border-b border-white/10 bg-[#111111] flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-bold tracking-tight text-white flex items-center gap-2",
                            children: [
                                "Prueba Interactiva ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-emerald-400 text-sm font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20",
                                    children: "Live"
                                }, void 0, false, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 84,
                                    columnNumber: 32
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/InteractiveDemo.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setProvider('openai'),
                                    className: `px-3 py-1 text-xs rounded-md transition-colors ${provider === 'openai' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`,
                                    children: "OpenAI"
                                }, void 0, false, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setProvider('github'),
                                    className: `px-3 py-1 text-xs rounded-md transition-colors ${provider === 'github' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`,
                                    children: "GitHub"
                                }, void 0, false, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setProvider('gemini'),
                                    className: `px-3 py-1 text-xs rounded-md transition-colors ${provider === 'gemini' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`,
                                    children: "Gemini"
                                }, void 0, false, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/InteractiveDemo.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/InteractiveDemo.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-grow flex flex-col md:flex-row overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full md:w-2/3 flex flex-col p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/10 min-h-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-grow overflow-y-auto space-y-4 md:space-y-6 pr-2 md:pr-4 custom-scrollbar",
                                    children: [
                                        messages.map((msg, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `max-w-[85%] md:max-w-md px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-white/90 rounded-2xl rounded-br-none' : 'bg-white/10 text-white/90 rounded-2xl rounded-bl-none border border-white/5'}`,
                                                    children: msg.content
                                                }, void 0, false, {
                                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, index, false, {
                                                fileName: "[project]/components/InteractiveDemo.tsx",
                                                lineNumber: 97,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))),
                                        isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-start",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce",
                                                        style: {
                                                            animationDelay: '0ms'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/InteractiveDemo.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 177
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce",
                                                        style: {
                                                            animationDelay: '150ms'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/InteractiveDemo.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 283
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce",
                                                        style: {
                                                            animationDelay: '300ms'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/InteractiveDemo.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 391
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/InteractiveDemo.tsx",
                                                lineNumber: 101,
                                                columnNumber: 65
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 101,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            ref: chatEndRef
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 102,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 95,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: handleSendMessage,
                                    className: "mt-4 pt-4 border-t border-white/10 flex gap-2 md:gap-3 relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: userInput,
                                            onChange: (e)=>setUserInput(e.target.value),
                                            placeholder: "Prueba interactuar...",
                                            className: "flex-grow bg-[#111111] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/30",
                                            disabled: isLoading
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "bg-blue-600 text-white px-4 md:px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                                            disabled: isLoading,
                                            children: "Enviar"
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 106,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/InteractiveDemo.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full md:w-1/3 p-4 md:p-6 bg-[#050505] flex flex-col h-auto md:h-full overflow-y-auto border-t md:border-t-0 border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:block hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6",
                                            children: "Estado del Proceso"
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-4 mb-8",
                                            children: TASKS.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "flex items-center text-sm",
                                                    children: [
                                                        taskState[task.id] === 'completed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 mr-3 shadow-sm shadow-emerald-500/10 text-[10px]",
                                                            children: "✓"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                                            lineNumber: 117,
                                                            columnNumber: 60
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        taskState[task.id] === 'in_progress' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-5 h-5 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin mr-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                                            lineNumber: 118,
                                                            columnNumber: 62
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        taskState[task.id] === 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-5 h-5 rounded-full border border-white/10 bg-white/5 mr-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                                            lineNumber: 119,
                                                            columnNumber: 58
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `${taskState[task.id] === 'completed' ? 'text-white/80' : taskState[task.id] === 'in_progress' ? 'text-yellow-400 font-medium' : 'text-white/20'}`,
                                                            children: task.text
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, task.id, true, {
                                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                                    lineNumber: 116,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-h-0 flex flex-col md:pt-6 md:border-t border-white/10",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2",
                                            children: "✨ Personalidad IA"
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-white/40 mb-3 leading-relaxed",
                                            children: "Escribe el contexto de tu negocio para que el bot lo asuma al instante."
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: demoContext,
                                            onChange: (e)=>setDemoContext(e.target.value),
                                            placeholder: "Ej. Soy una clínica dental en Bogotá...",
                                            className: "w-full min-h-[80px] md:flex-1 bg-[#111111] text-white rounded-xl px-3 py-3 text-sm border border-white/10 focus:outline-none focus:border-purple-500/50 transition-colors placeholder-white/20 resize-none"
                                        }, void 0, false, {
                                            fileName: "[project]/components/InteractiveDemo.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/InteractiveDemo.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/InteractiveDemo.tsx",
                            lineNumber: 111,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/InteractiveDemo.tsx",
                    lineNumber: 92,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/InteractiveDemo.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/InteractiveDemo.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(InteractiveDemo, "rsdaJo17H++MMvq1puFonfsroTc=");
_c = InteractiveDemo;
var _c;
__turbopack_context__.k.register(_c, "InteractiveDemo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/InteractiveDemo.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/InteractiveDemo.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_InteractiveDemo_tsx_4d41ce5e._.js.map