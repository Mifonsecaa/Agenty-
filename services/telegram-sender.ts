// services/telegram-sender.ts
// Envía mensajes de vuelta a usuarios de Telegram
import { readFile } from "fs/promises";
import path from "path";

interface SendTelegramMessageParams {
  botToken: string;
  chatId: number;
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  replyToMessageId?: number;
}

interface TelegramSendResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

interface SendTelegramMediaParams {
  botToken: string;
  chatId: number;
  mediaUrl: string;
  caption?: string;
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
  parseMode = "HTML",
  replyToMessageId,
}: SendTelegramMessageParams): Promise<TelegramSendResult> {
  // Telegram has a 4096 char limit per message — split if needed
  const chunks = splitMessage(text, 4096);
  let lastMessageId: number | undefined;

  for (const chunk of chunks) {
    const body: Record<string, any> = {
      chat_id: chatId,
      text: chunk,
      parse_mode: parseMode,
    };

    if (replyToMessageId && chunk === chunks[0]) {
      body.reply_to_message_id = replyToMessageId;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("[Telegram Sender] Error:", data.description);
      // If parse_mode fails, retry as plain text
      if (data.error_code === 400 && parseMode !== undefined) {
        const plainRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: chunk }),
        });
        const plainData = await plainRes.json();
        if (plainData.ok) {
          lastMessageId = plainData.result?.message_id;
          continue;
        }
      }
      return { ok: false, error: data.description };
    }

    lastMessageId = data.result?.message_id;
  }

  return { ok: true, messageId: lastMessageId };
}

/**
 * Send a "typing..." indicator while the agent is thinking
 */
export async function sendTelegramTyping(botToken: string, chatId: number): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  }).catch(() => { });
}

export async function sendTelegramMedia({
  botToken,
  chatId,
  mediaUrl,
  caption,
}: SendTelegramMediaParams): Promise<TelegramSendResult> {
  const lowerUrl = mediaUrl.toLowerCase();
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(lowerUrl);
  const endpoint = isImage ? "sendPhoto" : "sendDocument";
  const mediaKey = isImage ? "photo" : "document";

  // Intento 1: enviar por URL directa (rápido cuando Telegram puede alcanzarla).
  const urlResult = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      [mediaKey]: mediaUrl,
      caption: caption || undefined,
    }),
  });

  const urlData = await urlResult.json().catch(() => ({}));
  if (urlData.ok) {
    return { ok: true, messageId: urlData.result?.message_id };
  }

  console.error("[Telegram Sender] Media error:", urlData?.description || `${urlResult.status} ${urlResult.statusText}`);

  // Intento 2: fallback robusto subiendo binario directamente a Telegram.
  const uploadResult = await uploadTelegramMediaBinary({
    botToken,
    chatId,
    mediaUrl,
    caption,
    endpoint,
    mediaKey,
  });

  if (uploadResult.ok) return uploadResult;
  return {
    ok: false,
    error: uploadResult.error || urlData?.description || "No se pudo enviar el archivo por Telegram",
  };
}

async function uploadTelegramMediaBinary({
  botToken,
  chatId,
  mediaUrl,
  caption,
  endpoint,
  mediaKey,
}: {
  botToken: string;
  chatId: number;
  mediaUrl: string;
  caption?: string;
  endpoint: string;
  mediaKey: "photo" | "document";
}): Promise<TelegramSendResult> {
  try {
    const { bytes, fileName, mimeType } = await resolveMediaContent(mediaUrl);
    if (!bytes) return { ok: false, error: "No se pudo leer el archivo para reintento" };

    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    if (caption) formData.append("caption", caption);
<<<<<<< HEAD
    const arrayBuffer = new Uint8Array(bytes).buffer as ArrayBuffer;
    formData.append(mediaKey, new Blob([arrayBuffer], { type: mimeType || "application/octet-stream" }), fileName);
=======

    // El cambio está aquí: agregamos "as any" a la variable bytes
    formData.append(mediaKey, new Blob([bytes as any], { type: mimeType || "application/octet-stream" }), fileName);
>>>>>>> 2aaa3e2403694cdd4c69bd6c1fd3fc03f31ae8df

    const res = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!data.ok) {
      console.error("[Telegram Sender] Media upload error:", data?.description || `${res.status} ${res.statusText}`);
      return { ok: false, error: data?.description || `${res.status} ${res.statusText}` };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (error: any) {
    return { ok: false, error: error?.message || "Error en upload binario a Telegram" };
  }
}

async function resolveMediaContent(mediaUrl: string): Promise<{ bytes: Uint8Array; fileName: string; mimeType?: string }> {
  const lower = mediaUrl.toLowerCase();
  const guessedMime = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
      ? "image/jpeg"
      : lower.endsWith(".webp")
        ? "image/webp"
        : lower.endsWith(".gif")
          ? "image/gif"
          : lower.endsWith(".pdf")
            ? "application/pdf"
            : undefined;

  try {
    const parsed = new URL(mediaUrl);
    const fileName = decodeURIComponent(parsed.pathname.split("/").pop() || "archivo");

    // Si es nuestro directorio local /uploads, leemos del disco para evitar problemas de URL pública.
    if (parsed.pathname.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), "public", parsed.pathname.replace(/^\//, ""));
      const buffer = await readFile(localPath);
      return { bytes: new Uint8Array(buffer), fileName, mimeType: guessedMime };
    }

    const remote = await fetch(mediaUrl);
    if (!remote.ok) {
      throw new Error(`No se pudo descargar media (${remote.status} ${remote.statusText})`);
    }

    const arr = await remote.arrayBuffer();
    const contentType = remote.headers.get("content-type") || guessedMime || undefined;
    return { bytes: new Uint8Array(arr), fileName, mimeType: contentType };
  } catch {
    // Fallback final para URLs relativas tipo /uploads/archivo.png
    const cleaned = mediaUrl.replace(/^https?:\/\/[^/]+/i, "");
    const fileName = decodeURIComponent(cleaned.split("/").pop() || "archivo");
    const rel = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;
    const localPath = path.join(process.cwd(), "public", rel);
    const buffer = await readFile(localPath);
    return { bytes: new Uint8Array(buffer), fileName, mimeType: guessedMime };
  }
}

/**
 * Split a long message into chunks respecting word boundaries
 */
function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitIndex = remaining.lastIndexOf(" ", maxLength);
    if (splitIndex === -1) splitIndex = maxLength;
    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}
