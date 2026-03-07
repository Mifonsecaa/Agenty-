import { OpenAI } from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// --- Configuración de Clientes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- Prompts del Sistema ---
const systemPrompt = `
  Eres un agente de IA para Agenty.ai, especializado en gestionar reservas para "La Brasserie Cósmica".
  Tu personalidad es profesional, amable y eficiente. Guía al usuario a través del proceso de reserva:
  1. Preguntar número de personas.
  2. Preguntar fecha y hora.
  3. Preguntar un nombre para la reserva.
  4. Confirmar y finalizar.
  No te desvíes de este flujo. Sé breve.
`;

// --- Función para formatear el historial para Gemini ---
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

// --- Función Principal de la API ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, provider } = body;

    if (!messages || !provider) {
      return new NextResponse('Faltan mensajes o el proveedor', { status: 400 });
    }

    let aiResponse;

    // --- Lógica para OpenAI ---
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
    // --- Lógica para Gemini ---
    else if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) throw new Error("Falta la clave de API de Gemini.");

      // --- Modelo Estándar ---
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
        systemInstruction: {
          role: "system",
          parts: [{ text: systemPrompt }],
        },
      });
      
      const result = await chat.sendMessage(lastMessage?.parts[0].text || '');
      const response = result.response;
      
      aiResponse = { role: 'assistant', content: response.text() };
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
