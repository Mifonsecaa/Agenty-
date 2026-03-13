import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateBusinessConfig } from "@/services/ai/onboardingAgent";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";
import { ingestionService } from "@/lib/rag/ingestion";
// import pdf from "pdf-parse"; // Removed in favor of require inside the function to avoid strict ESM issues with this old lib

export async function POST(req: Request) {
    try {
        console.log("[Onboarding] Recibiendo solicitud de onboarding...");
        // 1. Verificamos sesión
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        let ownerDescription = "";
        let filesContent: { name: string, content: string }[] = [];

        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            ownerDescription = formData.get("ownerDescription") as string || "";

            const files = formData.getAll("files") as File[];
            if (files && files.length > 0) {
               for (const file of files) {
                   try {
                       const arrayBuffer = await file.arrayBuffer();
                       const buffer = Buffer.from(arrayBuffer);
                       let fileText = "";

                       // Detectar PDF por tipo o extensión
                       if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                           try {
                               const pdf = require("pdf-parse"); // Usar require para evitar problemas de ESM con esta librería legacy
                               const data = await pdf(buffer);
                               fileText = data.text;
                               console.log(`[Onboarding] PDF procesado: ${file.name} (${fileText.length} chars)`);
                           } catch (pdfErr) {
                               console.error(`[Onboarding] Error parseando PDF ${file.name}:`, pdfErr);
                           }
                       } else if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv")) {
                           fileText = buffer.toString("utf-8");
                       }

                       if (fileText && fileText.trim().length > 0) {
                           // Sanitizamos el texto para evitar errores de Postgres
                           fileText = fileText.replace(/\0/g, '');
                           filesContent.push({ name: file.name, content: fileText });
                           ownerDescription += `\n\n--- CONTENIDO DEL ARCHIVO ${file.name} ---\n${fileText}\n--- FIN ARCHIVO ---\n`;
                       } else {
                           console.warn(`[Onboarding] Archivo ${file.name} vacío o no procesado correctamente.`);
                       }
                   } catch (err) {
                       console.error("Error reading file:", err);
                   }
               }
            }
        } else {
            // 2. Recibimos y validamos texto (JSON legacy)
            const body = await req.json();
            if (body.ownerDescription) {
                ownerDescription = body.ownerDescription;
            }
        }

        const validation = validateData<OnboardingInput>({ ownerDescription }, onboardingSchema);
        
        if (!validation.success) {
            return validationErrorResponse(validation.errors!);
        }


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

        // 6. Si hubo archivos, los procesamos e insertamos en la BD Vectorial
        if (filesContent.length > 0) {
            console.log(`[Onboarding] Ingestando ${filesContent.length} archivos para el negocio ${negocio.id}...`);
            // Hacemos esto asíncrono pero no bloqueamos la respuesta necesariamente si tarda mucho,
            // aunque para onboarding es mejor esperar para asegurar que el agente sepa del contenido.
            await Promise.allSettled(filesContent.map(file => 
                ingestionService.ingestText(negocio.id, file.content, { source: file.name, type: "onboarding_upload" })
            ));
        }

        // 7. Respondemos éxito
        return successResponse({ business: negocio }, 201);

    } catch (error) {
        console.error("Error en la API de onboarding:", error);
        return serverErrorResponse("Error al crear el negocio");
    }
}