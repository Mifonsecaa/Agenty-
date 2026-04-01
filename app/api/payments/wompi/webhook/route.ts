import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function resolveWompiApiBase(privateKey: string) {
    return privateKey.startsWith('prv_test_') ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));

        // Wompi sends event data.transaction.id inside body.data.transaction.id
        const transactionId = body?.data?.transaction?.id || body?.data?.id || null;
        if (!transactionId) {
            console.warn('[WOMPI WEBHOOK] missing transaction id', body);
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
        if (!WOMPI_PRIVATE_KEY) {
            console.error('[WOMPI WEBHOOK] WOMPI_PRIVATE_KEY not configured');
            return NextResponse.json({ ok: false }, { status: 500 });
        }
        const wompiApiBase = resolveWompiApiBase(WOMPI_PRIVATE_KEY);

        // Fetch transaction state from Wompi to verify
        const resp = await fetch(`${wompiApiBase}/v1/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
        });
        const tx = await resp.json().catch(() => ({}));

        // tx.data.transaction.status usually holds the status
        const status = tx?.data?.transaction?.status || null;

        console.log('[WOMPI WEBHOOK] transaction', transactionId, 'status', status);

        // TODO: update your database based on transaction status
        // Example: store in a Payments table or update a user's subscription
        try {
            await prisma.$executeRaw`INSERT INTO "PaymentAction" (id, details, created_at) VALUES (${transactionId}, ${JSON.stringify(tx)}, now())`;
        } catch (e) {
            // PaymentAction table may not exist; ignore for now
            console.warn('[WOMPI WEBHOOK] could not record payment action', e);
        }

        // You may handle statuses: "APPROVED", "DECLINED", "PENDING", "FAILED", etc.
        // Implement your business logic here.

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[WOMPI WEBHOOK] error', err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

