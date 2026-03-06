import React from 'react';
import Link from 'next/link';
import { Bot, MessageSquare, ShoppingCart, Users } from 'lucide-react';

const predefinedAgents = [
  {
    id: 'reservas',
    name: 'Agente de Reservas',
    description: 'Automatiza la gestión de citas y reservas para restaurantes, salones o gimnasios.',
    icon: <Bot className="w-8 h-8 text-purple-400" />,
    link: '/agents/reservations',
  },
  {
    id: 'atencion_cliente',
    name: 'Agente de Atención al Cliente',
    description: 'Responde preguntas frecuentes (FAQs) y brinda soporte 24/7 a tus clientes.',
    icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
    link: '/agents/customer-support',
  },
  {
    id: 'captura_leads',
    name: 'Agente de Captura de Leads',
    description: 'Cualifica clientes potenciales, recoge datos de contacto y los integra con tu CRM.',
    icon: <Users className="w-8 h-8 text-green-400" />,
    link: '/agents/lead-capture',
  },
  {
    id: 'ventas',
    name: 'Agente de Ventas',
    description: 'Asiste en el proceso de compra, ofrece recomendaciones y cierra ventas automáticamente.',
    icon: <ShoppingCart className="w-8 h-8 text-red-400" />,
    link: '/agents/sales',
  },
];

const PredefinedAgentsPage = () => {
  return (
    <main className="relative min-h-screen pt-24 sm:pt-32">
      <div className="aurora-bg" />
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Agentes Predeterminados
          </h1>
          <p className="text-lg text-white/60">
            Descubre nuestros agentes de IA listos para usar, diseñados para automatizar tareas clave en tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {predefinedAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="mb-5 p-4 rounded-full bg-white/5">
                {agent.icon}
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">{agent.name}</h2>
              <p className="text-white/60 text-sm flex-grow">{agent.description}</p>
              <Link href={agent.link} className="mt-8 w-full bg-white text-black font-semibold py-3 rounded-xl hover:scale-[1.02] transition-all duration-200">
                Ver Detalles
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PredefinedAgentsPage;
