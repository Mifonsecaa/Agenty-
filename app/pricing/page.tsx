"use client";
import React from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
	{
		question: '¿Necesito tarjeta de crédito para la prueba gratis?',
		answer: 'No. Puedes empezar tu prueba de 7 días totalmente gratis sin ingresar datos bancarios.',
	},
	{
		question: '¿Puedo cambiar de plan en cualquier momento?',
		answer: 'Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplicarán en tu próximo ciclo de facturación.',
	},
	{
		question: '¿Qué pasa si supero el límite de conversaciones?',
		answer:
			'Te notificaremos cuando estés cerca del límite. Si lo superas, cobraremos un pequeño excedente por conversación adicional o pausaremos el servicio, según tu preferencia.',
	},
	{
		question: '¿El agente funciona con mi número actual de WhatsApp?',
		answer:
			'Sí. Escaneas un código QR (como en WhatsApp Web) y el agente toma el control. Puedes intervenir manualmente cuando quieras.',
	},
];

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
	// Configuración de animación para los hijos (tarjetas)
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	return (
		<div className="min-h-screen bg-[#050505] text-white pt-24 sm:pt-32 relative overflow-hidden">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="container mx-auto px-6 py-12 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					className="text-center max-w-4xl mx-auto"
				>
					<h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
						Planes diseñados para tu negocio
					</h1>
					<p className="text-lg text-white/60">
						Elige el plan que mejor se adapte a tus necesidades y empieza a
						automatizar hoy mismo.
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="show"
					className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
				>
					{plans.map((plan) => (
						<motion.div
							variants={itemVariants}
							key={plan.name}
							className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
								plan.isPopular
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
							<h3 className="text-2xl font-bold tracking-tight">
								{plan.name}
							</h3>
							<p className="mt-2 text-sm text-white/60 min-h-[40px]">
								{plan.description}
							</p>
							<div className="mt-6">
								<span className="text-5xl font-extrabold tracking-tight">
									{plan.price}
								</span>
								<span className="text-lg text-white/40 font-medium">
									/mes
								</span>
							</div>
							<ul className="mt-8 space-y-4 flex-grow">
								{plan.features.map((feature, index) => (
									<li
										key={index}
										className="flex items-start text-sm text-white/80"
									>
										<div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
											<Check className="w-3.5 h-3.5 text-emerald-400" />
										</div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
							<Link
								href="/register"
								className={`mt-10 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 text-center ${
									plan.isPopular
										? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
										: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
								}`}
							>
								Empezar con {plan.name}
							</Link>
						</motion.div>
					))}
				</motion.div>

				{/* FAQ Section */}
				<div className="mt-32 max-w-3xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
						<p className="text-white/60">
							Resolvemos tus dudas antes de empezar.
						</p>
					</div>

					<div className="space-y-4">
						{faqs.map((faq, i) => (
							<FAQItem key={i} faq={faq} />
						))}
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 0.8 }}
					className="text-center mt-16 text-white/50 text-sm"
				>
					<p>
						El costo de los tokens para el plan Business es de aproximadamente
						$0.15 por millón de tokens de entrada y $0.60 por millón de tokens de
						salida, asegurando una alta rentabilidad.
					</p>
				</motion.div>
			</div>
		</div>
	);
};

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-colors hover:bg-white/[0.07]">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between p-6 text-left"
			>
				<span className="font-medium text-white/90">{faq.question}</span>
				{isOpen ? (
					<ChevronUp className="w-5 h-5 text-white/60" />
				) : (
					<ChevronDown className="w-5 h-5 text-white/60" />
				)}
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="px-6 pb-6 text-sm text-white/60 leading-relaxed">
							{faq.answer}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default PricingPage;
