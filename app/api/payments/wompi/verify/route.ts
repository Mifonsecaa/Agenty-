import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

type VerifyBody = {
    transactionId?: string;
    reference?: string;
};

const PLAN_ROLE_MAP: Record<string, 'USERDEFAULT' | 'USERPRO'> = {
    Starter: 'USERDEFAULT',
    Growth: 'USERPRO',
    Business: 'USERPRO',
};

function extractTransaction(payload: any) {
    return payload?.data?.transaction || payload?.data || payload?.transaction || null;
}

function extractTransactionFromList(payload: any) {
    const list = payload?.data?.data || payload?.data || [];
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[0];
}

function resolveWompiApiBase(privateKey: string) {
    return privateKey.startsWith('prv_test_') ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';
}

export async function POST(req: Request) {
    try {
        const session = (await getServerSession(authOptions as any)) as any;
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
        if (!WOMPI_PRIVATE_KEY) return NextResponse.json({ error: 'WOMPI_PRIVATE_KEY not configured' }, { status: 500 });
        const wompiApiBase = resolveWompiApiBase(WOMPI_PRIVATE_KEY);

        const body = (await req.json().catch(() => ({}))) as VerifyBody;
        if (!body.transactionId && !body.reference) {
            return NextResponse.json({ error: 'transactionId or reference is required' }, { status: 400 });
        }

        let tx: any = null;

        if (body.transactionId) {
            const resp = await fetch(`${wompiApiBase}/v1/transactions/${body.transactionId}`, {
                headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
                cache: 'no-store',
            });
            const raw = await resp.json().catch(() => ({}));
            if (!resp.ok) return NextResponse.json({ error: 'Wompi error', details: raw }, { status: 502 });
            tx = extractTransaction(raw);
        } else {
            const resp = await fetch(`${wompiApiBase}/v1/transactions?reference=${encodeURIComponent(String(body.reference))}`, {
                headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
                cache: 'no-store',
            });
            const raw = await resp.json().catch(() => ({}));
            if (!resp.ok) return NextResponse.json({ error: 'Wompi error', details: raw }, { status: 502 });
            tx = extractTransactionFromList(raw);
            if (!tx) {
                return NextResponse.json({ ok: true, approved: false, status: 'NOT_FOUND' });
            }
        }

        if (!tx) {
            return NextResponse.json({ ok: true, approved: false, status: 'NOT_FOUND' });
        }

        const status = tx?.status || 'UNKNOWN';
        const txEmail = (tx?.customer_email || '').toLowerCase();
        const sessionEmail = String(session.user.email || '').toLowerCase();
        if (txEmail && sessionEmail && txEmail !== sessionEmail) {
            return NextResponse.json({ error: 'Transaction does not belong to current user' }, { status: 403 });
        }

        if (status !== 'APPROVED') {
            return NextResponse.json({ ok: true, approved: false, status });
        }

        const planName = tx?.metadata?.plan;
        const targetRole = PLAN_ROLE_MAP[planName];
        if (!targetRole) return NextResponse.json({ error: 'Unknown or missing plan in transaction metadata' }, { status: 400 });

        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        await prisma.user.update({
            where: { id: dbUser.id },
            data: {
                role: targetRole,
                trialTokenLimit: null,
            },
        });

        return NextResponse.json({ ok: true, approved: true, status, planName, role: targetRole });
    } catch (err) {
        console.error('[WOMPI VERIFY] error', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

