import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai";
import { transcriptionService } from "@/services/ai/transcription";
import { evolutionService } from "@/services/whatsapp/evolution";
import { metricsService } from "@/lib/metrics";
import { incrementOpsCounter, recordOpsDuration } from "@/lib/observability/ops-metrics";

type Channel = "TELEGRAM" | "WHATSAPP";

type AudioJobPayload = {
  businessId: string;
  conversationId: string;
  channel: Channel;
  providerMessageId: string;
  chatId?: string;
  targetJid?: string;
  instanceName?: string;
  telegramFileId?: string;
  captionText?: string;
  messageData?: Record<string, unknown>;
};

type ClaimedAudioJob = {
  id: string;
  businessId: string;
  attempts: number;
  maxAttempts: number;
  payload: AudioJobPayload;
};

type ProcessedAudioPayload = {
  businessId: string;
  channel: Channel;
  replyText: string;
};

const RETRYABLE_ERROR_MATCHERS = [
  "ETIMEDOUT",
  "ECONNRESET",
  "ENOTFOUND",
  "429",
  "temporarily",
  "timeout",
  "rate limit",
  "EAI_AGAIN",
];

function isMissingQueueTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('relation "AudioTranscriptionJob" does not exist');
}

function isRetryableError(error: unknown) {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return RETRYABLE_ERROR_MATCHERS.some((matcher) => message.includes(matcher.toLowerCase()));
}

