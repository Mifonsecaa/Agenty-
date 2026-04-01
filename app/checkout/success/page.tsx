"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type VerifyState = 'idle' | 'verifying' | 'approved' | 'not_approved' | 'error';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const [state, setState] = useState<VerifyState>('idle');
    const [message, setMessage] = useState('');

    const transactionId = useMemo(() => {
        return (
            searchParams.get('id') ||
            searchParams.get('transaction_id') ||
            searchParams.get('transactionId') ||
            ''
        );
    }, [searchParams]);

    useEffect(() => {
        async function verify() {
            if (!transactionId) {
                setState('error');
                setMessage('No encontramos el ID de la transaccion en la URL de retorno.');
                return;
            }

            setState('verifying');
            try {
                const res = await fetch('/api/payments/wompi/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setState('error');
                    setMessage(data?.error || 'No se pudo verificar el pago.');
                    return;
                }

                if (data?.approved) {
                    setState('approved');
                    setMessage(`Pago aprobado. Tu plan ${data.planName} ya esta activo.`);
                    return;
                }

                setState('not_approved');
                setMessage(`Pago en estado ${data?.status || 'PENDING'}. Te avisaremos cuando cambie.`);
            } catch (err) {
                console.error('Wompi verify error', err);
                setState('error');
                setMessage('Ocurrio un error verificando el pago.');
            }
        }

        verify();
    }, [transactionId]);

    return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
            <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="text-2xl font-bold">Confirmacion de pago</h1>
                <p className="mt-3 text-white/80">{state === 'verifying' ? 'Verificando tu transaccion con Wompi...' : message}</p>

                <div className="mt-6 flex gap-3">
                    <Link href="/dashboard" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500">
                        Ir al dashboard
                    </Link>
                    <Link href="/pricing" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10">
                        Volver a planes
                    </Link>
                </div>
            </section>
        </main>
    );
}

