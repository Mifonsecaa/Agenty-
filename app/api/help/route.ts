import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { helpContactSchema, type HelpContactInput } from "@/lib/validation/schemas";
import { validateData, validationErrorResponse, successResponse } from "@/lib/validation/validate";
import { buildRequesterKey, checkRateLimit } from "@/lib/security/traffic-control";

const recentFingerprints = new Map<string, number>();

function sanitize(value: string) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanupFingerprints(ttlMs: number) {
  const now = Date.now();
  for (const [key, ts] of recentFingerprints.entries()) {
    if (now - ts > ttlMs) {
      recentFingerprints.delete(key);
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requesterKey = buildRequesterKey(request);

    const rate = await checkRateLimit({
      scope: "help-contact",
      key: requesterKey,
      maxRequests: Number(process.env.HELP_RATE_LIMIT_MAX || 5),
      windowMs: Number(process.env.HELP_RATE_LIMIT_WINDOW_MS || 60_000),
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Has enviado demasiadas solicitudes. Intenta nuevamente en unos minutos.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
          },
        }
      );
    }

    // Honeypot: bots suelen completar este campo oculto.
    const trap = sanitize(String((body as any)?.website || ""));
    if (trap) {
      return successResponse({ message: "Tu solicitud fue enviada al equipo de desarrollo." }, 200);
    }

    // Timing trap: bots suelen enviar en menos de unos segundos.
    const minFillMs = Number(process.env.HELP_MIN_FILL_MS || 3000);
    const startedAtMs = Number((body as any)?.startedAtMs || 0);
    const elapsedMs = Date.now() - startedAtMs;
    if (!Number.isFinite(startedAtMs) || startedAtMs <= 0 || elapsedMs < minFillMs) {
      return successResponse({ message: "Tu solicitud fue enviada al equipo de desarrollo." }, 200);
    }

    const validation = validateData<HelpContactInput>(body, helpContactSchema);

    if (!validation.success) {
      return validationErrorResponse(validation.errors || []);
    }

    const data = validation.data!;
    const name = sanitize(data.name);
    const email = sanitize(data.email).toLowerCase();
    const subject = sanitize(data.subject);
    const message = sanitize(data.message);

    const duplicateWindowMs = Number(process.env.HELP_DUPLICATE_WINDOW_MS || 10 * 60 * 1000);
    cleanupFingerprints(duplicateWindowMs);

    const fingerprintSource = `${requesterKey}|${email}|${subject}|${message}`;
    const fingerprint = createHash("sha256").update(fingerprintSource).digest("hex");
    const previous = recentFingerprints.get(fingerprint);
    if (previous && Date.now() - previous < duplicateWindowMs) {
      return successResponse({ message: "Tu solicitud fue enviada al equipo de desarrollo." }, 200);
    }
    recentFingerprints.set(fingerprint, Date.now());

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const to = process.env.HELP_CENTER_TO;

    if (!apiKey || !from || !to) {
      return NextResponse.json(
        {
          success: false,
          error: "Falta configurar RESEND_API_KEY, EMAIL_FROM o HELP_CENTER_TO en variables de entorno.",
        },
        { status: 500 }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">Nuevo mensaje de Centro de Ayuda</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap; line-height: 1.6; background: #f9fafb; padding: 12px; border-radius: 8px;">${message}</p>
      </div>
    `;

    const text = [
      "Nuevo mensaje de Centro de Ayuda",
      `Nombre: ${name}`,
      `Correo: ${email}`,
      `Asunto: ${subject}`,
      "",
      "Mensaje:",
      message,
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((v) => v.trim()).filter(Boolean),
        reply_to: email,
        subject: `[Centro de Ayuda] ${subject}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const payload = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: payload || "No se pudo enviar el mensaje al equipo.",
        },
        { status: 502 }
      );
    }

    return successResponse({ message: "Tu solicitud fue enviada al equipo de desarrollo." }, 200);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo procesar tu solicitud. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}