function sanitizeText(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

function buildFingerprint(payload: AudioJobPayload) {
  return createHash("sha256")
    .update(JSON.stringify({
      businessId: payload.businessId,
      channel: payload.channel,
      providerMessageId: payload.providerMessageId,
    }))
    .digest("hex");
}

function computeNextRetryDate(attempt: number) {
  const baseMs = 4000;
  const maxMs = 3 * 60 * 1000;
  const expMs = Math.min(baseMs * Math.pow(2, Math.max(0, attempt - 1)), maxMs);
  const jitterMs = Math.floor(Math.random() * 1000);
  return new Date(Date.now() + expMs + jitterMs);
}

async function fetchTelegramFileBuffer(fileId: string, token: string): Promise<Buffer | null> {
  try {
    const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    if (!getFileRes.ok) return null;

    const fileData: any = await getFileRes.json();
    const filePath = fileData?.result?.file_path;
    if (!filePath) return null;

    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    if (!fileRes.ok) return null;

    const arr = await fileRes.arrayBuffer();
    return Buffer.from(arr);
  } catch {
    return null;
  }
}

async function sendTelegramMessage(chatId: string, text: string, token: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (error) {
    console.error("[TranscriptionQueue] Telegram send failed:", error);
  }
}

async function claimNextAudioJob(): Promise<ClaimedAudioJob | null> {
  const rows = (await prisma.$queryRawUnsafe(
    `
    UPDATE "AudioTranscriptionJob" j
    SET status = 'PROCESSING',
        "startedAt" = COALESCE(j."startedAt", NOW()),
        "updatedAt" = NOW()
    WHERE j.id = (
      SELECT id
      FROM "AudioTranscriptionJob"
      WHERE status IN ('PENDING', 'RETRY')
        AND "nextRunAt" <= NOW()
      ORDER BY "nextRunAt" ASC, "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING j.id, j."businessId", j.attempts, j."maxAttempts", j.payload
    `
  )) as Array<{ id: string; businessId: string; attempts: number; maxAttempts: number; payload: AudioJobPayload }>;

  if (!rows?.length) return null;
  return rows[0];
}

async function processClaimedAudioJob(job: ClaimedAudioJob) {
  const model = (prisma as any).audioTranscriptionJob;
  const startedAt = Date.now();

  try {
    const payload = {
      ...(job.payload || ({} as AudioJobPayload)),
      businessId: (job.payload?.businessId || job.businessId),
    };
    await processAudioPayload(payload);

    await model.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        lastError: null,
      },
    });

    incrementOpsCounter("transcription.job.completed");
    recordOpsDuration("transcription.job.latency_ms", Date.now() - startedAt);

    return { processed: true as const, jobId: job.id, status: "COMPLETED" };
  } catch (error) {
    const attempt = job.attempts + 1;
    const canRetry = attempt < job.maxAttempts && isRetryableError(error);
    const nextStatus = canRetry ? "RETRY" : "DLQ";

    await model.update({
      where: { id: job.id },
      data: {
        attempts: attempt,
        status: nextStatus,
        lastError: error instanceof Error ? error.message : String(error),
        nextRunAt: canRetry ? computeNextRetryDate(attempt) : new Date(),
        finishedAt: canRetry ? null : new Date(),
      },
    });

    incrementOpsCounter(canRetry ? "transcription.job.retry" : "transcription.job.dlq");
    recordOpsDuration("transcription.job.error_latency_ms", Date.now() - startedAt);

    return {
      processed: true as const,
      jobId: job.id,
      status: nextStatus,
      attempt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function processAudioPayload(payload: AudioJobPayload): Promise<ProcessedAudioPayload> {
  const businessId = payload.businessId;
  const conversationId = payload.conversationId;
  if (!businessId || !conversationId || !payload.channel) {
    throw new Error("INVALID_AUDIO_JOB_PAYLOAD");
  }

  let transcription = "";

  if (payload.channel === "TELEGRAM") {
    if (!payload.telegramFileId || !payload.chatId) {
      throw new Error("MISSING_TELEGRAM_AUDIO_FIELDS");
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { telegramBotToken: true },
    });

    const token = business?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("MISSING_TELEGRAM_BOT_TOKEN");
    }

    const audioBuffer = await fetchTelegramFileBuffer(payload.telegramFileId, token);
    if (!audioBuffer) {
      throw new Error("TELEGRAM_AUDIO_DOWNLOAD_FAILED");
    }

    transcription = await transcriptionService.transcribeAudio(audioBuffer);
  } else {
    if (!payload.instanceName || !payload.targetJid || !payload.messageData) {
      throw new Error("MISSING_WHATSAPP_AUDIO_FIELDS");
    }

    const base64Audio = await evolutionService.fetchMediaBase64(payload.instanceName, payload.messageData);
    if (!base64Audio) {
      throw new Error("WHATSAPP_AUDIO_DOWNLOAD_FAILED");
    }

    const audioBuffer = Buffer.from(base64Audio, "base64");
    transcription = await transcriptionService.transcribeAudio(audioBuffer);
  }

  const cleanTranscript = sanitizeText(transcription);
  const contentBlock = cleanTranscript
    ? `[NOTA DE VOZ DEL CLIENTE]: ${cleanTranscript}`
    : "[Audio ininteligible]";

  const caption = sanitizeText(payload.captionText || "");
  const messageText = caption ? `${caption}\n\n${contentBlock}` : contentBlock;

  await prisma.message.create({
    data: {
      conversationId,
      role: "user",
      content: messageText,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  const aiReply = await aiService.generateResponse(businessId, [{ role: "user", content: messageText }]);
  const replyText = sanitizeText(aiReply || "") || "Lo siento, tuve un problema interno procesando tu audio.";

  await prisma.message.create({
    data: {
      conversationId,
      role: "agent",
      content: replyText,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  if (payload.channel === "TELEGRAM") {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { telegramBotToken: true },
    });
    const token = business?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (token && payload.chatId) {
      await sendTelegramMessage(payload.chatId, replyText, token);
    }
  } else if (payload.instanceName && payload.targetJid) {
    await evolutionService.sendMessage(payload.instanceName, payload.targetJid, replyText);
    await metricsService.incrementMetric(payload.businessId, "messagesReceived");
    await metricsService.incrementMetric(payload.businessId, "messagesSent");
    await metricsService.incrementMetric(payload.businessId, "aiResponses");
  }

  return { businessId, channel: payload.channel, replyText };
}

export async function enqueueAudioTranscription(payload: AudioJobPayload) {
  const model = (prisma as any).audioTranscriptionJob;
  const fingerprint = buildFingerprint(payload);

  try {
    const existing = await model.findFirst({
      where: {
        businessId: payload.businessId,
        fingerprint,
        status: { in: ["PENDING", "PROCESSING", "RETRY", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      incrementOpsCounter("transcription.job.enqueue_deduplicated");
      return { job: existing, deduplicated: true, missingQueueTable: false };
    }

    const job = await model.create({
      data: {
        businessId: payload.businessId,
        payload,
        fingerprint,
        status: "PENDING",
        attempts: 0,
        maxAttempts: Number(process.env.TRANSCRIPTION_JOB_MAX_ATTEMPTS || 3),
        nextRunAt: new Date(),
      },
    });

    incrementOpsCounter("transcription.job.enqueue");

    return { job, deduplicated: false, missingQueueTable: false };
  } catch (error) {
    if (isMissingQueueTable(error)) {
      incrementOpsCounter("transcription.job.queue_table_missing");
      return { job: null, deduplicated: false, missingQueueTable: true };
    }
    incrementOpsCounter("transcription.job.enqueue_error");
    throw error;
  }
}

export async function processAudioTranscriptionInline(payload: AudioJobPayload) {
  incrementOpsCounter("transcription.inline_fallback");
  const startedAt = Date.now();
  const result = await processAudioPayload(payload);
  recordOpsDuration("transcription.inline_latency_ms", Date.now() - startedAt);
  return result;
}

export async function processNextAudioTranscriptionJob() {
  const job = await claimNextAudioJob();
  if (!job) {
    return { processed: false as const };
  }

  return processClaimedAudioJob(job);
}

export async function processAudioTranscriptionBatch(limit = 3) {
  const startedAt = Date.now();
  const results: Array<Record<string, unknown>> = [];
  for (let i = 0; i < limit; i++) {
    const result = await processNextAudioTranscriptionJob();
    if (!result.processed) break;
    results.push(result as unknown as Record<string, unknown>);
  }
  incrementOpsCounter(results.length > 0 ? "transcription.worker.batch_non_empty" : "transcription.worker.batch_idle");
  recordOpsDuration("transcription.worker.batch_latency_ms", Date.now() - startedAt);
  return results;
}

