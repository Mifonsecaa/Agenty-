import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateBusinessConfig } from "@/services/ai/onboardingAgent";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";

export async function POST(req: Request) {
    try {
        // 1. Verificamos sesión
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        // 2. Recibimos y validamos texto
        const body = await req.json();
        const validation = validateData<OnboardingInput>(body, onboardingSchema);
        
        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }

        const { ownerDescription } = validation.data!;

        // 3. Pasamos texto a la IA
        const aiConfig = await generateBusinessConfig(ownerDescription);

        // 4. Buscamos al usuario o lo creamos si no existe
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

        // 5. Guardamos el nuevo negocio en PostgreSQL
        const negocio = await prisma.business.create({
            data: {
                name: aiConfig.businessName || "Negocio Nuevo",
                config: aiConfig as any,
                userId: user.id
            }
        });

        // 6. Respondemos éxito
        return successResponse({ business: negocio }, 201);

    } catch (error) {
        console.error("Error en la API de onboarding:", error);
        return serverErrorResponse("Error al crear el negocio");
    }
}