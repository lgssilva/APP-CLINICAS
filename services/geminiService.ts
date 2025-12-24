
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Generates a simplified, patient-friendly explanation for a medical budget.
   */
  async simplifyBudget(procedure: string, items: any[]): Promise<string> {
    const prompt = `
      Você é um assistente de comunicação para uma clínica de alto padrão em Portugal.
      O médico/dentista propôs o seguinte tratamento: ${procedure}.
      Os itens do orçamento são: ${JSON.stringify(items)}.
      
      Explique este tratamento para o paciente em linguagem extremamente simples, acolhedora e persuasiva. 
      Evite termos técnicos complexos. Foque nos benefícios e na saúde do paciente.
      O texto deve ser curto (máximo 3 parágrafos) e terminar com uma chamada para aprovação.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Não foi possível gerar a explicação simplificada.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao processar a explicação. Por favor, revise manualmente.";
    }
  },

  /**
   * Generates personalized post-care instructions.
   */
  async generatePostCare(patientName: string, procedure: string): Promise<string> {
    const prompt = `
      Gere instruções de pós-consulta personalizadas para o paciente ${patientName} que acabou de realizar o procedimento: ${procedure}.
      Inclua:
      1. Cuidados imediatos (primeiras 24h).
      2. O que evitar.
      3. Quando entrar em contato com a clínica.
      Use um tom atencioso e profissional.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Instruções não disponíveis.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao gerar instruções.";
    }
  },

  /**
   * Generates audio from text using Gemini TTS.
   */
  async generateAudio(text: string): Promise<string | null> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga com tom profissional e calmo: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Opções: Kore, Zephyr, Puck, Charon, Fenrir
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }
};
