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
    <div className="min-h-screen bg-gray-900 text-white pt-24 sm:pt-32">
      <div className="aurora-bg" />
      <div className="container mx-auto px-6 py-12">
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
              className={`relative flex flex-col p-8 rounded-2xl border ${
                plan.isPopular ? 'border-purple-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                  <span className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    Más Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-white/60">{plan.description}</p>
              <div className="mt-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-lg text-white/60">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-10 w-full py-3 rounded-lg font-semibold ${
                  plan.isPopular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-500'
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
