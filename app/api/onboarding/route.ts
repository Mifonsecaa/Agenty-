import { NextResponse } from "next/server";
import { generateBusinessConfig } from "../../../services/ai/onboardingAgent";
// import { prisma } from "../../../prisma/client"; // Lo conectaremos luego

export async function POST(request: Request) {
    try {
        // 1. Extraemos el texto que el dueño escribió en la página web
        const body = await request.json();
        const { ownerDescription } = body;

        if (!ownerDescription) {
            return NextResponse.json(
                { error: "La descripción del negocio es obligatoria." },
                { status: 400 }
            );
        }

        // 2. Le pasamos el texto a nuestro Agente de Onboarding
        console.log("Procesando texto con IA...");
        const businessConfig = await generateBusinessConfig(ownerDescription);

        // 3. Aquí iría el código para guardar en PostgreSQL (Prisma)
        // const newBusiness = await prisma.business.create({
        //   data: { config: businessConfig, ownerEmail: "..." }
        // });

        // 4. Devolvemos el JSON estructurado al Frontend para mostrar la confirmación
        return NextResponse.json({
            success: true,
            message: "¡Agente configurado exitosamente!",
            data: businessConfig,
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Hubo un problema al crear la configuración del agente." },
            { status: 500 }
        );
    }
}