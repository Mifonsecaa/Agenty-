import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateBusinessConfig } from "@/services/ai/onboardingAgent";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, serverErrorResponse, successResponse } from "@/lib/validation/validate";
import { ingestionService } from "@/lib/rag/ingestion";
// import pdf from "pdf-parse"; // Removed in favor of require inside the function to avoid strict ESM issues with this old lib
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeAgent } from "@/services/ai/knowledgeAgent";
import { uploadKnowledgeFileToStorage } from "@/lib/storage/knowledge-files";
import { buildCanonicalMenuText, extractMenuEntries, hasMenuLikeSignals, intersectMenuEntries } from "@/lib/rag/menu-precision";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function describeImage(buffer: Buffer, mimeType: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            `Extrae texto fiel de esta imagen en ESPANOL para entrenar un agente.
PRIORIDAD: no inventar ni modificar precios.

Reglas:
1) Si es menu/lista de precios: transcribe item + precio EXACTO.
2) Conserva secciones/categorias.
3) Si un valor no es legible, marca [PRECIO_NO_LEGIBLE].
4) No deduzcas ni completes datos faltantes.
5) Devuelve texto plano estructurado (sin explicaciones largas).

Formato:
[SECCION: <nombre>]
<producto> | <precio>
`,
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: mimeType
                }
            }
        ]);
        return result.response.text();
    } catch (error) {
        console.error("Error describiendo imagen con Gemini:", error);
        return "";
    }
}

async function verifyMenuImageTranscription(buffer: Buffer, mimeType: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            `Transcribe SOLO menu con precision maxima.
Reglas:
1) Formato: "producto | precio".
2) Usa lineas "[SECCION: nombre]" para categorias.
3) No inventes, no completes, no normalices.
4) Si no se ve el precio, omite ese item.
`,
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: mimeType
                }
            }
        ]);
        return result.response.text() || "";
    } catch (error) {
        console.error("Error verificando transcripción de menú con Gemini:", error);
        return "";
    }
}

