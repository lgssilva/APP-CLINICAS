
export const smsService = {
  /**
   * Simula o envio de SMS. 
   * Em produção, aqui seria feita a chamada para um gateway como Twilio ou BulkSMS.
   */
  async send(phone: string, message: string): Promise<{ success: boolean; provider: string }> {
    console.log(`[SMS Gateway] Enviando para ${phone}: ${message}`);
    
    // Simula latência de rede
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, provider: 'MEO/Vodafone Enterprise' });
      }, 800);
    });
  },

  generateReminder(patientName: string, clinicName: string, date: string, time: string): string {
    return `SMS: Olá ${patientName}, lembramos a sua consulta na ${clinicName} amanhã, ${date} às ${time}. Se precisar de reagendar, ligue para a clínica.`;
  }
};
