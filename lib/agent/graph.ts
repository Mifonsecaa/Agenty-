import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { createBookingTool } from "../tools/booking-tool";
import { createKnowledgeTool, createSpreadsheetUpdateTool } from "../tools/knowledge-tool";
import { ragModel, supervisorModel, toolModel } from "@/lib/ai";

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

function trimMessagesForModel(messages: BaseMessage[]) {
    const maxMessages = Math.max(4, Math.min(16, AGENT_MAX_HISTORY_MESSAGES));
    if (messages.length <= maxMessages) return messages;
    return messages.slice(-maxMessages);
}

function parseRoute(raw: string): "rag_agent" | "tool_agent" {
    const value = String(raw || "").trim().toLowerCase();
    return value.includes("tool_agent") ? "tool_agent" : "rag_agent";
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
    const boundToolModel = (toolModel as any).bindTools(tools, { tool_choice: "auto" });

    const supervisorNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const routerPrompt =
            "Eres un enrutador de tareas. NUNCA respondas al usuario directamente. " +
            "Si el usuario hace una pregunta o pide informacion, devuelve 'rag_agent'. " +
            "Si el usuario pide agendar, modificar, guardar o crear un registro en un documento, devuelve 'tool_agent'. " +
            "Responde unicamente con el nombre exacto del nodo en formato texto.";

        const routeReply = await supervisorModel.invoke([
            new SystemMessage(routerPrompt),
            new HumanMessage(lastUserMessage || "saludo"),
        ]);

        const nextNode = parseRoute(normalizeMessageContent((routeReply as any)?.content));
        return { nextNode };
    };

    const toolNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const toolPrompt =
            "Eres un automata de bases de datos. PROHIBIDO generar texto conversacional o saludos. " +
            "Ejecuta la herramienta requerida con los datos proporcionados por el usuario. " +
            "NUNCA digas 'voy a revisar' o 'espera un momento'. " +
            "Si faltan datos criticos, usa la herramienta mas adecuada para listar opciones y devolver evidencia tecnica.";

        try {
            const modelReply = await boundToolModel.invoke([
                new SystemMessage(toolPrompt),
                new HumanMessage(lastUserMessage),
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
            "Si el estado contiene un toolResult, informale al usuario de forma natural que la accion se completo o si hubo error.",
            "NUNCA digas 'espera un momento', 'voy a revisar' o similares.",
            "Si el usuario responde con una afirmacion corta (si, ok, dale), asume el contexto del mensaje anterior.",
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

        const text = normalizeMessageContent((response as any)?.content) || "Lo siento, no tengo esa informacion especifica en mis registros";
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
