// ... (importaciones)
import { handleIncomingMessage } from "@/services/agent-execution";

export async function POST(request: Request) {
  // ... (código para obtener el texto del usuario)

  // Simula una llamada desde la plataforma "demo"
  const response = await handleIncomingMessage({
    platform: 'demo', // Plataforma simulada
    text: userMessage,
    contactId: 'user_demo_123',
    businessId: 'business_demo_123', // Podrías obtenerlo de la BD
  });

  // Devuelve la respuesta de la IA al frontend de la demo
  return NextResponse.json({ role: 'assistant', content: response.aiText });
}