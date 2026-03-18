module.exports = [
"[project]/context/AgentyContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentyProvider",
    ()=>AgentyProvider,
    "useAgenty",
    ()=>useAgenty
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const AgentyContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AgentyProvider({ children, initialAgents = [] }) {
    const { status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [agents, setAgents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialAgents);
    const [activeAgent, setActiveAgent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialAgents.length > 0 ? initialAgents[0] : null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialAgents.length === 0); // Only loading if no initial data
    const refreshAgents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        // Prevent re-fetching if initialAgents are already set and we are authenticated
        if (initialAgents.length > 0 && isLoading === false) {
            return; // Skip explicit fetch
        }
        // Only fetch if authenticated
        if (status !== "authenticated" && initialAgents.length === 0) {
            if (status === "unauthenticated") {
                setIsLoading(false);
            }
            return;
        }
        try {
            console.log("[AgentyProvider] Fetching agents...");
            const response = await fetch("/api/business");
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                console.error("[AgentyProvider] API Error:", response.status, errorData);
                throw new Error(errorData.error || "Error fetching agents");
            }
            const data = await response.json();
            if (data.success && data.businesses) {
                const fetchedAgents = data.businesses;
                setAgents(fetchedAgents);
                // Sync active selection
                const activeId = localStorage.getItem("agenty_active_agent_id");
                let active = fetchedAgents.find((a)=>a.id === activeId) || fetchedAgents[0];
                if (active) {
                    setActiveAgent(active);
                    localStorage.setItem("agenty_active_agent_id", active.id);
                    localStorage.setItem("agenty_config", JSON.stringify(active));
                }
            }
        } catch (error) {
            console.error("Failed to load agents:", error);
        } finally{
            setIsLoading(false);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (status === "authenticated") {
            refreshAgents();
        } else if (status === "unauthenticated") {
            setIsLoading(false);
        }
    }, [
        refreshAgents,
        status
    ]);
    const switchAgent = (agentId)=>{
        const agent = agents.find((a)=>a.id === agentId);
        if (!agent) return;
        setActiveAgent(agent);
        localStorage.setItem("agenty_active_agent_id", agent.id);
        localStorage.setItem("agenty_config", JSON.stringify(agent));
        // Trigger global event for components not using context yet
        window.dispatchEvent(new Event('agentSwitched'));
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(`Cambiado a ${agent.name || 'Agente'}`);
    };
    const updateActiveAgentConfig = (newConfig)=>{
        if (!activeAgent) return;
        const updated = {
            ...activeAgent,
            ...newConfig
        };
        setActiveAgent(updated);
        localStorage.setItem("agenty_config", JSON.stringify(updated));
        // Update the agent in the list too
        setAgents((prev)=>prev.map((a)=>a.id === updated.id ? updated : a));
    };
    const saveAgent = async (agentId, name, config)=>{
        try {
            const response = await fetch("/api/business", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: agentId,
                    name,
                    config
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.error || "Error al guardar el agente");
            }
            const data = await response.json();
            if (data.success && data.business) {
                // Actualizar estado local si es el agente activo
                if (activeAgent?.id === agentId) {
                    setActiveAgent(data.business);
                    localStorage.setItem("agenty_config", JSON.stringify(data.business));
                }
                // Actualizar en la lista de agentes
                setAgents((prev)=>prev.map((a)=>a.id === agentId ? data.business : a));
                return true;
            }
            return false;
        } catch (error) {
            console.error("[AgentyProvider] Error saving agent:", error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error instanceof Error ? error.message : "Error al guardar");
            return false;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AgentyContext.Provider, {
        value: {
            agents,
            activeAgent,
            isLoading,
            refreshAgents,
            switchAgent,
            updateActiveAgentConfig,
            saveAgent
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/context/AgentyContext.tsx",
        lineNumber: 151,
        columnNumber: 9
    }, this);
}
function useAgenty() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AgentyContext);
    if (context === undefined) {
        throw new Error('useAgenty must be used within an AgentyProvider');
    }
    return context;
}
}),
"[project]/components/dashboard/dashboardCopy.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dashboardCopy",
    ()=>dashboardCopy,
    "getDashboardCopy",
    ()=>getDashboardCopy
]);
const dashboardCopyByLocale = {
    es: {
        confirmation: {
            cancel: "Cancelar",
            labels: {
                delete: "Confirmar eliminacion",
                bulkDelete: "Confirmar borrado masivo",
                cleanup: "Confirmar limpieza",
                disconnect: "Confirmar desconexion",
                deactivate: "Confirmar desactivacion"
            },
            irreversible: "Esta accion no se puede deshacer."
        },
        shell: {
            clearNotifications: "Se eliminaran todas las notificaciones visibles del panel.",
            deleteAgent: (agentName)=>`Vas a eliminar el agente ${agentName}.`,
            deleteAgentDetails: "Esta accion es irreversible."
        },
        knowledge: {
            unsupportedFileType: (type)=>`El tipo de archivo \"${type}\" no es soportado. Sube .txt, .md, .csv, .json o PDF.`,
            uploadQueued: "Documento en cola, iniciando procesamiento...",
            uploadSuccess: "Conocimiento cargado correctamente",
            uploadError: "No se pudo subir el archivo",
            deleteSuccess: "Fragmento eliminado",
            deleteError: "No se pudo eliminar el fragmento",
            deleteFragmentConfirm: "Seguro que quieres eliminar este fragmento de conocimiento?",
            deleteBulkConfirm: (count)=>`Se eliminaran ${count} fragmento(s) de la base de conocimiento.`,
            bulkDeleteError: "No se pudo completar el borrado masivo",
            replayError: "No se pudo ejecutar replay",
            replaySuccess: (count)=>`Se reencolaron ${count} job(s)`,
            cleanupError: "No se pudo ejecutar cleanup",
            cleanupSuccess: (count)=>`Limpieza completada: ${count} job(s) eliminados`,
            cleanupConfirm: (days)=>`Se eliminaran jobs COMPLETED/FAILED/DLQ mas antiguos que ${days} dia(s).`,
            cleanupDetails: "Esta accion ayuda a mantener la cola liviana y no afecta jobs activos.",
            websiteMissingUrl: "Ingresa una URL para sincronizar.",
            websiteInvalidUrl: "La URL no es valida.",
            websiteSyncError: "No se pudo sincronizar la URL.",
            websiteQueued: "URL en cola. Procesando contenido...",
            websiteSuccess: "Sitio sincronizado y agregado a la base de conocimiento.",
            healthReadError: "No se pudo leer health",
            healthFetchError: "No se pudo obtener el estado operativo",
            jobStatusReadError: "Error leyendo estado del job",
            jobStatusFetchError: "No se pudo consultar el estado del procesamiento",
            jobFailed: "El procesamiento fallo",
            jobTimeout: "Tiempo de espera agotado para el procesamiento del documento",
            processingFilePrefix: "Procesando:"
        },
        tools: {
            updateSuccess: "Herramientas actualizadas correctamente.",
            updateError: "No se pudo actualizar la herramienta. Intenta de nuevo.",
            openingConfig: (toolName)=>`Abriendo configuracion de ${toolName}...`,
            deactivateConfirm: (toolName)=>`Vas a desactivar ${toolName}.`,
            deactivateDetails: "El agente dejara de usar esta herramienta hasta que la conectes de nuevo."
        },
        connections: {
            saveError: "Error al guardar. Intenta de nuevo.",
            disconnectError: "Error desconectando.",
            disconnectConfirm: (channelName)=>`Vas a desconectar ${channelName}.`,
            disconnectDetails: "El agente dejara de recibir y responder mensajes en este canal hasta volver a conectarlo."
        }
    },
    en: {
        confirmation: {
            cancel: "Cancel",
            labels: {
                delete: "Confirm deletion",
                bulkDelete: "Confirm bulk delete",
                cleanup: "Confirm cleanup",
                disconnect: "Confirm disconnect",
                deactivate: "Confirm deactivation"
            },
            irreversible: "This action cannot be undone."
        },
        shell: {
            clearNotifications: "All visible dashboard notifications will be removed.",
            deleteAgent: (agentName)=>`You are about to delete agent ${agentName}.`,
            deleteAgentDetails: "This action is irreversible."
        },
        knowledge: {
            unsupportedFileType: (type)=>`File type \"${type}\" is not supported. Upload .txt, .md, .csv, .json, or PDF.`,
            uploadQueued: "Document queued, starting processing...",
            uploadSuccess: "Knowledge uploaded successfully",
            uploadError: "Could not upload file",
            deleteSuccess: "Fragment deleted",
            deleteError: "Could not delete fragment",
            deleteFragmentConfirm: "Are you sure you want to delete this knowledge fragment?",
            deleteBulkConfirm: (count)=>`${count} knowledge fragment(s) will be deleted.`,
            bulkDeleteError: "Bulk deletion could not be completed",
            replayError: "Replay could not be executed",
            replaySuccess: (count)=>`${count} job(s) re-queued`,
            cleanupError: "Cleanup could not be executed",
            cleanupSuccess: (count)=>`Cleanup completed: ${count} job(s) deleted`,
            cleanupConfirm: (days)=>`COMPLETED/FAILED/DLQ jobs older than ${days} day(s) will be deleted.`,
            cleanupDetails: "This keeps the queue lightweight and does not affect active jobs.",
            websiteMissingUrl: "Enter a URL to sync.",
            websiteInvalidUrl: "URL is not valid.",
            websiteSyncError: "Could not sync URL.",
            websiteQueued: "URL queued. Processing content...",
            websiteSuccess: "Website synced and added to knowledge base.",
            healthReadError: "Could not read health",
            healthFetchError: "Could not fetch operational status",
            jobStatusReadError: "Error reading job status",
            jobStatusFetchError: "Could not fetch processing status",
            jobFailed: "Processing failed",
            jobTimeout: "Processing timeout reached",
            processingFilePrefix: "Processing:"
        },
        tools: {
            updateSuccess: "Tools updated successfully.",
            updateError: "Could not update tool. Please try again.",
            openingConfig: (toolName)=>`Opening configuration for ${toolName}...`,
            deactivateConfirm: (toolName)=>`You are about to deactivate ${toolName}.`,
            deactivateDetails: "The agent will stop using this tool until you connect it again."
        },
        connections: {
            saveError: "Error while saving. Please try again.",
            disconnectError: "Error disconnecting.",
            disconnectConfirm: (channelName)=>`You are about to disconnect ${channelName}.`,
            disconnectDetails: "The agent will stop receiving and replying on this channel until reconnected."
        }
    }
};
const dashboardCopy = dashboardCopyByLocale.es;
function getDashboardCopy(locale) {
    if (locale === "en") return dashboardCopyByLocale.en;
    return dashboardCopyByLocale.es;
}
}),
"[project]/components/dashboard/useDashboardCopy.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDashboardCopy",
    ()=>useDashboardCopy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$dashboardCopy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/dashboardCopy.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const DASHBOARD_LOCALE_KEY = "dashboard.locale";
