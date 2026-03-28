import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { saveWhatsAppCredentials } from "@/services/database/business"; // 1. Importar nuestro nuevo servicio

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "email,public_profile,whatsapp_business_management,whatsapp_business_messaging",
                },
            },
        })
    );
}

providers.push(
    CredentialsProvider({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) throw new Error("Credenciales inválidas");
            const user = await prisma.user.findUnique({ where: { email: credentials.email } });
            if (!user || !user.password) throw new Error("Usuario no encontrado");
            if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");
            return user;
        }
    })
);

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            // 2. Si la conexión es de Facebook y tenemos un token...
            if (account?.provider === 'facebook' && account.access_token) {
                console.log("Recibido token de Facebook, guardando credenciales...");
                // 3. Llamamos a la función para guardar el token en la base de datos
                await saveWhatsAppCredentials(user.id, account.access_token);
            }
            try {
                // Ensure the user has a business and trial fields set on first sign in
                const dbUser = await prisma.user.findUnique({ where: { id: user.id } }) as any;
                if (dbUser) {
                    if (!dbUser.trialStartedAt) {
                        const b = await prisma.business.create({ data: { name: `${user.name || 'Negocio'} (Prueba)`, userId: dbUser.id, config: {} } });
                        const now = new Date();
                        await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = ${b.id}, trialStartedAt = ${now}, role = 'USERTRY', trialTokenLimit = ${10000}, trialTokensUsed = ${0} WHERE id = ${dbUser.id}`;
                    }
                }
            } catch (e) {
                console.warn('Error ensuring trial for OAuth user:', e);
            }
            return true; // Permitir siempre el inicio de sesión/conexión
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.sub;
                try {
                    // Fetch role from DB in case it's not present on the token
                    const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
                    if (dbUser) {
                        (session.user as any).role = (dbUser as any).role;
                    }
                } catch (e) {
                    console.warn('Could not fetch user role for session callback', e);
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
