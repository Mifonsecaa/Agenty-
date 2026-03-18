import { supabase } from "@/lib/supabase";

/**
 * Guarda las credenciales de WhatsApp para un negocio específico.
 * Asume que un usuario solo tiene un negocio por ahora.
 * @param userId - El ID del usuario de NextAuth.
 * @param accessToken - El token de acceso de larga duración de Meta.
 */
export async function saveWhatsAppCredentials(userId: string, accessToken: string) {
  try {
    // Aquí, en un futuro, podrías usar el token para obtener más detalles
    // como el Phone Number ID y el Business ID desde la API de Meta.
    // Por ahora, guardaremos solo el token.

    const { data: business, error: findError } = await supabase
      .from('Business')
      .select('*')
      .eq('userId', userId)
      .single();

    if (findError || !business) {
      throw new Error(`No se encontró un negocio para el usuario ${userId}`);
    }

    const { error: updateError } = await supabase
      .from('Business')
      .update({
        whatsappAccessToken: accessToken,
        // En un paso futuro, llenaríamos estos campos:
        // whatsappPhoneNumberId: "obtenido_de_la_api_de_meta",
        // whatsappBusinessId: "obtenido_de_la_api_de_meta",
      })
      .eq('id', business.id);

    if (updateError) throw updateError;

    console.log(`Credenciales de WhatsApp guardadas para el negocio: ${business.name}`);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar las credenciales de WhatsApp:", error);
    return { success: false, error: (error as Error).message };
  }
}
