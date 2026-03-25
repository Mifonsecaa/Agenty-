import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage } from "@langchain/core/messages";
import { AgentState, AgentStateType } from "./state";
import { createKnowledgeTool, createSpreadsheetUpdateTool } from "../tools/knowledge-tool";
import { createBookingTool } from "../tools/booking-tool";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";

const MAX_TOOL_CALLS_PER_TURN = Number(process.env.AGENT_MAX_TOOL_CALLS_PER_TURN || 4);
const MAX_REPEATED_TOOL_CALLS = Number(process.env.AGENT_MAX_REPEATED_TOOL_CALLS || 2);
const AGENT_MAX_HISTORY_MESSAGES = Number(process.env.AGENT_MAX_HISTORY_MESSAGES || 5);
const RAG_STRICT_MIN_CONFIDENCE = Number(process.env.RAG_STRICT_MIN_CONFIDENCE || 0.62);

function normalizeMessageContent(content: unknown): string {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map((part: any) => {
                if (typeof part === "string") return part;
                if (part && typeof part === "object" && typeof part.text === "string") return part.text;
                return "";
            })
            .join(" ")
            .trim();
    }
    return "";
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

function getToolCallsFromMessage(message: any): Array<{ name?: string; args?: unknown }> {
    const rawCalls = message?.additional_kwargs?.tool_calls || message?.tool_calls || [];
    if (!Array.isArray(rawCalls)) return [];
    return rawCalls.map((call: any) => {
        const fn = call?.function || {};
        let args: unknown = fn.arguments ?? call?.args ?? {};
        if (typeof args === "string") {
            try {
                args = JSON.parse(args);
            } catch {
                // Keep raw string if it is not valid JSON.
            }
        }
        return {
            name: fn.name || call?.name,
            args,
        };
    });
}

