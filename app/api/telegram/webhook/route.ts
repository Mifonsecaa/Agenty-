import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transcriptionService } from "@/services/ai/transcription";

const TELEGRAM_SEND_TIMEOUT_MS = Number(process.env.TELEGRAM_SEND_TIMEOUT_MS || 5000);
const TELEGRAM_SEND_MAX_ATTEMPTS = 2;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id?.toString();
    const updateId = body.update_id?.toString() || "no-update";
    const telegramMessageId = message.message_id?.toString() || "no-message";
    const traceId = `tg:${chatId || "no-chat"}:${telegramMessageId}:${updateId}`;
    const tracePrefix = `[Telegram Webhook][${traceId}]`;
    const username = message.from?.username || message.from?.first_name || "Usuario";
    const MAX_AUDIO_DURATION_SECONDS = 60;

    // Texto base y caption por separado
    const baseText: string = message.text || "";
    const captionText: string = message.caption || "";

    // Posibles contenidos de audio/voz/video nota
    const voice = message.voice;
    const audio = message.audio;
    const videoNote = message.video_note;

    const audioFileId: string | undefined =
      voice?.file_id || audio?.file_id || videoNote?.file_id;

    const audioDuration: number | undefined =
      voice?.duration ?? audio?.duration ?? videoNote?.duration;

    // Si no hay chatId, ni texto/caption ni audio, ignoramos
    if (!chatId || (!baseText && !captionText && !audioFileId)) {
      return NextResponse.json({ ok: true });
    }

    let messageText: string = baseText || captionText;

    // Si hay audio, gestionamos límite de duración y transcripción
    if (audioFileId) {
      console.log(
        `${tracePrefix} Audio/voice detected from ${username} (${chatId}). file_id=${audioFileId}, duration=${audioDuration ?? "unknown"}s`,
      );

      // Límite de 1 minuto para notas de voz/audio
      if (audioDuration !== undefined && audioDuration > MAX_AUDIO_DURATION_SECONDS) {
        console.warn(
          `${tracePrefix} Audio duration (${audioDuration}s) exceeds limit (${MAX_AUDIO_DURATION_SECONDS}s). Skipping transcription.`,
        );

        // Creamos una entrada de mensaje de usuario sintético para dejar traza
        const tooLongContent = "[Audio demasiado largo, no transcrito (>60s)]";

        // 1. Obtener negocio por defecto (el primero)
        const business = await prisma.business.findFirst();
        if (!business) {
          console.warn("[Telegram Webhook] No business found in DB");
          await sendTelegramMessage(
            chatId,
            "Lo siento, el agente aún no está configurado.",
            traceId,
          );
          return NextResponse.json({ ok: true });
        }

        // 2. Gestionar Customer & Conversation
        let customer = await prisma.customer.findUnique({ where: { phone: chatId } });
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              phone: chatId,
              name: username,
            },
          });
        }

        let conversation = await prisma.conversation.findFirst({
          where: {
            businessId: business.id,
            customerId: customer.id,
            status: { not: "RESOLVED" },
            channel: "TELEGRAM",
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              businessId: business.id,
              customerId: customer.id,
              channel: "TELEGRAM",
              status: "ACTIVE",
            },
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "user",
            content: tooLongContent,
          },
        });

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "system",
            content: `[TRACE_ID:${traceId}] [CHAT_ID:${chatId}] [MESSAGE_ID:${telegramMessageId}] [TYPE:AUDIO_LIMIT]`,
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });

        await sendTelegramMessage(
          chatId,
          "Tu nota de voz supera el límite de 60 segundos. Por favor, envía audios de hasta 1 minuto o resume tu consulta en texto.",
          traceId,
        );

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "system",
            content: `[TRACE_ID:${traceId}] [CHAT_ID:${chatId}] [MESSAGE_ID:${telegramMessageId}] [TYPE:OUTBOUND_LIMIT_NOTICE]`,
          },
        });

        return NextResponse.json({ ok: true });
      }

      try {
        const audioBuffer = await fetchTelegramFileBuffer(audioFileId);
        if (audioBuffer) {
          console.log(
            `${tracePrefix} Audio file downloaded (${audioBuffer.byteLength} bytes). Transcribing...`,
          );
          const transcription = await transcriptionService.transcribeAudio(audioBuffer);
          if (transcription) {
            const transcriptionBlock = `[NOTA DE VOZ DEL CLIENTE]: ${transcription}`;
            if (messageText) {
              messageText = `${messageText}\n\n${transcriptionBlock}`;
            } else {
              messageText = transcriptionBlock;
            }
            console.log(
              `${tracePrefix} Audio transcribed and combined into messageText: "${messageText}"`,
            );
          } else {
            const fallback = "[Audio ininteligible]";
            if (messageText) {
              messageText = `${messageText}\n\n${fallback}`;
            } else {
              messageText = fallback;
            }
            console.warn("[Telegram Webhook] Empty transcription result.");
          }
        } else {
          const fallback = "[Error descargando audio]";
          if (messageText) {
            messageText = `${messageText}\n\n${fallback}`;
          } else {
            messageText = fallback;
          }
          console.warn("[Telegram Webhook] Could not download audio file from Telegram.");
        }
      } catch (err) {
        console.error("[Telegram Webhook] Error processing audio:", err);
        const fallback = "[Error procesando audio]";
        if (messageText) {
          messageText = `${messageText}\n\n${fallback}`;
        } else {
          messageText = fallback;
        }
      }
    }

    console.log(`${tracePrefix} Message from ${username} (${chatId}): ${messageText}`);

    // 1. Obtener negocio por defecto (el primero)
    const business = await prisma.business.findFirst();
    if (!business) {
      console.warn("[Telegram Webhook] No business found in DB");
      await sendTelegramMessage(chatId, "Lo siento, el agente aún no está configurado.", traceId);
      return NextResponse.json({ ok: true });
    }

    // 2. Gestionar Customer & Conversation
    let customer = await prisma.customer.findUnique({ where: { phone: chatId } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: chatId,
          name: username,
        },
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        businessId: business.id,
        customerId: customer.id,
        status: { not: "RESOLVED" },
        channel: "TELEGRAM",
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          channel: "TELEGRAM",
          status: "ACTIVE",
        },
      });
    }

    // 3. Guardar mensaje del usuario (texto o transcripción de audio)
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: messageText,
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "system",
        content: `[TRACE_ID:${traceId}] [CHAT_ID:${chatId}] [MESSAGE_ID:${telegramMessageId}] [TYPE:INBOUND]`,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // 4. Generar respuesta usando Agente + tools (incluye booking_manager)
    let replyText = "Lo siento, tuve un problema interno.";
    try {
      const { createAgentGraph } = await import("@/lib/agent/graph");
      const { HumanMessage, AIMessage } = await import("@langchain/core/messages");

      // Cargamos contexto reciente para que el agente no pierda el hilo entre turnos.
      const recentMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const orderedHistory = recentMessages.reverse();
      const agentMessages = orderedHistory
        .filter((m) => m.role === "user" || m.role === "agent")
        .map((m) => (m.role === "agent" ? new AIMessage(m.content) : new HumanMessage(m.content)));

      const agentExecutor = createAgentGraph(
        business.id,
        business.name,
        business.config,
        chatId,
      );

      const result = await agentExecutor.invoke({
        messages: agentMessages,
        businessId: business.id,
        businessName: business.name,
        config: business.config,
        customerPhone: chatId,
      });

      logBookingTrace(result?.messages, traceId);

      const lastMsg = result.messages[result.messages.length - 1];
      const content = typeof lastMsg?.content === "string" ? lastMsg.content : "";
      const bookingConfirmation = extractBookingConfirmation(result?.messages);
      replyText = bookingConfirmation || content || replyText;
      console.log(`${tracePrefix} Agent final reply: ${replyText}`);
    } catch (aiErr: any) {
      console.error("[Telegram Webhook] Agent Error:", aiErr?.message || aiErr);
    }

    // 5. Guardar respuesta del agente
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "agent",
        content: replyText,
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "system",
        content: `[TRACE_ID:${traceId}] [CHAT_ID:${chatId}] [MESSAGE_ID:${telegramMessageId}] [TYPE:OUTBOUND] [REPLY_LENGTH:${replyText.length}]`,
      },
    });

    // 6. Enviar respuesta a Telegram
    await sendTelegramMessage(chatId, replyText, traceId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function sendTelegramMessage(chatId: string, text: string, traceId?: string) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_TOKEN) {
    console.error("[Telegram Webhook] TELEGRAM_BOT_TOKEN is missing");
    return;
  }

  const logPrefix = traceId
    ? `[Telegram Webhook][${traceId}]`
    : "[Telegram Webhook]";

  for (let attempt = 1; attempt <= TELEGRAM_SEND_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TELEGRAM_SEND_TIMEOUT_MS);

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return;
      }

      const bodyText = await response.text().catch(() => "");
      console.warn(
        `${logPrefix} Telegram send failed (attempt ${attempt}/${TELEGRAM_SEND_MAX_ATTEMPTS}). status=${response.status}. body=${bodyText}`,
      );
    } catch (error: any) {
      clearTimeout(timeout);
      const errorCode = error?.cause?.code || error?.code || "unknown";
      const errorMessage = error?.name === "AbortError"
        ? `timeout after ${TELEGRAM_SEND_TIMEOUT_MS}ms`
        : error?.message || String(error);

      console.warn(
        `${logPrefix} Telegram send network error (attempt ${attempt}/${TELEGRAM_SEND_MAX_ATTEMPTS}). code=${errorCode}. ${errorMessage}`,
      );
    }
  }

  console.warn(`${logPrefix} Failed to deliver Telegram message after retries.`);
}

