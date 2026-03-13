import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                name: name || email.split("@")[0],
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Éxito", user: { id: newUser.id, email: newUser.email } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}