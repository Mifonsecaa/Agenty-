import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const hashed = await bcrypt.hash('adminpassword', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, name: 'Admin' },
    create: { email, password: hashed, name: 'Admin' },
  });

  // ensure admin role via raw SQL to avoid TypeScript errors in CI
  await prisma.$executeRaw`UPDATE "User" SET role = 'ADMIN' WHERE id = ${user.id}`;

  console.log('Ensured admin user', user.id);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
