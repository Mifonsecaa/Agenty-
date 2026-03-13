export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 px-6">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1>Términos de Servicio</h1>
                <p>Última actualización: {new Date().toLocaleDateString()}</p>
                
                <h2>1. Aceptación de los Términos</h2>
                <p>Al acceder y utilizar Agenty, aceptas cumplir con estos términos de servicio y todas las leyes aplicables.</p>

                <h2>2. Descripción del Servicio</h2>
                <p>Agenty proporciona herramientas de inteligencia artificial para la automatización de conversaciones en WhatsApp y otros canales.</p>

                <h2>3. Uso Aceptable</h2>
                <p>No debes utilizar nuestros servicios para enviar spam, contenido ilegal o infringir los derechos de terceros. Nos reservamos el derecho de suspender cuentas que violen estas normas.</p>

                <h2>4. Limitación de Responsabilidad</h2>
                <p>Agenty no se hace responsable de las interrupciones del servicio causadas por terceros (como WhatsApp/Meta) o por el mal uso de la plataforma.</p>

                <h2>5. Modificaciones</h2>
                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos.</p>
            </div>
        </div>
    );
}
