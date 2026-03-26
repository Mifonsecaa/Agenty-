import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function requireRole(req: any, res: any, allowedRoles: string[]) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.email) {
	res.status(401).json({ error: 'Unauthorized' });
	throw new Error('Unauthorized');
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !allowedRoles.includes(user.role)) {
	res.status(403).json({ error: 'Forbidden' });
	throw new Error('Forbidden');
  }
  return user;
}


