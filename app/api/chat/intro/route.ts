import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscamos el primer negocio en la base de datos
    const business = await prisma.business.findFirst();

    let introMessage = "¡Hola! Soy el asistente de IA de brainia. Como no hay un negocio configurado en la base de datos, simularé ser un asistente para un restaurante llamado 'La Brasserie Cósmica'. ¿En qué puedo ayudarte?";

    if (business && business.config) {
      const config = business.config as any;
      const businessName = config.name || 'tu negocio';
      const businessDescription = config.systemPrompt || `Soy un asistente virtual para ${businessName}.`;

      // Creamos un saludo personalizado y contextual
      introMessage = `¡Hola! Soy el asistente virtual de ${businessName}. ${businessDescription} ¿Cómo puedo ayudarte hoy?`;
    }

    // Devolvemos solo el mensaje de introducción
    return NextResponse.json({ introMessage });

  } catch (error: any) {
    console.error('Error al generar la introducción:', error.message);
    return new NextResponse(
      JSON.stringify({ error: `Error del servidor: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
