import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function requireRole(req: Request, res: Response, allowedRoles: string[]) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) throw { status: 401, message: 'Unauthorized' };
  const user = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;
  if (!user || !allowedRoles.includes(user.role)) throw { status: 403, message: 'Forbidden' };
  return user;
}

export async function authorizeBusinessAccess(req: any, res: any, businessId: string) {
  const session = await getServerSession(req, res, authOptions as any) as any;
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    throw new Error('Unauthorized');
  }

  const user = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;
  if (!user) {
    res.status(403).json({ error: 'Forbidden' });
    throw new Error('Forbidden');
  }

  // Admins bypass restrictions
  if (user.role === 'ADMIN') return user;

  // If user is trial, they can only access the business assigned in trialBusinessId
  if (user.role === 'USERTRY') {
    if (!user.trialBusinessId || user.trialBusinessId !== businessId) {
      res.status(403).json({ error: 'Forbidden: trial users can only access their assigned agent' });
      throw new Error('Forbidden');
    }
    if (!user.trialStartedAt) {
      res.status(403).json({ error: 'Forbidden: trial start not set' });
      throw new Error('Forbidden');
    }
    const msSince = Date.now() - new Date(user.trialStartedAt).getTime();
    const hours = msSince / (1000 * 60 * 60);
    if (hours > 24) {
      res.status(403).json({ error: 'Trial expired' });
      throw new Error('Forbidden');
    }
    return user;
  }

  // For other users, verify ownership of the business
  const business = await prisma.business.findFirst({ where: { id: businessId, user: { email: session.user.email } } });
  if (!business) {
    res.status(403).json({ error: 'Forbidden' });
    throw new Error('Forbidden');
  }
  return user;
}

// Helper variant that accepts a NextAuth session (used in App Router handlers)
export async function authorizeBusinessAccessSession(session: any, businessId: string) {
  if (!session?.user?.email) throw { status: 401, message: 'Unauthorized' };

  // fetch user and cast to any to avoid type mismatches while migrating
  const user = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;

  // admin bypass
  if (user.role === 'ADMIN') return user;

  // If user is trial, they can only access the business assigned in trialBusinessId
  if (user.role === 'USERTRY') {
    if (!user.trialBusinessId || user.trialBusinessId !== businessId) {
      throw { status: 403, message: 'Forbidden: trial users can only access their assigned agent' };
    }
    if (!user.trialStartedAt) throw { status: 403, message: 'Forbidden: trial start not set' };
    const msSince = Date.now() - new Date(user.trialStartedAt).getTime();
    if (msSince / (1000 * 60 * 60) > 24) throw { status: 403, message: 'Trial expired' };
    return user;
  }

  // fallback: owner check
  const business = await prisma.business.findFirst({ where: { id: businessId, user: { email: session.user.email } } });
  if (!business) throw { status: 403, message: 'Forbidden' };
  return user;
}
