import { PrismaClient } from '@prisma/client';

// Esta variable global se usa para evitar crear múltiples instancias de PrismaClient
// en el entorno de desarrollo debido al Hot Reloading de Next.js.
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
