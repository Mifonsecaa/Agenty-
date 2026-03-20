import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get("token") || "").trim();
  const email = String(searchParams.get("email") || "").trim().toLowerCase();

  const redirectBase = new URL(request.url).origin;

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid_verification_link", redirectBase));
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification || verification.identifier !== email) {
    return NextResponse.redirect(new URL("/login?error=invalid_verification_link", redirectBase));
  }

  if (verification.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    return NextResponse.redirect(new URL("/login?error=verification_link_expired&email=" + encodeURIComponent(email), redirectBase));
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  return NextResponse.redirect(new URL("/login?verified=1&email=" + encodeURIComponent(email), redirectBase));
}