function normalizeLocale(value) {
    if (value === "en" || value === "es") return value;
    return undefined;
}
function useDashboardCopy() {
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("es");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const queryLocale = normalizeLocale(searchParams.get("lang"));
        if (queryLocale) {
            setLocale(queryLocale);
            try {
                localStorage.setItem(DASHBOARD_LOCALE_KEY, queryLocale);
            } catch  {
            // Ignore storage errors in restricted browser contexts.
            }
            return;
        }
        try {
            const storedLocale = normalizeLocale(localStorage.getItem(DASHBOARD_LOCALE_KEY));
            if (storedLocale) {
                setLocale(storedLocale);
            }
        } catch  {
        // Ignore storage errors in restricted browser contexts.
        }
    }, [
        searchParams
    ]);
    const copy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$dashboardCopy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDashboardCopy"])(locale), [
        locale
    ]);
    const setDashboardLocale = (nextLocale)=>{
        setLocale(nextLocale);
        try {
            localStorage.setItem(DASHBOARD_LOCALE_KEY, nextLocale);
        } catch  {
        // Ignore storage errors in restricted browser contexts.
        }
    };
    return {
        locale,
        copy,
        setDashboardLocale
    };
}
}),
"[project]/components/dashboard/ActionConfirmationPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActionConfirmationPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$useDashboardCopy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/useDashboardCopy.ts [app-ssr] (ecmascript)");
;
;
;
function ActionConfirmationPanel({ message, details, confirmLabel, cancelLabel, onConfirm, onCancel, isLoading = false, disabled = false }) {
    const { copy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$useDashboardCopy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardCopy"])();
    const blocked = isLoading || disabled;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-100",
                children: message
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            details ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-200/80 mt-1",
                children: details
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
                lineNumber: 32,
                columnNumber: 18
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onCancel,
                        disabled: blocked,
                        className: "rounded border border-white/15 px-3 py-1 text-[11px] text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                        children: cancelLabel || copy.confirmation.cancel
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onConfirm,
                        disabled: blocked,
                        className: "inline-flex items-center gap-2 rounded border border-red-500/40 bg-red-500/20 px-3 py-1 text-[11px] text-red-100 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                        children: [
                            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-3 h-3 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
                                lineNumber: 47,
                                columnNumber: 24
                            }, this) : null,
                            confirmLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/ActionConfirmationPanel.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/dashboard/DashboardShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-ssr] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/blocks.js [app-ssr] (ecmascript) <export default as Blocks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-ssr] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-close.js [app-ssr] (ecmascript) <export default as PanelLeftClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-open.js [app-ssr] (ecmascript) <export default as PanelLeftOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-ssr] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-ssr] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AgentyContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/ActionConfirmationPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$useDashboardCopy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/useDashboardCopy.ts [app-ssr] (ecmascript)");
