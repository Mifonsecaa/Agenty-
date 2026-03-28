import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { evolutionService } from "@/services/whatsapp/evolution";

export async function GET(req: Request) {
    try {
        // 1. Verificamos sesión
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            console.warn("[API Business] No session found or no email in session");
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        // 2. Buscamos al usuario en la base de datos para obtener su ID real
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            console.warn(`[API Business] User not found for email: ${session.user.email}`);
            return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
        }

        // 3. Obtenemos todos los negocios/agentes asociados a ese usuario
        const businesses = await prisma.business.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`[API Business] Found ${businesses.length} businesses for user ${user.id}`);

        // 4. Respondemos con éxito
        return NextResponse.json({ success: true, businesses });

    } catch (error) {
        console.error("[API Business] GET error:", error);
        return NextResponse.json({ error: "Error interno del servidor al obtener los datos." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        const url = new URL(req.url);
        const businessId = url.searchParams.get("id");

        if (!businessId) {
            return NextResponse.json({ error: "Se requiere un ID de negocio." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
        }

        // Check ownership before deleting
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        if (!business || business.userId !== user.id) {
            return NextResponse.json({ error: "Negocio no encontrado o sin permisos." }, { status: 403 });
        }

        await prisma.business.delete({
            where: { id: businessId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error al eliminar el negocio:", error);
        return NextResponse.json({ error: "Error interno del servidor al eliminar." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, config } = body;

        if (!id || !name || !config) {
            return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
        }

        const business = await prisma.business.findUnique({
            where: { id }
        });

        if (!business || business.userId !== user.id) {
            return NextResponse.json({ error: "Negocio no encontrado o sin permisos." }, { status: 403 });
        }

        const updatedBusiness = await prisma.business.update({
            where: { id },
            data: {
                name,
                config
            }
        });

        return NextResponse.json({ success: true, business: updatedBusiness });

    } catch (error) {
        console.error("Error al actualizar el negocio:", error);
        return NextResponse.json({ error: "Error interno del servidor al actualizar." }, { status: 500 });
    }
}
