import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <-- RUTA CORREGIDA

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    const { messages, provider } = body;

    if (!messages || !provider) {
      return new NextResponse('Faltan mensajes o el proveedor', { status: 400 });
    }

    const business = await prisma.business.findFirst();
    let systemPrompt = "Eres un asistente de IA genérico. Sé amable y servicial.";

    if (business && business.config) {
      const config = business.config as any;
      systemPrompt = config.systemPrompt || `Eres un asistente virtual para ${config.name || 'un negocio'}. Sé amable y conciso.`;
    }

    let aiResponse;

    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) throw new Error("Falta la clave de API de OpenAI.");
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 150,
      });
      aiResponse = response.choices[0].message;
    } 
    else if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) throw new Error("Falta la clave de API de Gemini.");
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const history = formatHistoryForGemini(messages);
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
