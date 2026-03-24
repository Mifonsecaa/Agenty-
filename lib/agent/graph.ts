import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage } from "@langchain/core/messages";
import { AgentState, AgentStateType } from "./state";
import { createKnowledgeTool, createSpreadsheetUpdateTool } from "../tools/knowledge-tool";
import { createBookingTool } from "../tools/booking-tool";
import { SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";

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
        }).bindTools(tools);
    } else if (provider === "github" && process.env.GITHUB_TOKEN) {
        // GitHub Models (via Azure AI Inference)
        model = new ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.7,
            configuration: {
                baseURL: "https://models.inference.ai.azure.com",
                apiKey: process.env.GITHUB_TOKEN
            }
        }).bindTools(tools);
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
        let ragContext = "";
        let availableFiles: Array<{ url: string; description: string }> = [];

        if (lastUserMessage) {
            try {
                const retrieval = await retrieveRagContext({ businessId, query: lastUserMessage });
                ragContext = retrieval.ragContext;
                availableFiles = retrieval.availableFiles;
            } catch (error) {
                console.error("[AgentGraph] RAG retrieval error:", error);
            }
        }

        // System Prompt dinámico
        let systemPrompt = config?.systemPrompt ||
            `Eres un asistente experto para ${businessName}. Sé amable y conciso.
       Utiliza tus herramientas si necesitas datos específicos sobre productos o políticas.`;

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
            `\n- Si el usuario pide actualizar catalogo, precios o celdas de un .xlsm/.xlsx, usa action="LIST" y luego action="UPDATE_CELL".` +
            `\n- Si el usuario pide leer valores exactos o confirmar precios, usa action="READ_CELL".` +
            `\n- Si el usuario pide agregar nuevos registros, usa action="APPEND_ROW".` +
            `\n- Pide confirmacion breve del archivo, hoja y celda antes de modificar si hay ambiguedad.`;

        if (ragContext) {
            systemPrompt += `\n\nINFORMACION RELEVANTE DE LA BASE DE CONOCIMIENTO (RAG):\n${ragContext}`;
        }

        if (availableFiles.length > 0) {
            systemPrompt += `\n\nARCHIVOS DISPONIBLES PARA ENVIAR SI EL USUARIO LOS PIDE EXPLICITAMENTE:` +
                `\n${availableFiles.map((f) => `- ${f.description} (URL: ${f.url})`).join("\n")}` +
                `\nSi el usuario solicita ver un documento/imagen/menu, agrega [MEDIA_URL: <url>] al final de tu respuesta.`;
        }

        systemPrompt += "\n\nREGLA CRITICA: nunca inventes precios, horarios, stock o condiciones comerciales. " +
            "Si no hay dato confirmado en la base de conocimiento, dilo explicitamente y ofrece verificarlo.";

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            ...messages
        ]);

        return { messages: [response] };
    };

    // 4. Lógica de decisión: ¿Seguimos a las herramientas o terminamos?
    const shouldContinue = (state: AgentStateType) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage.additional_kwargs?.tool_calls || (lastMessage as any).tool_calls?.length > 0) {
            return "tools";
        }
        return END;
    };

    // 5. Construir el Grafo
    const workflow = new StateGraph(AgentState)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge(START, "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent"); // Vuelve al agente después de usar la herramienta

    return workflow.compile();
};
