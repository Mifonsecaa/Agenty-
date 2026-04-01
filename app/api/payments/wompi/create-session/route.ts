import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type Body = {
    planName: string;
    amount?: number; // optional; server validates against plan catalog
}

const PLAN_PRICES_IN_CENTS: Record<string, number> = {
    Starter: 12000000,
    Growth: 25000000,
    Business: 40000000,
};

function resolveBaseUrl() {
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return null;
}

export async function POST(req: Request) {
    try {
        const session = (await getServerSession(authOptions as any)) as any;
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({})) as Body;
        if (!body || !body.planName) return NextResponse.json({ error: 'planName is required' }, { status: 400 });

        const amountInCents = PLAN_PRICES_IN_CENTS[body.planName];
        if (!amountInCents) return NextResponse.json({ error: 'Invalid planName' }, { status: 400 });

        const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
        if (!WOMPI_PRIVATE_KEY) return NextResponse.json({ error: 'WOMPI_PRIVATE_KEY not configured' }, { status: 500 });

        const baseUrl = resolveBaseUrl();
        if (!baseUrl) return NextResponse.json({ error: 'NEXTAUTH_URL not configured' }, { status: 500 });

        const reference = `agenty-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const redirectUrl = `${baseUrl}/checkout/success?plan=${encodeURIComponent(body.planName)}&ref=${encodeURIComponent(reference)}`;

        // Build the transaction payload for Wompi Checkout
        const payload = {
            acceptance_token: '', // Not needed for redirect-based checkout
            amount_in_cents: amountInCents,
            currency: 'COP',
            customer_email: session.user.email,
            reference,
            payment_method: 'CARD',
            redirect_url: redirectUrl,
            // Additional metadata can be added here
            metadata: { plan: body.planName, email: session.user.email },
        };

        // Wompi checkout creation endpoint
        const res = await fetch('https://production.wompi.co/v1/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error('Wompi error:', data);
            return NextResponse.json({ error: 'Wompi error', details: data }, { status: 500 });
        }

        const checkoutUrl =
            data?.data?.payment_link ||
            data?.data?.redirect_url ||
            data?.transaction?.payment_link ||
            null;

        return NextResponse.json({ success: true, data, checkoutUrl, reference });
    } catch (err) {
        console.error('[WOMPI] create-session error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

