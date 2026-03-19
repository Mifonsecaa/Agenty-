// services/instagram-sender.ts
// Envía mensajes de vuelta a usuarios de Instagram Business

interface SendInstagramMessageParams {
  accessToken: string;
  recipientId: string;
  text: string;
}

interface InstagramSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export async function sendInstagramMessage({
  accessToken,
  recipientId,
  text,
}: SendInstagramMessageParams): Promise<InstagramSendResult> {
  // Instagram DMs have a 1000 char limit
  const chunks = splitMessage(text, 1000);

  for (const chunk of chunks) {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: chunk },
          messaging_type: "RESPONSE",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[Instagram Sender] Error:", data.error);
      return {
        ok: false,
        error: data.error?.message || "Error al enviar mensaje de Instagram",
      };
    }
  }

  return { ok: true };
}

/**
 * Mark a message as seen (shows read receipt in Instagram)
 */
export async function markInstagramMessageSeen(
  accessToken: string,
  senderId: string
): Promise<void> {
  await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: senderId },
        sender_action: "mark_seen",
      }),
    }
  ).catch(() => {});
}

/**
 * Show typing indicator in Instagram
 */
export async function sendInstagramTypingOn(
  accessToken: string,
  recipientId: string
): Promise<void> {
  await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        sender_action: "typing_on",
      }),
    }
  ).catch(() => {});
}

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
