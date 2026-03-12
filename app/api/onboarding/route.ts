import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateBusinessConfig } from "@/services/ai/onboardingAgent";

export async function POST(req: Request) {
    try {
        // 1. Verificamos sesión
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        // 2. Recibimos texto
        const { ownerDescription } = await req.json();
        if (!ownerDescription) {
            return NextResponse.json({ error: "El texto está vacío." }, { status: 400 });
        }

        // 3. Pasamos texto a la IA
        const aiConfig = await generateBusinessConfig(ownerDescription);

        // 4. Buscamos al usuario o lo creamos si no existe (El parche inteligente)
        let user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || "Dueño del Negocio",
                }
            });
        }

        // 5. Guardamos el nuevo negocio en PostgreSQL garantizando persistencia múltiple
        const negocio = await prisma.business.create({
            data: {
                name: aiConfig.businessName || "Negocio Nuevo",
                config: aiConfig as any,
                userId: user.id
            }
        });

        // 6. Respondemos éxito
        return NextResponse.json({ success: true, business: negocio });

    } catch (error) {
        console.error("Error en la API de onboarding:", error);
        return NextResponse.json({ error: "Error interno del servidor al crear el negocio." }, { status: 500 });
    }
}