
import { GoogleGenAI, Type } from "@google/genai";

// Inicializa a instância apenas quando necessário para evitar erro de 'process is not defined' no browser
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    // Verificação de segurança para evitar crash se process não existir
    let apiKey = '';
    try {
      if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY || '';
      }
    } catch (e) {
      console.warn("Ambiente não suporta process.env");
    }
    
    // Inicializa com a chave (ou string vazia para não quebrar na instanciação, falhará apenas na chamada)
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const enhanceDescription = async (currentDescription: string, context: string): Promise<string> => {
  try {
    const prompt = `
      Você é um assistente técnico especialista em manutenção elétrica.
      Melhore e torne mais técnica a seguinte descrição de uma demanda elétrica.
      
      Contexto/Local: ${context}
      Descrição Original: "${currentDescription}"
      
      Retorne apenas a descrição técnica aprimorada, sem introduções ou explicações. Use terminologia padrão da indústria elétrica (ABNT/NR-10 se aplicável).
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || currentDescription;
  } catch (error) {
    console.error("Error enhancing description:", error);
    return currentDescription; // Fallback to original
  }
};
