export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 px-6">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1>Política de Privacidad</h1>
                <p>Última actualización: {new Date().toLocaleDateString()}</p>

                <h2>1. Recopilación de Información</h2>
                <p>Recopilamos información necesaria para proporcionar nuestros servicios, como tu correo electrónico, número de teléfono y datos de configuración del agente.</p>

                <h2>2. Uso de la Información</h2>
                <p>Usamos tu información para:</p>
                <ul>
                    <li>Autenticarte y gestionar tu cuenta.</li>
                    <li>Entrenar a tu agente de IA personalizado.</li>
                    <li>Mejorar nuestros servicios y enviarte notificaciones importantes.</li>
                </ul>

                <h2>3. Compartir Información</h2>
                <p>No vendemos tus datos a terceros. Compartimos información solo con proveedores de servicios necesarios (como OpenAI o plataformas de pago) bajo estrictos acuerdos de confidencialidad.</p>

                <h2>4. Tus Derechos</h2>
                <p>Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Contáctanos para ejercer estos derechos.</p>
            </div>
        </div>
    );
}
