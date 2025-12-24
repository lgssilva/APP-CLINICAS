
/**
 * SERVIÇO DE INTEGRAÇÃO WHATSAPP BUSINESS API (META)
 * Este serviço gere a comunicação oficial via Graph API.
 */

const WHATSAPP_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

// NOTA: Em produção, estas chaves devem ser configuradas no ficheiro .env
const PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID'; 
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  to: string;
  status: 'SENT' | 'FAILED' | 'DELIVERED';
  type: string;
}

export const whatsappService = {
  /**
   * Envia uma mensagem utilizando um Template Oficial (Requisito Meta para Início de Conversa)
   */
  async sendTemplateMessage(to: string, templateName: string, components: any[]) {
    const cleanPhone = to.replace(/\D/g, '');
    const url = `${BASE_URL}/${PHONE_NUMBER_ID}/messages`;

    console.log(`[WhatsApp API] Tentando enviar template "${templateName}" para ${cleanPhone}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'pt_PT' },
            components: components
          }
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Falha na API do WhatsApp');
      }

      console.log(`[WhatsApp API] Sucesso: ID da Mensagem ${result.messages[0].id}`);
      return { success: true, messageId: result.messages[0].id };
    } catch (error) {
      console.error(`[WhatsApp API] Erro Crítico:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  /**
   * Fallback: Envia via link wa.me (Abertura manual no browser)
   */
  sendManual(targetPhone: string, message: string) {
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 9 ? `351${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  },

  /**
   * Automatização de Fluxo (Chamada por componentes do App)
   */
  async triggerAutoNotification(type: 'BOOKING' | 'REMINDER', data: any) {
    console.log(`[WhatsApp Automation] Gatilho disparado para: ${type}`);
    
    // Simulação de mapeamento para templates oficiais da Meta
    const templateMap = {
      'BOOKING': 'confirmacao_consulta_v1',
      'REMINDER': 'lembrete_proximo_dia'
    };

    const components = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: data.patient || 'Paciente' },
          { type: 'text', text: data.date || '---' },
          { type: 'text', text: data.time || '---' }
        ]
      }
    ];

    return this.sendTemplateMessage(data.phone || '', templateMap[type], components);
  },

  generateConfirmationMsg(patientName: string, procedure: string, date: string, time: string): string {
    return `Olá ${patientName}! Confirmamos a sua consulta de *${procedure}* para o dia *${date}* às *${time}*. \n\nAté breve!`;
  }
};
