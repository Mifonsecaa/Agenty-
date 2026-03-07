import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../prisma/client'; // Asegúrate que esta ruta es correcta

export const authOptions: AuthOptions = {
  // 1. Añadir el PrismaAdapter
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Si el usuario no existe o no tiene contraseña (se registró con Google)
        if (!user || !user.password) {
          throw new Error("Usuario no encontrado o registrado por otro método.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Contraseña incorrecta.");
        }
        
        // Devuelve el usuario completo para que next-auth lo gestione
        return user;
      }
    })
  ],
  
  // 2. Configurar la estrategia de sesión y callbacks
  session: {
    strategy: 'jwt',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Al iniciar sesión, añade el ID de usuario al token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Añade el ID de usuario a la sesión para que esté disponible en el cliente
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // 3. Definir la página de inicio de sesión y el secreto
  pages: {
    signIn: '/login',
    error: '/login', // Redirigir a login en caso de error
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
