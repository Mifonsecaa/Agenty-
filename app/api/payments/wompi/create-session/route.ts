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

function resolveWompiApiBase(privateKey: string) {
    return privateKey.startsWith('prv_test_') ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';
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
        const wompiApiBase = resolveWompiApiBase(WOMPI_PRIVATE_KEY);

        const baseUrl = resolveBaseUrl();
        if (!baseUrl) return NextResponse.json({ error: 'NEXTAUTH_URL not configured' }, { status: 500 });

        const reference = `agenty-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const redirectUrl = `${baseUrl}/checkout/success?plan=${encodeURIComponent(body.planName)}&ref=${encodeURIComponent(reference)}`;

        // Build hosted checkout payload (payment link) so payment method is collected by Wompi UI.
        const payload = {
            name: `Plan ${body.planName} - Agenty`,
            description: `Suscripcion ${body.planName}`,
            single_use: true,
            collect_shipping: false,
            amount_in_cents: amountInCents,
            currency: 'COP',
            reference,
            redirect_url: redirectUrl,
            // Additional metadata can be added here
            metadata: { plan: body.planName, email: session.user.email },
        };

        // Wompi hosted checkout endpoint
        const res = await fetch(`${wompiApiBase}/v1/payment_links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            const providerMessage =
                data?.error?.reason ||
                data?.error?.messages?.[0]?.message ||
                data?.error?.messages?.[0] ||
                data?.message ||
                'Wompi request failed';
            console.error('Wompi error:', data);
            return NextResponse.json({ error: 'Wompi error', providerMessage, details: data }, { status: res.status });
        }

        const checkoutUrl =
            data?.data?.permalink ||
            data?.data?.url ||
            data?.data?.payment_link ||
            data?.data?.redirect_url ||
            (data?.data?.id ? `https://checkout.wompi.co/l/${data.data.id}` : null) ||
            data?.transaction?.payment_link ||
            null;

        return NextResponse.json({ success: true, data, checkoutUrl, reference });
    } catch (err) {
        console.error('[WOMPI] create-session error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

