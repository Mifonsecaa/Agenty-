import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.TRIAL_EMAIL || 'trial@example.com';
  const password = process.env.TRIAL_PASSWORD || 'Trial123!';
  const businessName = process.env.TRIAL_BUSINESS_NAME || 'Trial Business';

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'USERTRY' },
    create: { email, name: 'Trial User', password: hashed, role: 'USERTRY' },
  });

  const business = await prisma.business.create({
    data: {
      name: businessName,
      userId: user.id,
      config: {},
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { trialBusinessId: business.id, trialStartedAt: new Date() } });

  console.log('Trial user created:');
  console.log('email:', email);
  console.log('password:', password);
  console.log('businessId:', business.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());

