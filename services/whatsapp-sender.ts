// services/whatsapp-sender.ts

export async function sendWhatsAppMessage(to: string, text: string) {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const FROM_PHONE_NUMBER_ID = process.env.WHATSAPP_FROM_PHONE_ID;

    // 🚨 FILTRO 1: Validar que el .env esté bien configurado antes de intentar nada
    if (!WHATSAPP_TOKEN || !FROM_PHONE_NUMBER_ID) {
        console.error("[WhatsApp Sender] ❌ Faltan las variables WHATSAPP_TOKEN o WHATSAPP_FROM_PHONE_ID");
        return false;
    }

    try {
        // Nota: Es buena práctica sacar la versión a una constante por si Meta te pide actualizarla
        const API_VERSION = "v18.0";

        const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${FROM_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual", // Buena práctica exigida por Meta
                to: to,
                type: "text",                 // Siempre declara explícitamente el tipo
                text: {
                    preview_url: true,        // 💡 Si la IA manda un link, esto genera una vista previa bonita
                    body: text
                },
            }),
        });

        // 🚨 FILTRO 2: Leer el chisme si Meta nos rechaza el mensaje
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[WhatsApp Sender] ❌ Meta rechazó el mensaje para ${to}:`, JSON.stringify(errorData, null, 2));
            return false; // Retornamos false para que tu sistema sepa que falló
        }

        console.log(`[WhatsApp Sender] ✅ Mensaje entregado a la API de Meta para ${to}`);
        return true;

    } catch (error) {
        // 🚨 FILTRO 3: Si tu servidor se queda sin internet o la URL de Meta se cae
        console.error(`[WhatsApp Sender] ❌ Error de red crítico al enviar a ${to}:`, error);
        return false;
    }
}