"use client";
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
function DashboardShell({ children, initialAgents, userName, userEmail }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AgentyProvider"], {
        initialAgents: initialAgents,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardContent, {
            userName: userName,
            userEmail: userEmail,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/dashboard/DashboardShell.tsx",
            lineNumber: 56,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/dashboard/DashboardShell.tsx",
        lineNumber: 55,
        columnNumber: 9
    }, this);
}
function DashboardContent({ children, userName, userEmail }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { copy, locale, setDashboardLocale } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$useDashboardCopy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDashboardCopy"])();
    const { agents, activeAgent, switchAgent, refreshAgents } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAgenty"])();
    const [isDropdownOpen, setIsDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isCollapsed, setIsCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isProfileOpen, setIsProfileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [handoffCount, setHandoffCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [pendingDeleteAgentId, setPendingDeleteAgentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isDeletingAgent, setIsDeletingAgent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isClearNotificationsConfirmOpen, setIsClearNotificationsConfirmOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: "welcome-dashboard",
            title: "¡Bienvenido al nuevo Dashboard!",
            subtitle: "Explora las nuevas funciones de Agenty.ai"
        }
    ]);
    const profileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const notificationsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved === 'true') setIsCollapsed(true);
        setIsMounted(true);
        const handleClickOutside = (event)=>{
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!activeAgent?.id) {
            setHandoffCount(0);
            return;
        }
        let cancelled = false;
        const fetchHandoffCount = async ()=>{
            try {
                const res = await fetch(`/api/chats?businessId=${activeAgent.id}`);
                const data = await res.json();
                if (!res.ok || !data?.success || cancelled) return;
                const count = Array.isArray(data.chats) ? data.chats.filter((chat)=>chat?.status === "handoff").length : 0;
                setHandoffCount(count);
            } catch  {
            // No bloqueamos UI por error de métrica de badge
            }
        };
        fetchHandoffCount();
        const interval = setInterval(fetchHandoffCount, 15000);
        return ()=>{
            cancelled = true;
            clearInterval(interval);
        };
    }, [
        activeAgent?.id
    ]);
    const toggleCollapse = ()=>{
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };
    const agentName = activeAgent?.name || "Mi Negocio";
    const initial = (activeAgent?.name || userName || "U").charAt(0).toUpperCase();
    const pendingDeleteAgent = agents.find((ag)=>ag.id === pendingDeleteAgentId) || null;
    const openDeleteAgentConfirm = (e, agentId)=>{
        e.stopPropagation();
        if (isDeletingAgent) return;
        setPendingDeleteAgentId(agentId);
    };
    const closeDeleteAgentConfirm = ()=>{
        if (isDeletingAgent) return;
        setPendingDeleteAgentId(null);
    };
    const handleDeleteAgent = async ()=>{
        if (!pendingDeleteAgentId || isDeletingAgent) return;
        setIsDeletingAgent(true);
        try {
            const res = await fetch(`/api/business?id=${pendingDeleteAgentId}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                console.error("Error deleting agent: request failed");
                return;
            }
            await refreshAgents();
            setPendingDeleteAgentId(null);
        } catch (error) {
            console.error("Error deleting agent:", error);
        } finally{
            setIsDeletingAgent(false);
        }
    };
    const navItems = [
        {
            href: '/dashboard',
            label: 'Overview',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
        },
        {
            href: '/dashboard/builder',
            label: 'Playground',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"]
        },
        {
            href: '/dashboard/knowledge',
            label: 'Knowledge Base',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"]
        },
        {
            href: '/dashboard/connections',
            label: 'Conexiones',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"]
        },
        {
            href: '/dashboard/tools',
            label: 'Tools Store',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__["Blocks"]
        },
        {
            href: '/dashboard/inbox',
            label: 'Live Inbox',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
            badge: handoffCount || undefined
        }
    ];
    if (!isMounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-[#050505] text-white overflow-hidden font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].aside, {
                initial: false,
                animate: {
                    width: isCollapsed ? 80 : 256
                },
                className: "shrink-0 flex flex-col bg-[#050505] relative z-20 border-r border-white/5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-16 flex items-center px-4 relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>!isCollapsed && setIsDropdownOpen(!isDropdownOpen),
                                className: `w-full flex items-center rounded-lg hover:bg-white/5 transition-colors group ${isCollapsed ? 'justify-center p-2' : 'justify-between px-2 py-2'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 rounded bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-bold text-white",
                                                    children: initial
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                    lineNumber: 206,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 205,
                                                columnNumber: 29
                                            }, this),
                                            !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-start truncate max-w-30",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-sm text-white/90 leading-tight truncate w-full",
                                                        children: agentName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 210,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] text-white/40 font-medium tracking-wider",
                                                        children: "PLAN PRO"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 211,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 209,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 204,
                                        columnNumber: 25
                                    }, this),
                                    !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        className: `w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 216,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 200,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                children: isDropdownOpen && !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: -10
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        scale: 0.95
                                    },
                                    className: "absolute top-16 left-2 right-2 bg-[#0a0a0a] rounded-xl p-2 z-50 flex flex-col gap-1 max-h-75 overflow-y-auto shadow-2xl border border-white/5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 py-1",
                                            children: "Tus Agentes"
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                            lineNumber: 229,
                                            columnNumber: 33
                                        }, this),
                                        agents.map((ag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "group/btn relative flex items-center rounded-lg hover:bg-white/5 transition-all text-left group/item w-full",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            switchAgent(ag.id);
                                                            setIsDropdownOpen(false);
                                                        },
                                                        className: "flex items-center gap-3 px-2 py-2.5 flex-1 text-left min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] font-bold text-white/70 group-hover:item:text-white",
                                                                    children: ag.name?.charAt(0).toUpperCase()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 244,
                                                                    columnNumber: 49
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                lineNumber: 243,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col truncate w-full pr-6",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-medium text-xs text-white/80 group-hover:item:text-white truncate",
                                                                        children: ag.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                        lineNumber: 247,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] text-white/30 truncate",
                                                                        children: ag.objective || 'AI Assistant'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                        lineNumber: 248,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                lineNumber: 246,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>openDeleteAgentConfirm(e, ag.id),
                                                        className: "absolute right-2 p-1.5 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover/btn:opacity-100 z-10",
                                                        title: "Eliminar Agente",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            className: "w-3.5 h-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                            lineNumber: 256,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, ag.id, true, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 232,
                                                columnNumber: 37
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "my-1 mx-2 h-px bg-white/5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                            lineNumber: 261,
                                            columnNumber: 33
                                        }, this),
                                        pendingDeleteAgent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            message: copy.shell.deleteAgent(pendingDeleteAgent.name),
                                            details: copy.shell.deleteAgentDetails,
                                            confirmLabel: copy.confirmation.labels.delete,
                                            cancelLabel: copy.confirmation.cancel,
                                            isLoading: isDeletingAgent,
                                            onCancel: closeDeleteAgentConfirm,
                                            onConfirm: ()=>{
                                                void handleDeleteAgent();
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                            lineNumber: 264,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/",
                                            onClick: ()=>setIsDropdownOpen(false),
                                            className: "flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left text-xs font-medium text-white/50 hover:text-white",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 37
                                                }, this),
                                                "Crear Nuevo Agente"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                            lineNumber: 277,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                    lineNumber: 223,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 221,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 199,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `mb-4 pb-4 ${!isCollapsed && 'border-b border-white/5'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: `flex items-center gap-3 px-3 py-2 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group ${isCollapsed && 'justify-center'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                            className: "w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                            lineNumber: 294,
                                            columnNumber: 29
                                        }, this),
                                        !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Regresar a la Home"
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                            lineNumber: 295,
                                            columnNumber: 46
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                    lineNumber: 293,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 292,
                                columnNumber: 21
                            }, this),
                            !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 mt-6",
                                children: "Principal"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 300,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: navItems.map((item)=>{
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: item.href,
                                        className: `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group relative
                                        ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/3'}
                                        ${isCollapsed && 'justify-center'}
                                    `,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                className: `w-4 h-4 shrink-0 transition-all ${isActive ? 'text-blue-400 scale-110' : 'group-hover:scale-110 group-hover:text-white/80'}`
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 320,
                                                columnNumber: 37
                                            }, this),
                                            !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between w-full",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 323,
                                                        columnNumber: 45
                                                    }, this),
                                                    item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors
                                                    ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white'}
                                                `,
                                                        children: item.badge
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 325,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 322,
                                                columnNumber: 41
                                            }, this),
                                            isActive && isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                layoutId: "active-indicator",
                                                className: "absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 334,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, item.href, true, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 309,
                                        columnNumber: 33
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 303,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 290,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/settings",
                                className: `flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all text-sm font-medium group
                            ${pathname === '/dashboard/settings' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}
                            ${isCollapsed && 'justify-center'}
                        `,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: `w-4 h-4 shrink-0 transition-transform duration-500 group-hover:rotate-45 ${pathname === '/dashboard/settings' ? 'text-blue-400' : ''}`
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 353,
                                        columnNumber: 25
                                    }, this),
                                    !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Configuración"
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 354,
                                        columnNumber: 42
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 346,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleCollapse,
                                className: `flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group ${isCollapsed && 'justify-center'}`,
                                children: [
                                    isCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__["PanelLeftOpen"], {
                                        className: "w-4 h-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 362,
                                        columnNumber: 40
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__["PanelLeftClose"], {
                                        className: "w-4 h-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 362,
                                        columnNumber: 89
                                    }, this),
                                    !isCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Contraer Menú"
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 363,
                                        columnNumber: 42
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 358,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 345,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 193,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 flex flex-col relative overflow-hidden bg-[#050505]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "h-16 shrink-0 flex items-center justify-between px-8 bg-[#050505]/60 backdrop-blur-md relative z-30 border-b border-white/5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4 text-sm text-white/40 font-medium",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white/80",
                                        children: agentName
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 373,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-px h-3 bg-white/10"
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 374,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse transition-all shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 376,
                                                columnNumber: 29
                                            }, this),
                                            "ONLINE"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 375,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 372,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hidden sm:flex items-center gap-2 text-[11px] text-white/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Idioma"
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 383,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: locale,
                                                onChange: (e)=>setDashboardLocale(e.target.value),
                                                className: "bg-[#0a0a0a] border border-white/10 rounded-md px-2 py-1 text-white/80 focus:outline-none",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "es",
                                                        children: "ES"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 389,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "en",
                                                        children: "EN"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 390,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 384,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 382,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        ref: notificationsRef,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setIsNotificationsOpen(!isNotificationsOpen),
                                                className: "relative p-2 text-white/40 hover:text-white transition-colors group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                                        className: "w-5 h-5 transition-transform group-hover:scale-110"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 400,
                                                        columnNumber: 33
                                                    }, this),
                                                    notifications.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 396,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                children: isNotificationsOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        opacity: 0,
                                                        y: 10,
                                                        scale: 0.95
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1
                                                    },
                                                    exit: {
                                                        opacity: 0,
                                                        y: 10,
                                                        scale: 0.95
                                                    },
                                                    className: "absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl p-4 overflow-hidden",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between mb-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "text-xs font-bold text-white/80",
                                                                    children: "Notificaciones"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 415,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>setIsClearNotificationsConfirmOpen(true),
                                                                    className: "text-[10px] text-blue-400 hover:underline disabled:text-white/20 disabled:no-underline",
                                                                    disabled: notifications.length === 0,
                                                                    children: "Limpiar todo"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 416,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 41
                                                        }, this),
                                                        isClearNotificationsConfirmOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            message: copy.shell.clearNotifications,
                                                            details: copy.confirmation.irreversible,
                                                            confirmLabel: copy.confirmation.labels.cleanup,
                                                            cancelLabel: copy.confirmation.cancel,
                                                            onCancel: ()=>setIsClearNotificationsConfirmOpen(false),
                                                            onConfirm: ()=>{
                                                                setNotifications([]);
                                                                setIsClearNotificationsConfirmOpen(false);
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                            lineNumber: 426,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-3",
                                                            children: [
                                                                notifications.map((notification)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group",
                                                                        onClick: ()=>{
                                                                            setIsNotificationsOpen(false);
                                                                            router.push('/dashboard');
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                                    className: "w-4 h-4 text-blue-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                                    lineNumber: 450,
                                                                                    columnNumber: 57
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                                lineNumber: 449,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-white/90 font-medium",
                                                                                        children: notification.title
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                                        lineNumber: 453,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-[10px] text-white/40",
                                                                                        children: notification.subtitle
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                                        lineNumber: 454,
                                                                                        columnNumber: 57
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                                lineNumber: 452,
                                                                                columnNumber: 53
                                                                            }, this)
                                                                        ]
                                                                    }, notification.id, true, {
                                                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                        lineNumber: 441,
                                                                        columnNumber: 49
                                                                    }, this)),
                                                                notifications.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-center py-4 text-[10px] text-white/20 italic",
                                                                    children: "No hay notificaciones pendientes"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 459,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                            lineNumber: 439,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                    lineNumber: 408,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 406,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 395,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        ref: profileRef,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setIsProfileOpen(!isProfileOpen),
                                                className: "w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 hover:ring-white/30 transition-all cursor-pointer overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full h-full flex items-center justify-center text-xs font-bold text-white",
                                                    children: (userName || "U").charAt(0).toUpperCase()
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 469,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                children: isProfileOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        opacity: 0,
                                                        y: 10,
                                                        scale: 0.95
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1
                                                    },
                                                    exit: {
                                                        opacity: 0,
                                                        y: 10,
                                                        scale: 0.95
                                                    },
                                                    className: "absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl p-2 overflow-hidden",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-3 py-3 border-b border-white/5 mb-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-bold text-white truncate",
                                                                    children: userName || "Usuario"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 487,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[10px] text-white/30 truncate",
                                                                    children: userEmail || "Sin email"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 488,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                            lineNumber: 486,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-0.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>{
                                                                        setIsProfileOpen(false);
                                                                        router.push('/dashboard/settings');
                                                                    },
                                                                    className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                            className: "w-3.5 h-3.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                            lineNumber: 499,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "Mi Perfil"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                            lineNumber: 500,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 492,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>{
                                                                        setIsProfileOpen(false);
                                                                        router.push('/pricing');
                                                                    },
                                                                    className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                                            className: "w-3.5 h-3.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                            lineNumber: 509,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "Facturación"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                            lineNumber: 510,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 502,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "my-1 h-px bg-white/5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 512,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])({
                                                                            callbackUrl: '/'
                                                                        }),
                                                                    className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all text-xs font-medium group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                                            className: "w-3.5 h-3.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                            lineNumber: 517,
                                                                            columnNumber: 49
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "Cerrar Sesión"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                            lineNumber: 518,
                                                                            columnNumber: 49
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                                    lineNumber: 513,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                            lineNumber: 491,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                    lineNumber: 480,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                                lineNumber: 478,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                        lineNumber: 468,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 381,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 371,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-10 relative scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 left-1/4 -translate-y-1/2 w-150 h-150 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 531,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative z-10 max-w-6xl mx-auto",
                                children: children
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                                lineNumber: 532,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/DashboardShell.tsx",
                        lineNumber: 529,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/DashboardShell.tsx",
                lineNumber: 369,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/DashboardShell.tsx",
        lineNumber: 191,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=_ec264ce5._.js.map