function stableStringify(value: unknown): string {
    if (value === null || value === undefined) return String(value);
    if (typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

function signatureOfToolCalls(message: any) {
    const calls = getToolCallsFromMessage(message);
    if (!calls.length) return "";
    return calls
        .map((call) => `${call.name || "unknown"}:${stableStringify(call.args)}`)
        .join("|");
}

function getMessagesSinceLastHuman(messages: BaseMessage[]) {
    const slice: BaseMessage[] = [];
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const msg: any = messages[i];
        if (msg?.getType?.() === "human") break;
        slice.push(messages[i]);
    }
    return slice.reverse();
}

function shouldForceExitByLoop(messages: BaseMessage[]) {
    const tail = getMessagesSinceLastHuman(messages);
    const aiToolMessages = tail.filter((msg: any) => getToolCallsFromMessage(msg).length > 0);

    if (aiToolMessages.length >= Math.max(2, MAX_TOOL_CALLS_PER_TURN)) {
        return true;
    }

    const signatures = aiToolMessages
        .map((msg: any) => signatureOfToolCalls(msg))
        .filter(Boolean);

    if (!signatures.length) return false;

    const lastSignature = signatures[signatures.length - 1];
    let repeated = 1;
    for (let i = signatures.length - 2; i >= 0; i -= 1) {
        if (signatures[i] !== lastSignature) break;
        repeated += 1;
    }

    return repeated >= Math.max(2, MAX_REPEATED_TOOL_CALLS);
}

function hasToolCalls(message: any) {
    return Boolean(message?.additional_kwargs?.tool_calls || message?.tool_calls?.length > 0);
}

function hasActionableToolIntent(input: string) {
    const value = String(input || "");
    const reservationIntent = /(reserv|reserva|agendar|agenda|cita|turno|cancelar|disponibil|horario|mesa\b|personas\b)/i.test(value);
    const spreadsheetIntent = /(excel|xlsx|xlsm|hoja|celda|fila|columna|catalogo|cat[aá]logo|precio|precios|actualiza|actualizar|modifica|modificar|agrega|agregar|append_row|update_cell|read_cell|list_sheets)/i.test(value);
    return reservationIntent || spreadsheetIntent;
}

function hasStallingPhrase(message: any) {
    const text = normalizeMessageContent(message?.content || "");
    if (!text) return false;
    return /(espera\s+un\s+momento|dame\s+un\s+momento|voy\s+a\s+revisar|perm[ií]teme\s+revisar|te\s+confirmo\s+en\s+un\s+momento)/i.test(text);
}

function trimMessagesForModel(messages: BaseMessage[]) {
    const maxMessages = Math.max(4, Math.min(12, AGENT_MAX_HISTORY_MESSAGES));
    if (messages.length <= maxMessages) return messages;
    return messages.slice(-maxMessages);
}

export const createAgentGraph = (businessId: string, businessName: string, config: any, customerPhone?: string) => {
    // 1. Definir herramientas habilitadas para este agente
    const tools = [
        createKnowledgeTool(businessId),
        createSpreadsheetUpdateTool(businessId),
        // Booking requiere phone para CREATE; se inyecta desde el canal (WhatsApp/Telegram)
        createBookingTool(businessId, customerPhone),
    ];
    const toolNode = new ToolNode(tools);

    // 2. Definir el modelo (OpenAI es superior para Tool Calling)
    const provider = config?.aiProvider || "openai";
    let model: any;

    if (provider === "openai" && process.env.OPENAI_API_KEY) {
        model = new ChatOpenAI({
            modelName: "gpt-4o-mini",
            temperature: 0.7,
            streaming: false,
        }).bindTools(tools, { tool_choice: "auto" });
    } else if (provider === "github" && process.env.GITHUB_TOKEN) {
        // GitHub Models (via Azure AI Inference)
        model = new ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.7,
            configuration: {
                baseURL: "https://models.inference.ai.azure.com",
                apiKey: process.env.GITHUB_TOKEN
            }
        }).bindTools(tools, { tool_choice: "auto" });
    } else {
        // Fallback a Gemini si es necesario
        model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            temperature: 0.7,
            apiKey: process.env.GEMINI_API_KEY,
        }).bindTools(tools);
    }

    // 3. Nodo del Agente (El que piensa)
    const callModel = async (state: AgentStateType) => {
        const { messages, businessName, config } = state;
        const lastUserMessage = getLastUserMessage(messages as BaseMessage[]);
        const actionableToolIntent = hasActionableToolIntent(lastUserMessage);
        
        // 1. Revisar respuestas personalizadas (Reglas estrictas)
        if (config?.customResponses && Array.isArray(config.customResponses)) {
            for (const custom of config.customResponses) {
                if (custom.trigger && custom.response && lastUserMessage.toLowerCase().includes(custom.trigger.toLowerCase())) {
                    console.log(`[AgentGraph] Match found for custom response: ${custom.trigger}`);
                    const { AIMessage } = await import("@langchain/core/messages");
                    return { messages: [new AIMessage(custom.response)] };
                }
            }
        }

        let ragContext = "";
        let availableFiles: Array<{ url: string; description: string }> = [];
        let ragTopScore = 0;

        if (lastUserMessage) {
            try {
                const retrieval = await retrieveRagContext({ businessId, query: lastUserMessage });
                ragContext = retrieval.ragContext;
                availableFiles = retrieval.availableFiles;
                ragTopScore = retrieval.selected?.[0]?.combinedScore || 0;
            } catch (error) {
                console.error("[AgentGraph] RAG retrieval error:", error);
            }
        }

        const asksSensitiveData = /(precio|precios|costo|costos|tarifa|tarifas|valor|cu[aá]nto|horario|horarios|stock|disponible|promoci[oó]n|promo|descuento|pol[ií]tica|condiciones)/i.test(lastUserMessage);

        // Guardrail duro: si no hay evidencia de KB para preguntas sensibles, evitar respuesta inventada.
        if (asksSensitiveData && !actionableToolIntent && (!ragContext || ragTopScore < RAG_STRICT_MIN_CONFIDENCE) && availableFiles.length === 0) {
            console.log(`[AgentGraph] Guardrail triggered for sensitive data. Using handoffMessage.`);
            const { AIMessage } = await import("@langchain/core/messages");
            const handoffMsg = config?.handoffMessage || "Lo siento, no tengo esa información específica en mis registros. Dame un momento y lo verifico.";
            return { messages: [new AIMessage(handoffMsg)] };
        }

        // System Prompt dinámico
        let systemPrompt = config?.systemPrompt ||
            `Eres un asistente experto para ${businessName}. Sé amable y conciso.
       Utiliza tus herramientas si necesitas datos específicos sobre productos o políticas.`;

        if (config?.welcomeMessage) {
            systemPrompt += `\n\nAl iniciar una conversacion o saludar, tu mensaje debe ser en base a la siguiente plantilla de bienvenida: "${config.welcomeMessage}". No repitas este saludo si la conversacion ya esta en curso.`;
        }

        if (config?.customResponses && Array.isArray(config.customResponses) && config.customResponses.length > 0) {
            systemPrompt += `\n\nREGLAS ESTRICTAS DE CONVERSACION (RESPUESTAS PREDEFINIDAS):\n`;
            for (const custom of config.customResponses) {
                if (custom.trigger && custom.response) {
                    systemPrompt += `- Si el usuario dice algo relacionado o semánticamente similar a "${custom.trigger}", tu respuesta debe ser exactamente o basarse fuertemente en: "${custom.response}".\n`;
                }
            }
        }

        systemPrompt += `\n\nTienes acceso a una herramienta de reservas llamada booking_manager.\n` +
            `- Usa action="CHECK" para consultar disponibilidad en una fecha (YYYY-MM-DD).\n` +
            `- Usa action="CREATE" para crear una reserva cuando el cliente confirme fecha y hora.\n` +
            `- Usa action="CANCEL" para cancelar una reserva cuando el cliente lo solicite (por código o por fecha y hora).\n` +
            `Antes de crear, siempre verifica primero. Explica al cliente las opciones de horarios en lenguaje natural.\n` +
            `REGLAS OBLIGATORIAS DE RESERVA:\n` +
            `1) Si el usuario habla de reservar, disponibilidad, citas u horarios, DEBES usar booking_manager; no inventes horarios.\n` +
            `2) No menciones fechas pasadas ni años pasados (por ejemplo 2023) en tu respuesta final al cliente.\n` +
            `3) Si la fecha del usuario es ambigua o antigua, ofrece una alternativa próxima con fecha completa en español (ejemplo: 16 de marzo del 2026).\n` +
            `4) No confirmes una reserva sin pasar por booking_manager action="CREATE".\n` +
            `5) No confirmes una cancelación sin pasar por booking_manager action="CANCEL".` +
            `\n\nTambien tienes una herramienta de edicion Excel llamada knowledge_spreadsheet_editor.` +
            `\n- Si el usuario pide actualizar, agregar o modificar un dato de una hoja de calculo, DEBES usar knowledge_spreadsheet_editor y confirmar al usuario cuando el cambio quede hecho.` +
            `\n- Si el usuario pide actualizar catalogo, precios o celdas de un .xlsm/.xlsx, usa action="LIST" y luego action="UPDATE_CELL".` +
            `\n- Si el usuario pide leer valores exactos o confirmar precios, usa action="READ_CELL".` +
            `\n- Si el usuario pide agregar nuevos registros, usa action="APPEND_ROW".` +
            `\n- Si hay varios archivos Excel y no hay fileRef claro, NO edites. Pide al usuario que elija archivo por numero, nombre o URL.` +
            `\n- Antes de UPDATE_CELL o APPEND_ROW, asegurate de tener fileRef y sheet. Si falta alguno, pregunta primero.` +
            `\n- Pide confirmacion breve del archivo, hoja y celda antes de modificar si hay ambiguedad.`;

        systemPrompt += "\n\nREGLA ESTRICTA DE HERRAMIENTAS: NUNCA digas 'voy a revisar', 'espera un momento' o frases similares. " +
            "Si necesitas consultar disponibilidad, leer un dato o guardar una reserva, ejecuta la herramienta adecuada inmediatamente y en silencio " +
            "(booking_manager o knowledge_spreadsheet_editor). Solo responde al usuario cuando la herramienta devuelva el resultado.";

        if (ragContext) {
            systemPrompt += `\n\nINFORMACION RELEVANTE DE LA BASE DE CONOCIMIENTO (RAG):\n${ragContext}`;
        }

        systemPrompt += "\n\nPOLITICA DE GROUNDING ESTRICTO (CERO TOLERANCIA): " +
            "usa unicamente la informacion del bloque RAG y resultados de herramientas. " +
            "Si falta dato exacto o hay ambiguedad en precios, fechas, horarios, nombres o stock, responde exactamente: " +
            "'Lo siento, no tengo esa información específica en mis registros'. No uses conocimiento externo.";

        if (availableFiles.length > 0) {
            systemPrompt += `\n\nARCHIVOS DISPONIBLES PARA ENVIAR SI EL USUARIO LOS PIDE EXPLICITAMENTE:` +
                `\n${availableFiles.map((f) => `- ${f.description} (URL: ${f.url})`).join("\n")}` +
                `\nSi el usuario solicita ver un documento/imagen/menu, agrega [MEDIA_URL: <url>] al final de tu respuesta.`;
        }

        systemPrompt += "\n\nREGLA CRITICA: nunca inventes precios, horarios, stock o condiciones comerciales. " +
            "Si no hay dato confirmado en la base de conocimiento, dilo explicitamente y ofrece verificarlo.";

        const recentConversation = trimMessagesForModel(messages as BaseMessage[]);
        let response = await model.invoke([
            new SystemMessage(systemPrompt),
            ...recentConversation
        ]);

        if (actionableToolIntent && !hasToolCalls(response) && hasStallingPhrase(response)) {
            const forcedToolPrompt =
                "Debes llamar una herramienta AHORA en este turno. No respondas texto de espera. " +
                "Si es reserva usa booking_manager; si es lectura/edicion de Excel usa knowledge_spreadsheet_editor.";
            response = await model.invoke([
                new SystemMessage(`${systemPrompt}\n\n${forcedToolPrompt}`),
                ...recentConversation,
            ]);
        }

        return { messages: [response] };
    };

    // 4. Lógica de decisión: ¿Seguimos a las herramientas o terminamos?
    const shouldContinue = (state: AgentStateType) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        const messageHasToolCalls = hasToolCalls(lastMessage as any);
        if (messageHasToolCalls && shouldForceExitByLoop(messages as BaseMessage[])) {
            return "loop_guard";
        }

        if (messageHasToolCalls) {
            return "tools";
        }
        return END;
    };

    const loopGuardNode = async () => {
        return {
            messages: [
                new AIMessage(
                    "Para no darte vueltas, necesito un dato puntual para cerrar tu reserva: fecha exacta (YYYY-MM-DD o 'mañana') y hora (ej. 17:00). Si quieres, te muestro horarios disponibles primero.",
                ),
            ],
        };
    };

    // 5. Construir el Grafo
    const workflow = new StateGraph(AgentState)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addNode("loop_guard", loopGuardNode)
        .addEdge(START, "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent")
        .addEdge("loop_guard", END); // Cortamos bucle y devolvemos pregunta concreta

    return workflow.compile();
};
