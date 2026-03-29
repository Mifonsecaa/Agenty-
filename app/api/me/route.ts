import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // Note: getServerSession is not available in edge runtime; assume default Node environment
  const session = await getServerSession(undefined as any, undefined as any, authOptions as any) as { user?: { email?: string; name?: string } } | null;
  if (!session?.user?.email) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, email: true, role: true, name: true, trialStartedAt: true, trialTokenLimit: true, trialTokensUsed: true } }) as any;
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name, trialStartedAt: user.trialStartedAt ? user.trialStartedAt.toISOString() : null, trialTokenLimit: user.trialTokenLimit ?? null, trialTokensUsed: user.trialTokensUsed ?? 0 } });
}

