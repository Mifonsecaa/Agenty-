import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Para negocios que quieren empezar a automatizar.',
    features: [
      '1 agente de IA',
      'Hasta 1,000 conversaciones/mes',
      'Respuestas automáticas 24/7',
      'Integración con WhatsApp',
      'Historial de conversaciones',
      'Soporte básico',
    ],
    isPopular: false,
  },
  {
    name: 'Growth',
    price: '$59',
    description: 'Para negocios en crecimiento que buscan más potencia.',
    features: [
      '1 agente más potente',
      'Hasta 3,000 conversaciones/mes',
      'Automatización avanzada de ventas',
      'Captura de leads',
      'Seguimiento de clientes',
      'Estadísticas básicas',
    ],
    isPopular: true,
  },
  {
    name: 'Business',
    price: '$99',
    description: 'Para empresas con alto volumen de mensajes.',
    features: [
      'Múltiples automatizaciones',
      'Hasta 10,000 conversaciones/mes',
      'Analítica avanzada',
      'Soporte prioritario',
      'Optimización con GPT-4o mini',
      'Costo de tokens ultra bajo',
    ],
    isPopular: false,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 sm:pt-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Planes diseñados para tu negocio
          </h1>
          <p className="text-lg text-white/60">
            Elige el plan que mejor se adapte a tus necesidades y empieza a automatizar hoy mismo.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${plan.isPopular
                  ? 'border border-purple-500/30 bg-[#111111] shadow-2xl shadow-purple-500/10'
                  : 'border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md'
                }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                  <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
                    Más Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
              <p className="mt-2 text-sm text-white/60 min-h-[40px]">{plan.description}</p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="text-lg text-white/40 font-medium">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-10 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.isPopular
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                  }`}
              >
                Empezar con {plan.name}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-16 text-white/50 text-sm">
          <p>El costo de los tokens para el plan Business es de aproximadamente $0.15 por millón de tokens de entrada y $0.60 por millón de tokens de salida, asegurando una alta rentabilidad.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
