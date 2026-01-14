
import { WhatsAppConfig } from '../types';

/**
 * Envía un mensaje de texto plano a través de la API de WhatsApp Cloud de Meta.
 * Para usar esto, el usuario debe configurar su Access Token y Phone Number ID.
 */
export const sendDirectWhatsApp = async (config: WhatsAppConfig, to: string, message: string) => {
  if (!config.accessToken || !config.phoneNumberId) {
    throw new Error("Configuración de WhatsApp incompleta.");
  }

  const cleanPhone = to.replace(/\D/g, '');
  
  // Si el número no tiene código de país (asumimos Argentina +54 9)
  const finalPhone = cleanPhone.length === 10 ? `549${cleanPhone}` : cleanPhone;

  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: finalPhone,
        type: "text",
        text: { 
          preview_url: false,
          body: message 
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Error al enviar mensaje");
    }

    return data;
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    throw error;
  }
};

/**
 * Procesa una plantilla reemplazando variables dinámicas.
 */
export const processTemplate = (template: string, data: { nombre: string, fecha?: string, hora?: string, servicio?: string }) => {
  let result = template;
  result = result.replace(/{{nombre}}/gi, data.nombre);
  if (data.fecha) result = result.replace(/{{fecha}}/gi, data.fecha);
  if (data.hora) result = result.replace(/{{hora}}/gi, data.hora);
  if (data.servicio) result = result.replace(/{{servicio}}/gi, data.servicio);
  return result;
};
