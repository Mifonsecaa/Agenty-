import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { aiService } from '@/lib/ai';
import type { ChatMessage } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { authorizeBusinessAccessSession } from '@/lib/auth';
import { acquireConcurrencySlot, buildRequesterKey, checkRateLimit } from '@/lib/security/traffic-control';
import { incrementOpsCounter, recordOpsDuration } from '@/lib/observability/ops-metrics';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

type Provider = 'openai' | 'github' | 'gemini';

type IncomingMessage = {
  role: string;
  content: string;
};

const STREAM_CHUNK_SIZE = Math.max(8, Number(process.env.CHAT_STREAM_CHUNK_SIZE || 64));
const STREAM_DELAY_MS = Math.max(0, Number(process.env.CHAT_STREAM_DELAY_MS || 0));

function normalizeProvider(value: unknown): Provider {
  return value === 'openai' || value === 'github' || value === 'gemini' ? value : 'openai';
}

function okAssistantResponse(content: string, stream: boolean) {
  if (stream) {
    return new Response(streamTextResponse(content || ''), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  return NextResponse.json({ role: 'assistant', content });
}

function streamTextResponse(text: string) {
  const encoder = new TextEncoder();
  const safeText = text || '';

  // Fixed-size chunking is cheaper than regex splitting on large responses.
  const chunks: string[] = [];
  for (let i = 0; i < safeText.length; i += STREAM_CHUNK_SIZE) {
    chunks.push(safeText.slice(i, i + STREAM_CHUNK_SIZE));
  }
  if (chunks.length === 0) {
    chunks.push('');
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', delta: chunk })}\n\n`));
        if (STREAM_DELAY_MS > 0) {
          await new Promise((resolve) => setTimeout(resolve, STREAM_DELAY_MS));
        }
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      controller.close();
    },
  });
}

function normalizeMessages(messages: IncomingMessage[]): ChatMessage[] {
  return messages
    .filter((m) => ['user', 'assistant', 'system'].includes(m.role))
    .map((m) => ({ role: m.role as ChatMessage['role'], content: m.content }));
}

async function generateDemoReply(messages: ChatMessage[], provider: Provider, systemPrompt: string) {
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  if (provider === 'openai') {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...nonSystemMessages],
      temperature: 0.7,
      max_tokens: 180,
    });
    return response.choices[0].message.content || 'No pude generar una respuesta.';
  }

  if (provider === 'github') {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('Falta GITHUB_TOKEN');

    const client = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: token,
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...nonSystemMessages],
      temperature: 0.7,
      max_tokens: 220,
    });
    return response.choices[0].message.content || 'No pude generar una respuesta.';
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const history = nonSystemMessages.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
  const lastMessage = nonSystemMessages[nonSystemMessages.length - 1]?.content || '';
  const chat = model.startChat({
    history,
    systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
    generationConfig: { maxOutputTokens: 220, temperature: 0.7 },
  });
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let releaseConcurrency: (() => void) | null = null;
  try {
    const requesterKey = buildRequesterKey(request);

    // Apply traffic control before parsing body to reduce work on abusive bursts.
    const rate = await checkRateLimit({
      scope: 'api-chat',
      key: requesterKey,
      maxRequests: Number(process.env.CHAT_RATE_LIMIT_MAX || 30),
      windowMs: Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60000),
    });

    if (!rate.allowed) {
      incrementOpsCounter('chat.rate_limited');
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const {
      messages,
      provider: rawProvider = 'openai',
      isDemo = false,
      demoContext = '',
      agentId,
      systemPrompt,
      stream = false,
    } = body as {
      messages: IncomingMessage[];
      provider?: Provider;
      isDemo?: boolean;
      demoContext?: string;
      agentId?: string;
      systemPrompt?: string;
      stream?: boolean;
    };
    const provider = normalizeProvider(rawProvider);

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Faltan mensajes' }, { status: 400 });
    }

    const normalizedMessages = normalizeMessages(messages);
    if (normalizedMessages.length === 0) {
      return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 });
    }

    if (isDemo) {
      const demoConcurrency = await acquireConcurrencySlot({
        scope: 'api-chat-demo',
        key: requesterKey,
        maxConcurrent: Number(process.env.CHAT_DEMO_MAX_CONCURRENT || 2),
      });

      if (!demoConcurrency) {
        incrementOpsCounter('chat.concurrency_rejected.demo');
        return NextResponse.json({ error: 'Servidor ocupado. Intenta nuevamente.' }, { status: 503 });
      }
      releaseConcurrency = demoConcurrency;

      let demoSystemPrompt =
        "Eres 'brainiaBot', el asistente virtual experto de ventas para brainia. Responde corto, útil y amigable.";

      if (demoContext?.trim()) {
        demoSystemPrompt = `Eres un asistente virtual experto en atención al cliente. Actúa como este negocio: \"${demoContext}\". Responde en 2-3 oraciones, natural y directo.`;
      }

      const content = await generateDemoReply(normalizedMessages, provider, demoSystemPrompt);
      incrementOpsCounter('chat.success');
      recordOpsDuration('chat.latency_ms', Date.now() - startedAt);
      return okAssistantResponse(content, stream);
    }

    // Playground privado: siempre requiere sesión y agentId explícito para alinear test mode al agente activo.
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'agentId es requerido en modo privado' }, { status: 400 });
    }

    const privateConcurrency = await acquireConcurrencySlot({
      scope: 'api-chat-agent',
      key: `${agentId}:${requesterKey}`,
      maxConcurrent: Number(process.env.CHAT_AGENT_MAX_CONCURRENT || 2),
    });

    if (!privateConcurrency) {
      incrementOpsCounter('chat.concurrency_rejected.private');
      return NextResponse.json({ error: 'Servidor ocupado. Intenta nuevamente.' }, { status: 503 });
    }
    releaseConcurrency = privateConcurrency;

    try {
      await authorizeBusinessAccessSession(session, agentId);
    } catch (authErr: any) {
      return NextResponse.json({ error: authErr.message || 'Negocio no encontrado o sin acceso' }, { status: authErr.status || 403 });
    }

    const conversationMessages = normalizedMessages.filter((m) => m.role !== 'system');
    // Use agentId (validated earlier) instead of referencing `business` to avoid
    // potential scope issues during compilation.
    const content = await aiService.generateResponse(agentId as string, conversationMessages, {
      provider,
      systemPrompt,
    });

    incrementOpsCounter('chat.success');
    recordOpsDuration('chat.latency_ms', Date.now() - startedAt);
    return okAssistantResponse(content || '', stream);
  } catch (error: any) {
    console.error('[API Chat] Error:', error);
    incrementOpsCounter('chat.error');
    recordOpsDuration('chat.error_latency_ms', Date.now() - startedAt);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'desconocido'}` }, { status: 500 });
  } finally {
    releaseConcurrency?.();
  }
}
