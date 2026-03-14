import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, AgentStateType } from "./state";
import { createKnowledgeTool } from "../tools/knowledge-tool";
import { SystemMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const createAgentGraph = (businessId: string, businessName: string, config: any) => {
    // 1. Definir herramientas habilitadas para este agente
    const tools = [createKnowledgeTool(businessId)];
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

        // System Prompt dinámico
        const systemPrompt = config?.systemPrompt ||
            `Eres un asistente experto para ${businessName}. Sé amable y conciso. 
       Utiliza tus herramientas si necesitas datos específicos sobre productos o políticas.`;

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
