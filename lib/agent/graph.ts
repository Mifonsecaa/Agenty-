import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { createBookingTool } from "../tools/booking-tool";
import { createKnowledgeTool, createSpreadsheetUpdateTool, listSpreadsheetFilesForBusiness } from "../tools/knowledge-tool";
import { brainModel, createRequiredToolAgent, jsonExtractorModel, stateExtractorModel } from "@/lib/ai";
import { processExcelWorkOrder } from "../tools/excel-handler";

const AGENT_MAX_HISTORY_MESSAGES = Number(process.env.AGENT_MAX_HISTORY_MESSAGES || 8);
let cachedGraphCheckpointer: any | undefined;

const AgentGraphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    businessId: Annotation<string>(),
    businessName: Annotation<string>(),
    config: Annotation<any>(),
    customerPhone: Annotation<string | undefined>(),
    currentPlan: Annotation<string | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    workerResult: Annotation<string | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    isTaskComplete: Annotation<boolean | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    retryCount: Annotation<number>({
        reducer: (prev, next) => prev + next,
        default: () => 0,
    }),
    extractionState: Annotation<{
        status: "INIT" | "ASK_TIME" | "ASK_PEOPLE" | "ASK_NAME" | "CONFIRMED" | "DONE" | "";
        data: Record<string, any>;
    } | undefined>({
        reducer: (prev, next) => {
            if (!next) return prev;
            if (!prev) return next;
            return {
                status: next.status || prev.status,
                data: { ...(prev.data || {}), ...(next.data || {}) }
            };
        },
        default: () => ({ status: "INIT", data: {} })
    }),
    availableFiles: Annotation<Array<{ fileName: string; sourceId: string; fileUrl: string }> | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
});

type AgentGraphStateType = typeof AgentGraphState.State;

function normalizeMessageContent(content: unknown): string {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content
        .map((part: any) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && typeof part.text === "string") return part.text;
            return "";
        })
        .join(" ")
        .trim();
}

function getLastUserMessage(messages: BaseMessage[]) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const msg: any = messages[i];
        if (msg?.getType?.() === "human") {
            return normalizeMessageContent(msg.content);
        }
    }
    return "";
}

function getRecentConversationText(messages: BaseMessage[], take = 10) {
    const slice = messages.slice(-Math.max(4, Math.min(20, take)));
    return slice
        .map((msg: any) => {
            const role = msg?.getType?.() === "human" ? "usuario" : "asistente";
            const content = normalizeMessageContent(msg?.content || "");
            return `${role}: ${content}`;
        })
        .join("\n");
}

function trimMessagesForModel(messages: BaseMessage[]) {
    const maxMessages = Math.max(4, Math.min(16, AGENT_MAX_HISTORY_MESSAGES));
    if (messages.length <= maxMessages) return messages;
    return messages.slice(-maxMessages);
}

function parseRoute(raw: string): "rag_agent" | "tool_agent" {
    const value = String(raw || "").trim().toLowerCase();
    return value.includes("tool_agent") ? "tool_agent" : "rag_agent";
}

function isReservationIntent(text: string) {
    return /(reserv|reserva|agendar|agenda|mesa\b|personas\b|cita|turno)/i.test(String(text || ""));
}

function isReservationStatusQuestion(text: string) {
    return /(si\s+realizaste|ya\s+quedo|quedo\s+la\s+reserva|confirmaste|esta\s+confirmada|se\s+hizo\s+la\s+reserva)/i.test(String(text || ""));
}

