import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        // 1. Verificamos sesión
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        // 2. Buscamos al usuario en la base de datos para obtener su ID real
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
        }

        // 3. Obtenemos todos los negocios/agentes asociados a ese usuario
        const businesses = await prisma.business.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        // 4. Respondemos con éxito
        return NextResponse.json({ success: true, businesses });

    } catch (error) {
        console.error("Error al obtener los negocios:", error);
        return NextResponse.json({ error: "Error interno del servidor al obtener los datos." }, { status: 500 });
    }
}
