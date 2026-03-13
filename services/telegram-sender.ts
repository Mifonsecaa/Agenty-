// services/telegram-sender.ts
// Envía mensajes de vuelta a usuarios de Telegram

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
  }).catch(() => {});
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
