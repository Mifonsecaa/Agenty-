import { NextResponse } from 'next/server';

type Body = {
    planName: string;
    amount: number; // in cents (COP * 100)
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({})) as Body;
        if (!body || !body.planName || !body.amount) return NextResponse.json({ error: 'planName and amount are required' }, { status: 400 });

        const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
        if (!WOMPI_PRIVATE_KEY) return NextResponse.json({ error: 'WOMPI_PRIVATE_KEY not configured' }, { status: 500 });

        // Build the transaction payload for Wompi Checkout
        const payload = {
            acceptance_token: '', // Not needed for redirect-based checkout
            amount_in_cents: body.amount,
            currency: 'COP',
            customer_email: '',
            reference: `brainia-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
            payment_method: 'CARD',
            redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/checkout/success`,
            // Additional metadata can be added here
            metadata: { plan: body.planName },
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

        // Return the checkout URL to the frontend
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('[WOMPI] create-session error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