async function fetchTelegramFileBuffer(fileId: string): Promise<Buffer | null> {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_TOKEN) {
    console.error("[Telegram Webhook] TELEGRAM_BOT_TOKEN is missing (for file fetch)");
    return null;
  }

  try {
    // 1) Obtener información del archivo
    const getFileUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`;
    const getFileRes = await fetch(getFileUrl);
    if (!getFileRes.ok) {
      console.error("[Telegram Webhook] getFile request failed with status", getFileRes.status);
      return null;
    }

    const fileData: any = await getFileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) {
      console.error("[Telegram Webhook] Invalid getFile response:", fileData);
      return null;
    }

    const filePath: string = fileData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

    // 2) Descargar binario del archivo
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      console.error("[Telegram Webhook] File download failed with status", fileRes.status);
      return null;
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[Telegram Webhook] Error fetching file buffer:", error);
    return null;
  }
}

function logBookingTrace(messages: any[] | undefined, traceId: string) {
  if (!Array.isArray(messages) || messages.length === 0) return;

  const toolMessages = messages.filter((m) => {
    const messageType = typeof m?._getType === "function" ? m._getType() : undefined;
    const constructorName = m?.constructor?.name;
    return messageType === "tool" || constructorName === "ToolMessage";
  });

  if (toolMessages.length === 0) {
    console.log(`[Telegram Booking][${traceId}] No tool messages detected.`);
    return;
  }

  for (const toolMsg of toolMessages) {
    const rawContent =
      typeof toolMsg?.content === "string"
        ? toolMsg.content
        : JSON.stringify(toolMsg?.content ?? "");

    const normalized = rawContent.trim();

    if (normalized.includes("Available slots on")) {
      console.log(`[Telegram Booking][${traceId}] CHECK result: ${normalized}`);
      continue;
    }

    if (normalized.includes("Reservation confirmed!")) {
      console.log(`[Telegram Booking][${traceId}] CREATE success: ${normalized}`);
      continue;
    }

    if (normalized.includes("Error performing booking action")) {
      console.warn(`[Telegram Booking][${traceId}] CREATE/CHECK error: ${normalized}`);
      continue;
    }

    if (normalized.includes("No appointments available") || normalized.includes("There are no free slots")) {
      console.log(`[Telegram Booking][${traceId}] CHECK no availability: ${normalized}`);
      continue;
    }

    console.log(`[Telegram Booking][${traceId}] Tool output: ${normalized}`);
  }
}

function extractBookingConfirmation(messages: any[] | undefined): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const toolMessages = messages.filter((m) => {
    const messageType = typeof m?._getType === "function" ? m._getType() : undefined;
    const constructorName = m?.constructor?.name;
    return messageType === "tool" || constructorName === "ToolMessage";
  });

  for (let i = toolMessages.length - 1; i >= 0; i -= 1) {
    const rawContent =
      typeof toolMessages[i]?.content === "string"
        ? toolMessages[i].content
        : JSON.stringify(toolMessages[i]?.content ?? "");

    if (rawContent.includes("Listo, tu reserva quedó confirmada")) {
      return rawContent.trim();
    }

    if (rawContent.includes("Reservation confirmed!")) {
      return rawContent.trim();
    }
  }

  return null;
}

