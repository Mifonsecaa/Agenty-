import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { prisma } from "@/lib/prisma";
import { createAgentGraph } from "@/lib/agent/graph";

export type OrchestratorRole = "user" | "assistant" | "system";

export type OrchestratorInputMessage = {
  role: OrchestratorRole;
  content: string;
};

export type RunAgentOrchestratorParams = {
  businessId: string;
  channel: string;
  conversationKey: string;
  messages: OrchestratorInputMessage[];
  customerPhone?: string;
};

function toLangChainMessages(messages: OrchestratorInputMessage[]): BaseMessage[] {
  const output: BaseMessage[] = [];
  for (const msg of messages) {
    const content = String(msg.content || "").trim();
    if (!content) continue;

    if (msg.role === "user") {
      output.push(new HumanMessage(content));
      continue;
    }

    if (msg.role === "system") {
      output.push(new SystemMessage(content));
      continue;
    }

    output.push(new AIMessage(content));
  }

  return output;
}

function normalizeLastContent(raw: unknown) {
  if (typeof raw === "string") return raw;
  if (!Array.isArray(raw)) return "";

  return raw
    .map((part: any) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && typeof part.text === "string") return part.text;
      return "";
    })
    .join(" ")
    .trim();
}

export async function runAgentOrchestrator(params: RunAgentOrchestratorParams): Promise<string> {
  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: { id: true, name: true, config: true },
  });

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const history = toLangChainMessages(params.messages);
  if (!history.length) {
    return "";
  }

  const channel = String(params.channel || "chat").toLowerCase();
  const threadId = `${channel}:${business.id}:${params.conversationKey}`;

  const executor = createAgentGraph(business.id, business.name, business.config || {}, params.customerPhone);
  const result = await executor.invoke(
    {
      messages: history,
      businessId: business.id,
      businessName: business.name,
      config: business.config || {},
    },
    {
      configurable: {
        thread_id: threadId,
        sessionId: threadId,
        checkpoint_ns: `business:${business.id}`,
      },
    }
  );

  const finalMessage = Array.isArray(result?.messages)
    ? result.messages[result.messages.length - 1]
    : null;

  return normalizeLastContent(finalMessage?.content);
}
