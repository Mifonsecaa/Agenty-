import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import { transcriptionService } from "@/services/ai/transcription";
import { sendTelegramMessage, sendTelegramMedia, sendTelegramTyping } from "@/services/telegram-sender";
import { extractMediaFromAgentReply } from "@/lib/media-parser";
import { callPlannerExecutor, type PlannerState } from "@/lib/planner-executor-client";
import { createSpreadsheetUpdateTool } from "@/lib/tools/knowledge-tool";
import {
  commitPlannerOperation,
  isPlannerOperationCommitted,
  loadPlannerStatePersistent,
  savePlannerStatePersistent,
} from "@/lib/planner/state-store";

const MAX_HISTORY_MESSAGES = 12;
const PLANNER_STATE_PREFIX = "[PLANNER_STATE]";

function defaultPlannerState(sessionId: string): PlannerState {
  return {
    session_id: sessionId,
    stage: "INIT",
    reservation: {},
    pending_action: "append_row",
    turn: 0,
    reask_count: 0,
    max_reasks: 2,
  };
}

async function loadPlannerState(conversationId: string, sessionId: string): Promise<PlannerState> {
  const persisted = await loadPlannerStatePersistent(conversationId, sessionId);
  return { ...defaultPlannerState(sessionId), ...persisted, session_id: sessionId };
}

async function savePlannerState(conversationId: string, state: PlannerState) {
  const sessionId = String(state.session_id || "").trim() || `telegram:unknown:${conversationId}`;
  await savePlannerStatePersistent(conversationId, sessionId, state);
}

function plannerSheetAndRef(config: unknown) {
  const cfg = (config && typeof config === "object") ? (config as Record<string, unknown>) : {};
  const sheet = typeof cfg.reservationsSheetName === "string" && cfg.reservationsSheetName.trim()
    ? cfg.reservationsSheetName.trim()
    : "Reservas";
  const fileRef = typeof cfg.reservationsFileRef === "string" && cfg.reservationsFileRef.trim()
    ? cfg.reservationsFileRef.trim()
    : undefined;

  return { sheet, fileRef };
}

function normalizeOperationId(value: unknown) {
  const text = String(value || "").trim();
  return text.slice(0, 64);
}

function isReservationFlowMessage(messageText: string, plannerState: PlannerState) {
  const normalized = String(messageText || "").toLowerCase().trim();
  const reservationKeywords = ["reserva", "reservar", "agendar", "mesa", "confirmar", "confirmo"];
  const shortConfirmations = ["si", "sí", "ok", "dale", "listo", "confirmo"];
  const stage = String(plannerState.stage || "INIT");
  const hasReservationKeyword = reservationKeywords.some((k) => normalized.includes(k));
  const isShortConfirmation = shortConfirmations.includes(normalized);
  const hasActivePlannerState = stage !== "INIT" && stage !== "DONE";

  return hasReservationKeyword || (hasActivePlannerState && isShortConfirmation) || hasActivePlannerState;
}

