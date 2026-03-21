import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

function getAppBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function createEmailVerificationToken(email: string) {
  const identifier = email.trim().toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  const verifyUrl = `${getAppBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(identifier)}`;
  return { token, expires, verifyUrl };
}

export async function sendEmailVerificationMessage({
  to,
  name,
  verifyUrl,
}: {
  to: string;
  name?: string | null;
  verifyUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Email provider is not configured. Missing RESEND_API_KEY or EMAIL_FROM.");
  }

  const safeName = name?.trim() || "";
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
      <h2 style="margin-bottom: 8px;">Confirma tu correo</h2>
      <p style="line-height: 1.5;">${greeting}</p>
      <p style="line-height: 1.5;">Gracias por registrarte en brainia. Para activar tu cuenta, confirma tu correo haciendo clic en el siguiente boton:</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background: #111827; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block;">Confirmar correo</a>
      </p>
      <p style="line-height: 1.5;">Si no funciona el boton, copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #2563eb;">${verifyUrl}</p>
      <p style="line-height: 1.5;">Este enlace expira en 24 horas.</p>
    </div>
  `;

  const text = [
    `${greeting}`,
    "",
    "Gracias por registrarte en brainia.",
    "Confirma tu correo con este enlace:",
    verifyUrl,
    "",
    "Este enlace expira en 24 horas.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Confirma tu registro en brainia",
      html,
      text,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Email send failed: ${payload || response.statusText}`);
  }
}