export async function POST(req: Request) {
    try {
        console.log("[Onboarding] Recibiendo solicitud de onboarding...");
        // 1. Verificamos sesión
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        let ownerDescription = "";
        let filesContent: { name: string, content: string, metadata?: any }[] = [];

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

                       // 1) Intento principal: almacenamiento persistente en Supabase Storage
                       let publicUrl: string | null = null;
                       const storageUpload = await uploadKnowledgeFileToStorage({
                           buffer,
                           fileName: file.name,
                           contentType: file.type,
                       });
                       if (storageUpload.publicUrl) {
                           publicUrl = storageUpload.publicUrl;
                       } else if (storageUpload.provider === "supabase" && storageUpload.error) {
                           console.warn(`[Onboarding] Supabase upload failed, fallback local: ${storageUpload.error}`);
                       }

                       // 2) Fallback local para desarrollo local
                       if (!publicUrl) {
                           try {
                               const uploadDir = path.join(process.cwd(), "public", "uploads");
                               await mkdir(uploadDir, { recursive: true });
                               const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
                               const filePath = path.join(uploadDir, uniqueName);
                               await writeFile(filePath, buffer);
                               publicUrl = `/uploads/${uniqueName}`;
                           } catch (fileError: any) {
                               const isReadOnlyFs =
                                   fileError?.code === "EROFS" ||
                                   String(fileError?.message || "").toLowerCase().includes("read-only file system");
                               if (!isReadOnlyFs) {
                                   throw fileError;
                               }
                               console.warn("[Onboarding] Read-only filesystem detected; file URL will be omitted.");
                           }
                       }
                       
                       let fileText = "";

                       // Detectar PDF por tipo o extensión
                       if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                           try {
                               const pdf = require("pdf-parse"); // Usar require para evitar problemas de ESM
                               const data = await pdf(buffer);
                               fileText = data.text;
                               console.log(`[Onboarding] PDF procesado: ${file.name} (${fileText.length} chars)`);
                           } catch (pdfErr) {
                               console.error(`[Onboarding] Error parseando PDF ${file.name}:`, pdfErr);
                           }
                       } else if (file.type.startsWith("image/")) {
                           // Procesar imagen con Gemini Vision
                           console.log(`[Onboarding] Procesando imagen ${file.name} con IA...`);
                           const description = await describeImage(buffer, file.type);
                           if (description) {
                               const menuEntriesPrimary = hasMenuLikeSignals(description) ? extractMenuEntries(description) : [];
                               let menuEntriesFinal = menuEntriesPrimary;

                               if (menuEntriesPrimary.length >= 3) {
                                   const verificationText = await verifyMenuImageTranscription(buffer, file.type);
                                   const menuEntriesSecondary = hasMenuLikeSignals(verificationText) ? extractMenuEntries(verificationText) : [];
                                   const intersection = intersectMenuEntries(menuEntriesPrimary, menuEntriesSecondary);
                                   if (intersection.length >= 3) {
                                       menuEntriesFinal = intersection;
                                   }
                               }

                               if (menuEntriesFinal.length >= 3) {
                                   const canonicalMenu = buildCanonicalMenuText(menuEntriesFinal);
                                   fileText = `[IMAGEN_MENU: ${file.name}]\n${canonicalMenu}`;
                               } else {
                                   fileText = `[IMAGEN: ${file.name}]\nDescripción visual: ${description}`;
                               }
                               console.log(`[Onboarding] Imagen descrita: ${description.substring(0, 50)}...`);
                           }
                       } else if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv")) {
                           fileText = buffer.toString("utf-8");
                       }

                       if (fileText && fileText.trim().length > 0) {
                           // Sanitizamos el texto
                           fileText = fileText.replace(/\0/g, '');
                           
                           // Guardamos metadata extendida
                           filesContent.push({ 
                               name: file.name, 
                               content: fileText,
                               // @ts-ignore
                               metadata: {
                                   fileUrl: publicUrl,
                                   fileType: file.type,
                                   fileName: file.name
                               }
                           });
                           
                           ownerDescription += `\n\n--- CONTENIDO DEL ARCHIVO ${file.name} (URL: ${publicUrl}) ---\n${fileText}\n--- FIN ARCHIVO ---\n`;
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

        // 6. Si hubo archivos, procesamos con AGENTE de Conocimiento
        if (filesContent.length > 0) {
            console.log(`[Onboarding] Invocando Agente de Conocimiento para ${filesContent.length} archivos...`);
            
            // Procesamiento en segundo plano (pero esperamos para demo)
            await Promise.allSettled(filesContent.map(async (file) => {
                try {
                    // 6.1. El Agente "Lee" y estructura la info
                    const structuredKnowledge = await knowledgeAgent.processDocument(file.content, file.name);
                    
                    console.log(`[Onboarding] Agente extrajo ${structuredKnowledge.items.length} items de ${file.name}`);
                    
                    // 6.2. Ingestar items estructurados
                    for (const item of structuredKnowledge.items) {
                        await ingestionService.ingestStructuredKnowledge(
                            negocio.id, 
                            item, 
                            { 
                                source: file.name, 
                                type: "agentic_extraction",
                                fileUrl: file.metadata?.fileUrl,
                                fileType: file.metadata?.fileType
                            }
                        );
                    }
                } catch (err) {
                    console.error(`[Onboarding] Error agéntico en ${file.name}, fallback a simple:`, err);
                    // Fallback: ingesta simple si falla el agente
                    await ingestionService.ingestText(
                        negocio.id, 
                        file.content, 
                        { 
                            source: file.name, 
                            type: "fallback_simple",
                             fileUrl: file.metadata?.fileUrl
                        }
                    );
                }
            }));
        }

        // 7. Respondemos éxito
        return successResponse({ business: negocio }, 201);

    } catch (error) {
        console.error("Error en la API de onboarding:", error);
        return serverErrorResponse("Error al crear el negocio");
    }
}