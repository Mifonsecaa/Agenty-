import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { createBookingTool } from "../tools/booking-tool";
import { createKnowledgeTool, createSpreadsheetUpdateTool, listSpreadsheetFilesForBusiness } from "../tools/knowledge-tool";
import { createRequiredToolAgent, ragModel, supervisorModel } from "@/lib/ai";

const AGENT_MAX_HISTORY_MESSAGES = Number(process.env.AGENT_MAX_HISTORY_MESSAGES || 8);
let cachedGraphCheckpointer: any | undefined;

const AgentGraphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    businessId: Annotation<string>(),
    businessName: Annotation<string>(),
    config: Annotation<any>(),
    customerPhone: Annotation<string | undefined>(),
    nextNode: Annotation<"rag_agent" | "tool_agent" | "__end__" | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    toolResult: Annotation<string | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
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
    const boundToolModel = createRequiredToolAgent(tools);

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

    const supervisorNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const recentConversation = getRecentConversationText(state.messages as BaseMessage[]);
        const reservationSnapshot = extractReservationSnapshot(recentConversation, lastUserMessage);
        const reservationContextActive = isReservationIntent(recentConversation);
        const availableFiles = await ensureAvailableFiles(state);
        const routerPrompt =
            "Eres un enrutador de tareas especializado. NUNCA respondas al usuario directamente. " +
            "Responde de forma estricta ÚNICAMENTE con 'rag_agent' o 'tool_agent'.\n" +
            "REGLAS:\n" +
            "1. Si el usuario pide AGENDAR, MODIFICAR, GUARDAR, CREAR o ELIMINAR información (reservas, ventas, registros, actualizar Excel o documento), devuelve 'tool_agent'. " +
            "INCLUSO si crees que faltan datos, envíalo a 'tool_agent' para que la herramienta evalúe y exija lo faltante si es necesario.\n" +
            "2. Si el usuario simplemente está pidiendo información, saludando, o haciendo una pregunta general, devuelve 'rag_agent'.";

        if (reservationContextActive && isReservationStatusQuestion(lastUserMessage)) {
            return { nextNode: "rag_agent" as const, availableFiles };
        }

        // Ya no evitamos tool_agent con datos incompletos, delegamos en la herramienta.
        if (reservationContextActive || isSpreadsheetEditIntent(recentConversation)) {
            // Evaluamos la intencion de forma determinista o con el LLM
        }

        const routeReply = await supervisorModel.invoke([
            new SystemMessage(routerPrompt),
            new HumanMessage(lastUserMessage || "saludo"),
        ]);

        const nextNode = parseRoute(normalizeMessageContent((routeReply as any)?.content));
        return { nextNode, availableFiles };
    };

    const toolNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const recentConversation = getRecentConversationText(state.messages as BaseMessage[]);
        const reservationSnapshot = extractReservationSnapshot(recentConversation, lastUserMessage);
        const availableFiles = await ensureAvailableFiles(state);
        const availableFilesText = availableFiles.length
            ? JSON.stringify(availableFiles.slice(0, 20), null, 2)
            : "[]";
        const toolPrompt =
            "Eres un agente ejecutor de herramientas (tool_agent). PROHIBIDO generar texto conversacional o saludos. " +
            `El negocio tiene estos archivos: ${availableFilesText}. ` +
            "REGLAS ESTRICTAS:\n" +
            "1. Si el usuario pide guardar o modificar algo y no hay un archivo Excel adecuado, ACTÚA INMEDIATAMENTE usando 'knowledge_spreadsheet_editor' con action='CREATE_FILE' y un targetFileName apropiado (ej: 'ventas.xlsx', 'reservas.xlsx').\n" +
            "2. Si el archivo apropiado ya existe, usa 'knowledge_spreadsheet_editor' con action='APPEND_ROW' o 'UPDATE_CELL'. Trata de deducir las columnas de los valores requeridos.\n" +
            "3. OBLIGATORIO: Llama a la herramienta pertinente AHORA MISMO. No digas 'voy a revisar' ni pidas permiso para crear el archivo. Sólo HAZLO.\n" +
            "4. Si de verdad no entiendes qué quiere guardar, utiliza booking_manager o search si es para buscar, si no, usa cualquier herramienta disponible con parámetros vacíos para que devuelva error y el sistema le pida los datos al usuario.";

        // Si ya tenemos toda la reserva en el historial reciente, ejecutamos CREATE de forma determinista.
        if (
            isReservationIntent(recentConversation) &&
            !isReservationStatusQuestion(lastUserMessage) &&
            reservationSnapshot.name &&
            reservationSnapshot.date &&
            reservationSnapshot.time &&
            reservationSnapshot.people
        ) {
            const bookingTool = toolMap.get("booking_manager");
            if (bookingTool) {
                try {
                    const details = `Reserva para ${reservationSnapshot.people} personas a nombre de ${reservationSnapshot.name}.`;
                    const result = await bookingTool.invoke({
                        action: "CREATE",
                        date: reservationSnapshot.date,
                        time: reservationSnapshot.time,
                        details,
                    });
                    return {
                        toolResult: typeof result === "string" ? result : JSON.stringify(result),
                        nextNode: "rag_agent" as const,
                    };
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    return {
                        toolResult: `Error tecnico al ejecutar booking_manager CREATE: ${message}`,
                        nextNode: "rag_agent" as const,
                    };
                }
            }
        }

        try {
            const modelReply = await boundToolModel.invoke([
                new SystemMessage(toolPrompt),
                new HumanMessage(
                    [
                        `Ultimo mensaje del usuario: ${lastUserMessage}`,
                        "Contexto reciente de la conversacion:",
                        recentConversation,
                        "Si la tarea es reserva y ya existen nombre, fecha, hora y personas en el contexto, debes ejecutar booking_manager con action='CREATE'.",
                    ].join("\n\n"),
                ),
            ]);

            const toolCalls = extractToolCalls(modelReply);
            if (!toolCalls.length) {
                return {
                    toolResult: "Error tecnico: no se ejecuto ninguna herramienta para la solicitud.",
                    nextNode: "rag_agent" as const,
                };
            }

            const outputs: string[] = [];
            for (const call of toolCalls) {
                const tool = toolMap.get(call.name || "");
                if (!tool) {
                    outputs.push(`Error tecnico: herramienta no encontrada (${call.name || "desconocida"}).`);
                    continue;
                }

                try {
                    const result = await (tool as any).invoke(call.args || {});
                    outputs.push(typeof result === "string" ? result : JSON.stringify(result));
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    outputs.push(`Error tecnico al ejecutar ${tool.name}: ${message}`);
                }
            }

            return {
                toolResult: outputs.join("\n\n"),
                nextNode: "rag_agent" as const,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                toolResult: `Error tecnico de tool_agent: ${message}`,
                nextNode: "rag_agent" as const,
            };
        }
    };

    const ragNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const effectiveConfig = state.config || config || {};
        let ragContext = "";

        if (lastUserMessage) {
            try {
                const retrieval = await retrieveRagContext({ businessId, query: lastUserMessage });
                ragContext = retrieval.ragContext;
            } catch (error) {
                console.error("[AgentGraph] RAG retrieval error:", error);
            }
        }

        const ragSystemPrompt = [
            String(effectiveConfig?.systemPrompt || `Eres un asistente amable para ${businessName}.`),
            "Usa el [CONTEXTO RAG] para responder.",
            "Si el estado contiene un toolResult, significa que se ejecutó una acción técnica (como agendar o guardar algo en Excel). Informa al usuario natural y directamente que la accion se completó (ej. '¡Listo! He guardado tu reserva/venta'). Muestra de manera resumida qué se guardó. OBLIGATORIO: NUNCA envíes enlaces de descarga de hojas de cálculo ni muestres URLs de archivos .xlsx/.xlsm al usuario. El negocio los revisará en su visor interno.",
            "NUNCA digas 'espera un momento', 'voy a revisar' o similares.",
            "Si el usuario responde con una afirmacion corta (si, ok, dale), asume el contexto del mensaje anterior.",
            "REGLA DE IMAGENES: NUNCA inventes URLs. Si el usuario solicita ver una imagen o menu, busca en los metadatos del [CONTEXTO RAG] el campo de la URL publica. Si la URL existe, devuelvela EXACTAMENTE asi: ![Descripcion](URL). Si el contexto no incluye una URL real, responde: 'Lo siento, no tengo la imagen disponible en este momento'.",
            "Si no hay evidencia suficiente en RAG o herramientas, responde exactamente: 'Lo siento, no tengo esa informacion especifica en mis registros'.",
            ragContext ? `\n[CONTEXTO RAG]\n${ragContext}` : "\n[CONTEXTO RAG]\n(Sin resultados relevantes)",
            state.toolResult ? `\n[TOOL_RESULT]\n${state.toolResult}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const response = await ragModel.invoke([
            new SystemMessage(ragSystemPrompt),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        let text = normalizeMessageContent((response as any)?.content) || "Lo siento, no tengo esa informacion especifica en mis registros";
        if (asksForImageOrMenu(lastUserMessage)) {
            const imgUrl = extractMarkdownImageUrl(text);
            if (imgUrl && !ragContext.includes(imgUrl)) {
                text = "Lo siento, no tengo la imagen disponible en este momento";
            }
        }
        return {
            messages: [new AIMessage(text)],
            nextNode: "__end__" as const,
            toolResult: undefined,
        };
    };

    const routeAfterSupervisor = (state: AgentGraphStateType) => (state.nextNode === "tool_agent" ? "tool_agent" : "rag_agent");

    const workflow = new StateGraph(AgentGraphState)
        .addNode("supervisor", supervisorNode)
        .addNode("tool_agent", toolNode)
        .addNode("rag_agent", ragNode)
        .addEdge(START, "supervisor")
        .addConditionalEdges("supervisor", routeAfterSupervisor)
        .addEdge("tool_agent", "rag_agent")
        .addEdge("rag_agent", END);

    const checkpointer = getOptionalGraphCheckpointer();
    if (checkpointer) {
        return (workflow as any).compile({ checkpointer });
    }

    return workflow.compile();
};
