import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <-- RUTA CORREGIDA
import OpenAI from 'openai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

const formatHistoryForGemini = (messages: { role: string, content: string }[]): Content[] => {
  let processedMessages = [...messages];
  if (processedMessages.length > 0 && processedMessages[0].role === 'assistant') {
    processedMessages.shift();
  }
  return processedMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, provider, isDemo, demoContext } = body;

    if (!messages || !provider) {
      return new NextResponse('Faltan mensajes o el proveedor', { status: 400 });
    }

    let systemPrompt = "Eres un asistente de IA genérico. Sé amable y servicial.";

    // Lógica para la Demo Pública vs. Agentes Privados
    if (isDemo) {
      if (demoContext && demoContext.trim().length > 0) {
        systemPrompt = `
        Eres un asistente virtual experto en ventas y atención al cliente. 
        El usuario te está poniendo a prueba simulando el siguiente negocio:
        "${demoContext}"
        
        REGLAS DE LA PRUEBA VIRTUAL:
        - Asume ESTA personalidad inmediatamente.
        - Responde natural, súper amable y MUY corto (máximo 2-3 oraciones breves).
        - Nunca digas que eres AgentyBot, ahora eres el negocio.
        `;
      } else {
        systemPrompt = `
        Eres 'AgentyBot', el asistente virtual experto de ventas para Agenty.ai.
        Tu misión es convencer a emprendedores y dueños de negocio de que Agenty es la solución definitiva para automatizar sus reservas y atención al cliente en WhatsApp.
        
        REGLAS:
        - Responde corto, máximo 2 o 3 oraciones.
        - Sé ultra amable, usa emojis modernos (✨, 🚀, 🤖).
        - Si preguntan precios, diles que empiecen totalmente GRATIS.
        - Muéstrales cómo tú mismo (AgentyBot) eres prueba de que funciona, conversando de forma natural.
        - Termina los mensajes invitándolos a registrarse y "crear su primer agente".
        `;
      }
    }

    // Lógica para el Playground del Dashboard (No Demo)
    if (!isDemo) {
      // Intentar encontrar el negocio específico (o el primero por defecto para single-user setups)
      // Idealmente, deberíamos pasar el ID del negocio en el cuerpo del request desde el frontend
      const business = await prisma.business.findFirst();
      
      if (!business) {
        return new NextResponse(JSON.stringify({ error: "No se encontró ningún negocio configurado." }), { status: 404 });
      }

      // Usar aiService que ahora implementa el Agente con Herramientas (RAG)
      const { aiService } = await import("@/lib/ai");
      
      // Filtrar mensajes de sistema si vienen del frontend, ya que el agente maneja su propio prompt
      const userMessages = messages.filter((m: any) => m.role !== 'system');
      
      console.log(`[API Chat] Delegando al Agente (Business ID: ${business.id})...`);
      const responseContent = await aiService.generateResponse(business.id, userMessages);
      
      return NextResponse.json({
        role: 'assistant',
        content: responseContent
      });
    }

    // --- LÓGICA DE DEMO (Sin persistencia / RAG) ---
    // Mantenemos la lógica simple para la demo pública que usa contexto efímero
    // ...
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) throw new Error("Falta la clave de API de OpenAI.");

      const payloadMessages = isDemo
        ? [{ role: 'system', content: systemPrompt }, ...finalMessages]
        // If NOT demo (e.g. Builder), the Builder ALREADY injects {role: 'system', content: ...} as the first message
        // To avoid duplicating system prompts and confusing OpenAI, we just pass the messages as-is if the first is 'system'.
        : (finalMessages[0]?.role === 'system' ? finalMessages : [{ role: 'system', content: systemPrompt }, ...finalMessages]);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 150,
      });
      aiResponse = response.choices[0].message;
    }
    else if (provider === 'github') {
      const token = process.env.GITHUB_TOKEN;
      if (!token) throw new Error("Falta la clave de API de GitHub (GITHUB_TOKEN).");

      const client = new OpenAI({
        baseURL: "https://models.inference.ai.azure.com",
        apiKey: token
      });

      const payloadMessages = isDemo
          ? [{ role: 'system', content: systemPrompt }, ...finalMessages]
          : (finalMessages[0]?.role === 'system' ? finalMessages : [{ role: 'system', content: systemPrompt }, ...finalMessages]);

      const response = await client.chat.completions.create({
        messages: payloadMessages,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 150
      });

      aiResponse = response.choices[0].message;
    }
    else if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) throw new Error("Falta la clave de API de Gemini.");
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const history = formatHistoryForGemini(finalMessages);
      const lastMessage = history.pop();
      const chat = model.startChat({
        history: history,
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
      });
      const result = await chat.sendMessage(lastMessage?.parts[0].text || '');
      aiResponse = { role: 'assistant', content: result.response.text() };
    }
    else {
      throw new Error("Proveedor de IA no válido.");
    }

    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error('Error en la API de chat:', error.message);
    return new NextResponse(JSON.stringify({ error: `Error del servidor: ${error.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