function hasReservationRequiredData(text: string) {
    const value = String(text || "");
    const hasDate = /\b(\d{4}-\d{2}-\d{2}|hoy|mañana|manana|pasado\s+mañana|pasado\s+manana|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/i.test(value);
    const hasHour = /\b([01]?\d|2[0-3])[:.]\d{2}\b|\b\d{1,2}\s?(am|pm)\b|\ba\s+las\s+\d{1,2}(?::\d{2})?\b/i.test(value);
    const hasPeople = /\b\d+\s*(persona|personas|pax|comensales)\b/i.test(value);
    const hasName = /\b(a\s+nombre\s+de|nombre\s*[:\-]|soy\s+)\s*[a-záéíóúñ]/i.test(value);
    return hasDate && hasHour && hasPeople && hasName;
}

function extractLastMatch(value: string, regex: RegExp) {
    const source = String(value || "");
    const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
    const globalRegex = new RegExp(regex.source, flags);
    let match: RegExpExecArray | null = null;
    let last: RegExpExecArray | null = null;
    while ((match = globalRegex.exec(source)) !== null) {
        last = match;
    }
    return last;
}

function extractReservationSnapshot(conversationText: string, lastUserMessage: string) {
    const dateMatch = extractLastMatch(
        conversationText,
        /(\b\d{4}-\d{2}-\d{2}\b|\bhoy\b|\bmañana\b|\bmanana\b|\bpasado\s+mañana\b|\bpasado\s+manana\b|\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b)/i,
    );
    const timeMatch = extractLastMatch(
        conversationText,
        /(\b(?:[01]?\d|2[0-3])[:.]\d{2}\b|\b\d{1,2}\s?(?:am|pm)\b|\ba\s+las\s+\d{1,2}(?::\d{2})?\b)/i,
    );
    const peopleMatch = extractLastMatch(conversationText, /(\b\d+)\s*(persona|personas|pax|comensales)\b/i);
    const explicitName = extractLastMatch(conversationText, /(?:a\s+nombre\s+de|nombre\s*[:\-]|soy\s+)([a-záéíóúñ ]{3,60})/i);

    let name = explicitName?.[1]?.trim() || "";
    if (!name) {
        const shortNameCandidate = String(lastUserMessage || "").trim();
        if (/^[a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){1,3}$/i.test(shortNameCandidate)) {
            name = shortNameCandidate;
        }
    }

    return {
        date: dateMatch?.[1]?.trim() || "",
        time: timeMatch?.[1]?.trim() || "",
        people: peopleMatch?.[1]?.trim() || "",
        name,
    };
}

function isSpreadsheetEditIntent(text: string) {
    return /(excel|xlsx|xlsm|hoja|celda|fila|columna|actualiza|actualizar|modifica|modificar|agrega|agregar|append_row|update_cell)/i.test(String(text || ""));
}

function hasSpreadsheetMinimumData(text: string) {
    const value = String(text || "");
    const hasSheet = /(hoja\s*[:\-]?\s*[\wáéíóúñ ]+|sheet\s*[:\-]?\s*[\w\- ]+)/i.test(value);
    const hasCell = /\b[A-Z]{1,3}\d{1,5}\b/.test(value);
    const hasAppendHint = /(fila|registro|append|nueva\s+fila)/i.test(value);
    const hasFileRefHint = /(archivo|fileRef|url|\.xlsx|\.xlsm|\b\d+\b)/i.test(value);
    return hasFileRefHint && hasSheet && (hasCell || hasAppendHint);
}

function asksForImageOrMenu(text: string) {
    return /(imagen|foto|menu|carta|catalogo)/i.test(String(text || ""));
}

function extractMarkdownImageUrl(text: string) {
    const match = String(text || "").match(/!\[[^\]]*]\(([^)]+)\)/);
    return match?.[1]?.trim() || "";
}

function extractToolCalls(message: any): Array<{ name?: string; args?: unknown }> {
    const rawCalls = message?.additional_kwargs?.tool_calls || message?.tool_calls || [];
    if (!Array.isArray(rawCalls)) return [];

    return rawCalls.map((call: any) => {
        const fn = call?.function || {};
        let args: unknown = fn.arguments ?? call?.args ?? {};
        if (typeof args === "string") {
            try {
                args = JSON.parse(args);
            } catch {
                args = {};
            }
        }
        return { name: fn.name || call?.name, args };
    });
}

function getOptionalGraphCheckpointer() {
    if (cachedGraphCheckpointer !== undefined) return cachedGraphCheckpointer;

    try {
        // Lazy-load para mantener compatibilidad entre versiones de LangGraph.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const langgraphPkg = require("@langchain/langgraph");
        const SaverCtor = langgraphPkg?.MemorySaver || langgraphPkg?.InMemorySaver;
        cachedGraphCheckpointer = typeof SaverCtor === "function" ? new SaverCtor() : null;
    } catch {
        cachedGraphCheckpointer = null;
    }

    return cachedGraphCheckpointer;
}