export async function POST(req: Request) {
  try {
    const requestOrigin = new URL(req.url).origin;
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    const body = await req.json();
    const message = body.message;
    
    // Si es un status update u otro tipo de eventos que no sea mensaje directo
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id?.toString();
    const numericChatId = Number(chatId);
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
    if (!chatId || Number.isNaN(numericChatId) || (!baseText && !captionText && !audioFileId)) {
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
         
         await sendTelegramMessage({
           botToken: TELEGRAM_BOT_TOKEN,
           chatId: numericChatId,
           text: "Tu nota de voz supera el límite de 60 segundos. Por favor, envía audios de hasta 1 minuto o resume tu consulta en texto.",
         });
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
    await sendTelegramTyping(TELEGRAM_BOT_TOKEN, numericChatId);

    const recentDbMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY_MESSAGES,
    });

    const historyForAi = recentDbMessages
      .reverse()
      .map((msg) => {
        if (msg.role === "user") {
          return { role: "user" as const, content: msg.content };
        }
        if (msg.role === "agent" || msg.role === "assistant") {
          return { role: "assistant" as const, content: msg.content };
        }
        return null;
      })
      .filter((msg): msg is { role: "user" | "assistant"; content: string } => Boolean(msg));

    console.log(`[Telegram Webhook] Generating AI response for business ${business.id} with ${historyForAi.length} history messages...`);
    let replyText: string;
    const plannerSessionId = `telegram:${business.id}:${chatId}`;
    const plannerState = await loadPlannerState(conversation.id, plannerSessionId);
    const plannerRequired = isReservationFlowMessage(messageText, plannerState);
    const plannerResult = await callPlannerExecutor({
      context: {
        channel: "telegram",
        businessId: business.id,
        userId: chatId,
        conversationId: conversation.id,
      },
      message: messageText,
      state: plannerState,
    });

    if (plannerResult) {
      await savePlannerState(conversation.id, plannerResult.state);
      replyText = plannerResult.assistant_message;

      if (plannerResult.action === "append_row") {
        const tool = createSpreadsheetUpdateTool(business.id);
        const payload = (plannerResult.tool_payload || {}) as Record<string, unknown>;
        const data = (payload.data && typeof payload.data === "object")
          ? (payload.data as Record<string, unknown>)
          : {};
        const operationId = normalizeOperationId(payload.operation_id || plannerResult.state.pending_operation_id);
        const alreadyCommitted = operationId
          ? await isPlannerOperationCommitted(conversation.id, operationId)
          : false;
        const { sheet, fileRef } = plannerSheetAndRef(business.config);
        if (operationId && alreadyCommitted) {
          replyText = `Listo ${String(data.name || "")}, tu reserva ya estaba confirmada.`.trim();
          plannerResult.state.stage = "DONE";
          plannerResult.state.pending_operation_id = null;
          plannerResult.state.critical_flow = false;
          await savePlannerState(conversation.id, plannerResult.state);
        } else {
          const rowValues = [
            String(data.date || ""),
            String(data.time || ""),
            String(data.people || ""),
            String(data.name || ""),
            String(data.notes || ""),
          ];

          const toolResult = await tool.invoke({
            action: "APPEND_ROW",
            fileRef,
            sheet,
            rowValues,
          });

          if (/^Error al guardar en el Excel|^No se pudo guardar|^Falta 'rowValues'|^No hay archivos Excel/i.test(toolResult)) {
            replyText = "Pude entender tu solicitud, pero no logré guardarla en la hoja de cálculo. Intenta nuevamente en un momento.";
          } else {
            plannerResult.state.pending_operation_id = null;
            plannerResult.state.stage = "DONE";
            plannerResult.state.critical_flow = false;
            const plannerSessionIdValue = String(plannerResult.state.session_id || plannerSessionId || "");
            if (operationId) {
              await commitPlannerOperation({
                conversationId: conversation.id,
                sessionId: plannerSessionIdValue,
                operationId,
                payload,
                nextState: plannerResult.state,
              });
            }
            await savePlannerState(conversation.id, plannerResult.state);
          }
        }
      }
    } else if (plannerRequired) {
      const stage = String(plannerState.stage || "INIT");
      if (stage === "CONFIRMATION_PENDING") {
        replyText = "Recibí tu confirmación, pero ahora mismo tengo un problema técnico para cerrar la reserva en el sistema. ¿Me confirmas nuevamente en unos segundos para finalizarla?";
      } else {
        replyText = "Estoy gestionando tu reserva, pero tengo un problema técnico temporal con el motor de reservas. Inténtalo de nuevo en unos segundos y continuaré desde el mismo punto.";
      }
      await savePlannerState(conversation.id, plannerState);
      console.warn("[Telegram Webhook] Planner required but unavailable; skipped generic LLM fallback to avoid loops.");
    } else {
      const aiReply = await aiService.generateResponse(business.id, historyForAi);
      replyText = aiReply || "Lo siento, tuve un problema interno procesando tu mensaje.";
    }

    const parsedReply = extractMediaFromAgentReply(replyText, requestOrigin);
    replyText = parsedReply.cleanText;
    const mediaUrls = parsedReply.mediaUrls;

    // Guardar respuesta del agente
    if (replyText) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "agent",
          content: replyText,
        },
      });
    }

    // ---------------------------------------------------------
    // 5. Enviar Respuesta
    // ---------------------------------------------------------
    console.log(`[Telegram Webhook] Sending reply to ${chatId}: ${replyText}`);
    if (replyText) {
      await sendTelegramMessage({
        botToken: TELEGRAM_BOT_TOKEN,
        chatId: numericChatId,
        text: replyText,
      });
    }

    for (const mediaUrl of mediaUrls) {
      const mediaResult = await sendTelegramMedia({
        botToken: TELEGRAM_BOT_TOKEN,
        chatId: numericChatId,
        mediaUrl,
        caption: "Aqui tienes el archivo.",
      });

      if (mediaResult.ok) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "agent",
            content: `[ARCHIVO ENVIADO: ${mediaUrl}]`,
          },
        });
      } else {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "system",
            content: `[ERROR ENVIO ARCHIVO TELEGRAM]: ${mediaUrl} - ${mediaResult.error || "Error desconocido"}`,
          },
        });
      }
    }

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

