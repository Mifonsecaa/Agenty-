import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import { transcriptionService } from "@/services/ai/transcription";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    const body = await req.json();
    const message = body.message;
    
    // Si es un status update u otro tipo de eventos que no sea mensaje directo
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id?.toString();
    const username = message.from?.username || message.from?.first_name || "Usuario";
    
    // ---------------------------------------------------------
    // 1. Identificar Negocio y Token
    // ---------------------------------------------------------
    let business;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } });
    } else {
      // Fallback para legacy o pruebas locales sin params: Busca el primero
      business = await prisma.business.findFirst();
    }

    if (!business) {
        console.warn(`[Telegram Webhook] No se encontró el negocio (ID: ${businessId || "undefined"})`);
        // Sin token no podemos responder, así que terminamos aquí
        return NextResponse.json({ ok: true });
    }

    // Token del bot específico de este negocio o fallback a variable de entorno
    // Ahora prisma.schema tiene telegramBotToken en el modelo Business
    const TELEGRAM_BOT_TOKEN = business.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    
    if (!TELEGRAM_BOT_TOKEN) {
      console.error(`[Telegram Webhook] Business ${business.id} has no telegramBotToken and env var is missing.`);
      return NextResponse.json({ ok: true });
    }

    // ---------------------------------------------------------
    // 2. Procesar Contenido (Texto o Audio)
    // ---------------------------------------------------------
    const MAX_AUDIO_DURATION_SECONDS = 60;
    const baseText: string = message.text || "";
    const captionText: string = message.caption || "";
    
    const voice = message.voice;
    const audio = message.audio;
    const videoNote = message.video_note;

    const audioFileId: string | undefined = voice?.file_id || audio?.file_id || videoNote?.file_id;
    const audioDuration: number | undefined = voice?.duration ?? audio?.duration ?? videoNote?.duration;

    // Si no hay chatId, ni contenido válido (texto/audio), ignoramos
    if (!chatId || (!baseText && !captionText && !audioFileId)) {
      return NextResponse.json({ ok: true });
    }

    let messageText: string = baseText || captionText;

    // --- Gestión de Audio ---
    if (audioFileId) {
      console.log(`[Telegram Webhook] Audio/voice detected from ${username} (${chatId}). duration=${audioDuration ?? "unknown"}s`);

      // Chequeo de duración
      if (audioDuration !== undefined && audioDuration > MAX_AUDIO_DURATION_SECONDS) {
         // Si es muy largo, avisamos y no transcribimos
         // Necesitamos crear conversación/usuario primero para dejar rastro
         const { conversation } = await getOrCreateCustomerAndConversation(business.id, chatId, username);
         
         await prisma.message.create({
            data: { conversationId: conversation.id, role: "user", content: "[Audio demasiado largo (>60s), no procesado]" },
         });
         
         await sendTelegramMessage(chatId, "Tu nota de voz supera el límite de 60 segundos. Por favor, envía audios de hasta 1 minuto o resume tu consulta en texto.", TELEGRAM_BOT_TOKEN);
         return NextResponse.json({ ok: true });
      }

      // Transcribir
      try {
        const audioBuffer = await fetchTelegramFileBuffer(audioFileId, TELEGRAM_BOT_TOKEN);
        if (audioBuffer) {
           console.log(`[Telegram Webhook] Audio file downloaded (${audioBuffer.byteLength} bytes). Transcribing...`);
           const transcription = await transcriptionService.transcribeAudio(audioBuffer);
           if (transcription) {
             const block = `[NOTA DE VOZ DEL CLIENTE]: ${transcription}`;
             messageText = messageText ? `${messageText}\n\n${block}` : block;
             console.log(`[Telegram Webhook] Audio transcribed: "${messageText}"`);
           } else {
             messageText = messageText || "[Audio ininteligible]";
             console.warn("[Telegram Webhook] Empty transcription result.");
           }
        } else {
           messageText = messageText || "[Error descargando audio]";
           console.error("[Telegram Webhook] Could not download audio file.");
        }
      } catch (err) {
        console.error("[Telegram Webhook] Audio processing error:", err);
        messageText = messageText || "[Error procesando audio]";
      }
    }

    console.log(`[Telegram Webhook] Final User Message from ${username}: ${messageText}`);

    // ---------------------------------------------------------
    // 3. Crear / Actualizar Usuario y Conversación
    // ---------------------------------------------------------
    const { conversation } = await getOrCreateCustomerAndConversation(business.id, chatId, username);

    // Guardar mensaje del usuario
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: messageText,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // ---------------------------------------------------------
    // 4. Generar Respuesta IA
    // ---------------------------------------------------------
    // Enviamos "Escribiendo..." para dar feedback inmediato
    await sendTelegramTyping(chatId, TELEGRAM_BOT_TOKEN);

    console.log(`[Telegram Webhook] Generating AI response for business ${business.id}...`);
    const aiReply = await aiService.generateResponse(business.id, [
      { role: "user", content: messageText },
    ]);

    const replyText = aiReply || "Lo siento, tuve un problema interno procesando tu mensaje.";

    // Guardar respuesta del agente
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "agent",
        content: replyText,
      },
    });

    // ---------------------------------------------------------
    // 5. Enviar Respuesta
    // ---------------------------------------------------------
    console.log(`[Telegram Webhook] Sending reply to ${chatId}: ${replyText}`);
    await sendTelegramMessage(chatId, replyText, TELEGRAM_BOT_TOKEN);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Fatal Error:", error);
    // Siempre devolvemos 200 OK a Telegram para evitar reintentos infinitos en caso de error lógico
    return NextResponse.json({ ok: true });
  }
}

// =========================================================================================
// Helpers Internos
// =========================================================================================

async function getOrCreateCustomerAndConversation(businessId: string, chatId: string, username: string) {
    let customer = await prisma.customer.findUnique({ where: { phone: chatId } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { phone: chatId, name: username },
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        businessId,
        customerId: customer.id,
        status: { not: "RESOLVED" },
        channel: "TELEGRAM",
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId,
          customerId: customer.id,
          channel: "TELEGRAM",
          status: "ACTIVE",
        },
      });
    }
    return { customer, conversation };
}


async function sendTelegramMessage(chatId: string, text: string, token: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    
    if (!res.ok) {
        const errData = await res.json();
        console.error(`[Telegram Send] Failed: ${res.status} ${res.statusText}`, errData);
    }
  } catch(e) { 
      console.error("[Telegram Send] Network error", e); 
  }
}

async function sendTelegramTyping(chatId: string, token: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });
  } catch(e) {}
}

async function fetchTelegramFileBuffer(fileId: string, token: string): Promise<Buffer | null> {
  try {
    // 1) Obtener ruta del archivo
    const getFileUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
    const getFileRes = await fetch(getFileUrl);
    if (!getFileRes.ok) {
        console.error(`[Telegram Fetch] getFile failed: ${getFileRes.status}`);
        return null;
    }

    const fileData: any = await getFileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) {
        console.error(`[Telegram Fetch] Invalid file data`, fileData);
        return null;
    }

    const filePath: string = fileData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // 2) Descargar binario
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
        console.error(`[Telegram Fetch] Download failed: ${fileRes.status}`);
        return null;
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[Telegram Fetch] Error:", error);
    return null;
  }
}

