import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createEmailVerificationToken, sendEmailVerificationMessage } from "@/lib/auth/email-verification";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const normalizedName = String(name || "").trim();

        if (!normalizedEmail || !password) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (userExists) {
            return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: normalizedName || normalizedEmail.split("@")[0],
                password: hashedPassword,
            },
        });

        // Create a default business for the trial and set trial fields.
        try {
            const business = await prisma.business.create({ data: { name: `${newUser.name || 'Negocio'} (Prueba)`, userId: newUser.id, config: {} } });
            const now = new Date();
            // Use raw SQL to set trial fields and token limits to avoid Prisma enum/type drift in CI
            // trialTokenLimit: set a modest default, e.g., 10000 tokens
            await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = ${business.id}, trialStartedAt = ${now}, role = 'USERTRY', trialTokenLimit = ${10000}, trialTokensUsed = ${0} WHERE id = ${newUser.id}`;
        } catch (err) {
            console.warn('Could not create trial business automatically', err);
        }

        try {
            const { verifyUrl } = await createEmailVerificationToken(normalizedEmail);
            await sendEmailVerificationMessage({
                to: normalizedEmail,
                name: newUser.name,
                verifyUrl,
            });
        } catch (emailError) {
            await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
            await prisma.user.delete({ where: { id: newUser.id } });

            // NUEVO: Esto imprimirá el error exacto de Resend en los logs de Vercel
            console.error(" ERROR DE RESEND:", emailError);

            return NextResponse.json(
                { error: "No se pudo enviar el correo de confirmación. Inténtalo de nuevo." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Cuenta creada. Revisa tu correo para confirmar el registro.",
                requiresEmailVerification: true,
                user: { id: newUser.id, email: newUser.email },
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}