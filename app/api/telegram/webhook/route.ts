import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import { transcriptionService } from "@/services/ai/transcription";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id?.toString();
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
        `[Telegram Webhook] Audio/voice message detected from ${username} (${chatId}). file_id=${audioFileId}, duration=${audioDuration ?? "unknown"}s`,
      );

      // Límite de 1 minuto para notas de voz/audio
      if (audioDuration !== undefined && audioDuration > MAX_AUDIO_DURATION_SECONDS) {
        console.warn(
          `[Telegram Webhook] Audio duration (${audioDuration}s) exceeds limit (${MAX_AUDIO_DURATION_SECONDS}s). Skipping transcription.`,
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

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });

        await sendTelegramMessage(
          chatId,
          "Tu nota de voz supera el límite de 60 segundos. Por favor, envía audios de hasta 1 minuto o resume tu consulta en texto.",
        );

        return NextResponse.json({ ok: true });
      }

      try {
        const audioBuffer = await fetchTelegramFileBuffer(audioFileId);
        if (audioBuffer) {
          console.log(
            `[Telegram Webhook] Audio file downloaded (${audioBuffer.byteLength} bytes). Transcribing...`,
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
              `[Telegram Webhook] Audio transcribed and combined into messageText: "${messageText}"`,
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

    console.log(`[Telegram Webhook] Message from ${username} (${chatId}): ${messageText}`);

    // 1. Obtener negocio por defecto (el primero)
    const business = await prisma.business.findFirst();
    if (!business) {
      console.warn("[Telegram Webhook] No business found in DB");
      await sendTelegramMessage(chatId, "Lo siento, el agente aún no está configurado.");
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

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // 4. Generar respuesta usando el mismo servicio de IA base (sin herramientas avanzadas aún)
    const aiReply = await aiService.generateResponse(business.id, [
      { role: "user", content: messageText },
    ]);

    const replyText = aiReply || "Lo siento, tuve un problema interno.";

    // 5. Guardar respuesta del agente
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "agent",
        content: replyText,
      },
    });

    // 6. Enviar respuesta a Telegram
    await sendTelegramMessage(chatId, replyText);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_TOKEN) {
    console.error("[Telegram Webhook] TELEGRAM_BOT_TOKEN is missing");
    return;
  }

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
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
