import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { aiService } from '@/lib/ai';
import type { ChatMessage } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

type Provider = 'openai' | 'github' | 'gemini';

type IncomingMessage = {
  role: string;
  content: string;
};

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
  try {
    const body = await request.json();
    const {
      messages,
      provider = 'openai',
      isDemo = false,
      demoContext = '',
      agentId,
      systemPrompt,
    } = body as {
      messages: IncomingMessage[];
      provider?: Provider;
      isDemo?: boolean;
      demoContext?: string;
      agentId?: string;
      systemPrompt?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Faltan mensajes' }, { status: 400 });
    }

    const normalizedMessages = normalizeMessages(messages);
    if (normalizedMessages.length === 0) {
      return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 });
    }

    if (isDemo) {
      let demoSystemPrompt =
        "Eres 'AgentyBot', el asistente virtual experto de ventas para Agenty.ai. Responde corto, útil y amigable.";

      if (demoContext?.trim()) {
        demoSystemPrompt = `Eres un asistente virtual experto en atención al cliente. Actúa como este negocio: \"${demoContext}\". Responde en 2-3 oraciones, natural y directo.`;
      }

      const content = await generateDemoReply(normalizedMessages, provider, demoSystemPrompt);
      return NextResponse.json({ role: 'assistant', content });
    }

    // Playground privado: siempre requiere sesión y agentId explícito para alinear test mode al agente activo.
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'agentId es requerido en modo privado' }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: {
        id: agentId,
        user: { email: session.user.email },
      },
      select: { id: true, name: true, config: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado o sin acceso' }, { status: 404 });
    }

    const conversationMessages = normalizedMessages.filter((m) => m.role !== 'system');
    const content = await aiService.generateResponse(business.id, conversationMessages, {
      provider,
      systemPrompt,
    });

    return NextResponse.json({ role: 'assistant', content });
  } catch (error: any) {
    console.error('[API Chat] Error:', error);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'desconocido'}` }, { status: 500 });
  }
}
