import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

type CreatePayload = {
  email: string;
  businessId?: string;
  businessName?: string;
  durationHours?: number; // optional override
};

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // verify admin - avoid selecting new fields (role) which may not exist in generated types in CI
    const admin = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({})) as CreatePayload;
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

    // ensure user exists
    const passwordPlaceholder = Math.random().toString(36).slice(2, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      // don't specify `role` here because CI's generated Prisma types may be out of sync
      create: { email, name: '', password: passwordPlaceholder },
    });

    let businessId = body.businessId;
    if (!businessId) {
      // create a business for the trial user
      const b = await prisma.business.create({ data: { name: body.businessName || `Trial ${user.email}`, userId: user.id, config: {} } });
      businessId = b.id;
    } else {
      // verify business exists
      const b = await prisma.business.findUnique({ where: { id: businessId } });
      if (!b) return NextResponse.json({ error: 'businessId not found' }, { status: 404 });
    }

    const now = new Date();
    // Update trial fields using raw SQL to avoid TypeScript errors while Prisma client types are out of sync
    await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = ${businessId}, trialStartedAt = ${now} WHERE id = ${user.id}`;
    // Set role using a raw SQL statement as well. This is temporary; restore typed updates once CI runs `prisma generate`.
    await prisma.$executeRaw`UPDATE "User" SET role = 'USERTRY' WHERE id = ${user.id}`;

    await prisma.trialAction.create({ data: { adminId: admin.id, targetUserId: user.id, action: 'activate', details: `businessId=${businessId}` } });

    return NextResponse.json({ success: true, userId: user.id, businessId, trialStartedAt: now.toISOString() });
  } catch (err: any) {
    console.error('[ADMIN TRIAL POST] Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // select admin for permission checks - cast to any to avoid CI type mismatches
    const admin = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || '').trim();
    const action = String(body.action || '').trim();
    if (!userId || !action) return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });

    // select only the fields we need from the target user (cast to any to avoid type drift during rollout)
    const target = (await prisma.user.findUnique({ where: { id: userId } })) as any;
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'extend') {
      const hours = Number(body.hours || 24);
      const current = target.trialStartedAt ? new Date(target.trialStartedAt) : new Date();
      // extend by moving start into the past so expires moves forward
      const newStart = new Date(current.getTime() - (24 - hours) * 3600 * 1000);
      await prisma.$executeRaw`UPDATE "User" SET trialStartedAt = ${newStart} WHERE id = ${userId}`;
      await prisma.trialAction.create({ data: { adminId: admin.id, targetUserId: userId, action: 'extend', details: `hours=${hours}` } });
      return NextResponse.json({ success: true, trialStartedAt: newStart.toISOString() });
    }

    if (action === 'revoke') {
      // avoid setting `role` in typed update to prevent TS errors during rollout
      await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = NULL, trialStartedAt = NULL WHERE id = ${userId}`;
      await prisma.$executeRaw`UPDATE "User" SET role = 'USERDEFAULT' WHERE id = ${userId}`;
      await prisma.trialAction.create({ data: { adminId: admin.id, targetUserId: userId, action: 'revoke', details: '' } });
      return NextResponse.json({ success: true });
    }

    if (action === 'setBusiness') {
      const businessId = String(body.businessId || '').trim();
      if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });
      const b = await prisma.business.findUnique({ where: { id: businessId } });
      if (!b) return NextResponse.json({ error: 'businessId not found' }, { status: 404 });
      await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = ${businessId} WHERE id = ${userId}`;
      await prisma.trialAction.create({ data: { adminId: admin.id, targetUserId: userId, action: 'setBusiness', details: `businessId=${businessId}` } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[ADMIN TRIAL PATCH] Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // select admin for permission checks - cast to any to avoid CI type mismatches
    const admin = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const userId = url.searchParams.get('userId');

    let user;
    // select the exact user properties we return to the admin
    if (email) user = (await prisma.user.findUnique({ where: { email } })) as any;
    else if (userId) user = (await prisma.user.findUnique({ where: { id: userId } })) as any;
    else return NextResponse.json({ error: 'email or userId required' }, { status: 400 });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const actions = await prisma.trialAction.findMany({ where: { targetUserId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role, trialBusinessId: user.trialBusinessId, trialStartedAt: user.trialStartedAt }, actions });
  } catch (err: any) {
    console.error('[ADMIN TRIAL GET] Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = (await prisma.user.findUnique({ where: { email: session.user.email } })) as any;
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || '').trim();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await prisma.$executeRaw`UPDATE "User" SET trialBusinessId = NULL, trialStartedAt = NULL WHERE id = ${userId}`;
    await prisma.$executeRaw`UPDATE "User" SET role = 'USERDEFAULT' WHERE id = ${userId}`;
    await prisma.trialAction.create({ data: { adminId: admin.id, targetUserId: userId, action: 'delete', details: '' } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[ADMIN TRIAL DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
