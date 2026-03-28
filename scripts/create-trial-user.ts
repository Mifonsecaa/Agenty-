import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

async function main() {
  const email = process.argv[2] || 'trial@example.com';
  const businessName = process.argv[3] || 'Trial Business';

  const hashed = await bcrypt.hash('trialpassword', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    // do not set role here to avoid TypeScript errors in CI
    create: { email, name: 'Trial User', password: hashed },
  });

  const business = await prisma.business.create({ data: { name: businessName, userId: user.id, config: {} } });

  // set trial fields via raw SQL to avoid TypeScript errors in CI
  await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = ${business.id}, trialStartedAt = ${new Date()} WHERE id = ${user.id}`;
  await prisma.$executeRaw`UPDATE "User" SET role = 'USERTRY' WHERE id = ${user.id}`;

  console.log('Created trial user', user.id, 'business', business.id);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