export const createAgentGraph = (businessId: string, businessName: string, config: any, customerPhone?: string) => {
    const tools = [
        createKnowledgeTool(businessId),
        createSpreadsheetUpdateTool(businessId),
        createBookingTool(businessId, customerPhone),
    ];

    const toolMap = new Map<string, any>(tools.map((tool) => [String(tool.name), tool]));
    const requiredToolAgent = createRequiredToolAgent(tools);

    const ensureAvailableFiles = async (state: AgentGraphStateType) => {
        if (Array.isArray(state.availableFiles) && state.availableFiles.length > 0) {
            return state.availableFiles;
        }

        const files = await listSpreadsheetFilesForBusiness(businessId);
        return files.map((file) => ({
            fileName: file.fileName,
            sourceId: String(file.sourceId || ""),
            fileUrl: file.fileUrl,
        }));
    };

    const actionNode = async (state: AgentGraphStateType) => {
        console.log("⚙️ [ACTION NODE] Analizando extracción de estados o datos...");

        // Si es extracción de reservas:
        if (state.currentPlan === "EXTRAER_DATOS") {
            const systemPrompt = `Eres el Agente Extractor y Coordinador de Estados.
El usuario quiere hacer una reserva o una acción estructurada de pasos.
Debes revisar los datos actuales: ${JSON.stringify(state.extractionState?.data || {})}.
Revisa la conversación, identifica los datos que el usuario ha proporcionado. Si faltan datos vitales (fecha/hora, personas, nombre), haz la pregunta. Si ya están todos, pon status en CONFIRMED.
Reglas:
- NUNCA repitas preguntas ya respondidas.
- No reinicies la conversación si ya hay progreso.
- No saludes nuevamente.`;

            const extraction = await stateExtractorModel.invoke([
                new SystemMessage(systemPrompt),
                ...trimMessagesForModel(state.messages as BaseMessage[])
            ]);

            console.log("📊 Estado de extracción:", extraction);

            // Merge de data
            const mergedData = { ...(state.extractionState?.data || {}), ...(extraction.collectedData || {}) };

            let finalResponseMsg = "";
            let nextStatus: any = extraction.status;

            if (nextStatus === "CONFIRMED" || nextStatus === "DONE") {
                // Aquí el obrero enviará el dato real a la herramienta, sin mentir
                nextStatus = "DONE";
                return {
                    isTaskComplete: false,
                    currentPlan: `Guarda o anota la nueva reserva. Los datos recolectados y confirmados son: ${JSON.stringify(mergedData)}. Ejecuta la herramienta de guardado en el archivo excel / reservas que corresponda.`,
                    extractionState: {
                        status: nextStatus,
                        data: mergedData
                    }
                };
            } else {
                finalResponseMsg = extraction.nextQuestionToUser;
            }

            return {
                isTaskComplete: true,
                extractionState: {
                    status: nextStatus,
                    data: mergedData
                },
                messages: [new AIMessage(finalResponseMsg)]
            };
        }

        // --- EXCEL LOGIC ---
        console.log("⚙️ [ACTION NODE] Extrayendo JSON Excel...");
        const availableFiles = await ensureAvailableFiles(state);

        const systemPrompt = `Eres el extractor de datos (Obrero).
El Cerebro analizó la solicitud y dejó este insight/plan: "${state.currentPlan || 'Interpreta la conversación para extraer datos'}".
El usuario quiere modificar un documento. Archivos disponibles en el negocio: ${JSON.stringify(availableFiles)}. 
Extrae los datos requeridos de la conversación. Si faltan datos vitales, pon actionType en NONE y usa responseToUser para preguntarlos.`;

        const workOrder = await jsonExtractorModel.invoke([
            new SystemMessage(systemPrompt),
            ...trimMessagesForModel(state.messages as BaseMessage[])
        ]);

        if (workOrder.actionType !== "NONE") {
            console.log("💾 [ACTION NODE] Ejecutando guardado físico...");
            try {
                await processExcelWorkOrder(businessId, workOrder);
            } catch (e) {
                return { isTaskComplete: true, messages: [new AIMessage("Lo siento, hubo un problema técnico al guardar la información.")] };
            }
        }

        return {
            isTaskComplete: true,
            messages: [new AIMessage(workOrder.responseToUser)]
        };
    };

    const plannerNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const recentConversation = getRecentConversationText(state.messages as BaseMessage[]);

        // Si el estado de extracción está activo, seguimos la misma ruta
        if (state.extractionState && ["ASK_TIME", "ASK_PEOPLE", "ASK_NAME", "CONFIRMED"].includes(state.extractionState.status)) {
             return { currentPlan: "EXTRAER_DATOS" };
        }

        const availableFiles = await ensureAvailableFiles(state);

        const systemPrompt = `Eres el Cerebro del sistema. Tu trabajo NO es usar herramientas ni hablar con el usuario aún. 
Analiza la conversación reciente y redacta un plan de acción estricto para tu Obrero. 
Si el usuario hace una pregunta general y requiere RAG o herramientas, elabora un plan indicando qué herramienta usar o sobre qué tema consultar. 
Si no se necesitan herramientas ni RAG (ej. solo es un saludo), escribe exactamente: RESPONDER_DIRECTO.
Si el usuario quiere modificar, guardar, agendar algo en un excel / tabla / hoja de calculo (ej: "anota una reserva", "guarda esta venta"), escribe exactamente: ACCION_EXCEL.
Si el usuario quiere iniciar una reserva de mesa/cita, O SI LA CONVERSACIÓN ACTUAL ESTÁ EN MEDIO DE RECOLECTAR DATOS (ej. respondiendo día, hora, personas, nombre), escribe exactamente: EXTRAER_DATOS.`;

        const reply = await brainModel.invoke([
            new SystemMessage(systemPrompt),
            ...trimMessagesForModel(state.messages as BaseMessage[])
        ]);

        const plan = normalizeMessageContent((reply as any)?.content);
        return {
            currentPlan: plan,
            availableFiles
        };
    };

    const workerNode = async (state: AgentGraphStateType) => {
        const availableFiles = await ensureAvailableFiles(state);
        const availableFilesText = availableFiles.length
            ? JSON.stringify(availableFiles.slice(0, 20), null, 2)
            : "[]";

        const toolPrompt = `Eres un Obrero ejecutor. Sigue EXACTAMENTE este plan: ${state.currentPlan}. 
Ejecuta las herramientas necesarias y devuelve el resultado en texto plano. No agregues saludos ni comentarios.
El negocio tiene estos archivos u hojas de cálculo disponibles para consulta/edición:
${availableFilesText}

SI LA TAREA ES EDITAR UN ARCHIVO, DEBES LLAMAR A LA HERRAMIENTA AHORA MISMO CON LOS PARÁMETROS ADECUADOS.`;

        let resultText = "No result";
        try {
            const invokeMessages = [
                new SystemMessage(toolPrompt),
                ...trimMessagesForModel(state.messages as BaseMessage[])
            ];

            const modelReply = await (requiredToolAgent as any).invoke(invokeMessages);

            const toolCalls = extractToolCalls(modelReply);
            if (!toolCalls.length) {
                // If it doesn't call a tool, maybe it just answered the plan
                resultText = normalizeMessageContent((modelReply as any)?.content) || "No se ejecutó herramienta.";
            } else {
                const outputs: string[] = [];
                for (const call of toolCalls) {
                    const tool = toolMap.get(call.name || "");
                    if (!tool) {
                        outputs.push(`Error: tool no encontrada (${call.name}).`);
                        continue;
                    }
                    try {
                        const res = await (tool as any).invoke(call.args || {});
                        outputs.push(typeof res === "string" ? res : JSON.stringify(res));
                    } catch (e: any) {
                        outputs.push(`Error al ejecutar ${tool.name}: ${e.message}`);
                    }
                }
                resultText = outputs.join("\n\n");
            }
        } catch (e: any) {
            resultText = `Fallo crítico: ${e.message}`;
        }

        return {
            workerResult: resultText,
            retryCount: 1
        };
    };

    const reviewerNode = async (state: AgentGraphStateType) => {
        let ragContext = "";
        try {
            const retrieval = await retrieveRagContext({ businessId, query: getLastUserMessage(state.messages as BaseMessage[]) });
            ragContext = retrieval.ragContext;
        } catch (e) {
            console.error("RAG retrieval error:", e);
        }

        const effectiveConfig = state.config || config || {};
        const reviewerPrompt = `Eres el Supervisor de Calidad y la voz final del sistema.
Revisa el plan original: ${state.currentPlan} y el resultado del obrero: ${state.workerResult}.
Contexto del negocio: ${effectiveConfig?.businessDescription || ''}
Contexto RAG:
${ragContext}

¿Cumplió con la orden del usuario? 
Si SÍ, redacta la respuesta final amigable para el usuario. IMPORTANTE: Inicia tu respuesta con 'FINAL_OK:'.
Si NO (o falló la herramienta), redacta una justificación y corrección para que el obrero lo intente de nuevo. IMPORTANTE: Inicia tu respuesta con 'FINAL_RETRY:'.`;

        const reply = await brainModel.invoke([
            new SystemMessage(reviewerPrompt),
            ...trimMessagesForModel(state.messages as BaseMessage[])
        ]);

        const content = normalizeMessageContent((reply as any)?.content);
        if (content.startsWith("FINAL_OK:") || state.retryCount >= 3) {
            let finalText = content.replace("FINAL_OK:", "").trim();
            if (content.startsWith("FINAL_RETRY:")) finalText = content.replace("FINAL_RETRY:", "").trim(); // En caso de que se pase de los reintentos
            return {
                isTaskComplete: true,
                messages: [new AIMessage(finalText)]
            };
        } else {
            return {
                isTaskComplete: false,
                currentPlan: content.replace("FINAL_RETRY:", "").trim()
            };
        }
    };

    const directResponseNode = async (state: AgentGraphStateType) => {
        const effectiveConfig = state.config || config || {};
        const reviewerPrompt = `Eres el Asistente del sistema. El usuario requiere una respuesta directa. 
Contexto del negocio: ${effectiveConfig?.businessDescription || ''}`;

        const reply = await brainModel.invoke([
            new SystemMessage(reviewerPrompt),
            ...trimMessagesForModel(state.messages as BaseMessage[])
        ]);

        return {
            isTaskComplete: true,
            messages: [new AIMessage(normalizeMessageContent((reply as any)?.content))]
        };
    };

    const routeAfterPlanner = (state: AgentGraphStateType) => {
        if (state.currentPlan === "RESPONDER_DIRECTO") return "directResponse";
        if (state.currentPlan === "ACCION_EXCEL" || state.currentPlan === "EXTRAER_DATOS") return "actionNode";
        return "workerNode";
    };

    const routeAfterReviewer = (state: AgentGraphStateType) => {
        if (state.isTaskComplete === true || state.retryCount >= 3) {
            return END;
        }
        return "workerNode";
    };

    const routeAfterAction = (state: AgentGraphStateType) => {
        if (state.isTaskComplete) return END;
        return "workerNode";
    };

    const workflow = new StateGraph(AgentGraphState)
        .addNode("plannerNode", plannerNode)
        .addNode("workerNode", workerNode)
        .addNode("reviewerNode", reviewerNode)
        .addNode("directResponse", directResponseNode)
        .addNode("actionNode", actionNode)
        .addEdge(START, "plannerNode")
        .addConditionalEdges("plannerNode", routeAfterPlanner)
        .addEdge("workerNode", "reviewerNode")
        .addConditionalEdges("reviewerNode", routeAfterReviewer)
        .addEdge("directResponse", END)
        .addConditionalEdges("actionNode", routeAfterAction);

    const checkpointer = getOptionalGraphCheckpointer();
    if (checkpointer) {
        return (workflow as any).compile({ checkpointer });
    }

    return workflow.compile();
};
