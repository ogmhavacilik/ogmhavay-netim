
import { GoogleGenAI } from "@google/genai";
import { Aircraft } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFleetStatus = async (fleet: Aircraft[]) => {
  const fleetSummary = fleet.map(a => 
    `${a.kuyrukNo} (${a.cagriKodu}): ${a.durum}, Konum: ${a.konum}, Faydalı Saat: ${a.faydaliSaat}`
  ).join('\n');

  // Fix: updated model to 'gemini-3-flash-preview' for basic text summarization task according to guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Aşağıdaki OGM hava araçları filosunu analiz et ve kısa bir özet çıkar. Bakımı yaklaşanları ve gayri faal olanları belirt: \n\n${fleetSummary}`,
  });

  return response.text;
};
