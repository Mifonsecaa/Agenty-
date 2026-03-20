import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken, sendEmailVerificationMessage } from "@/lib/auth/email-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No existe una cuenta con ese correo" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "El correo ya está verificado" }, { status: 200 });
    }

    const { verifyUrl } = await createEmailVerificationToken(email);
    await sendEmailVerificationMessage({
      to: email,
      name: user.name,
      verifyUrl,
    });

    return NextResponse.json({ message: "Te enviamos un nuevo correo de confirmación" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo reenviar el correo" }, { status: 500 });
  }
}

