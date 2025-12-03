import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppState, GeneratedContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    refinedVision: { type: Type.STRING, description: "A professional, corporate vision statement." },
    refinedMission: { type: Type.STRING, description: "A professional, corporate mission statement." },
    refinedAbout: { type: Type.STRING, description: "A 2-3 paragraph professional company introduction." },
    refinedServices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A catchy, professional service title." },
          description: { type: Type.STRING, description: "A concise professional description of the service." }
        },
        required: ["title", "description"]
      },
      description: "A list of 6-9 refined services."
    }
  },
  required: ["refinedVision", "refinedMission", "refinedAbout", "refinedServices"]
};

export const generateProfileContent = async (data: AppState): Promise<GeneratedContent> => {
  const prompt = `
    You are an expert Corporate Copywriter for the construction and services sector in the GCC (Oman/UAE). 
    Your task is to take raw company details and rewrite them to sound high-end, trustworthy, and ISO-standard compliant.
    
    Company Name: ${data.companyInfo.name}
    Industry Context: The user has provided services like: ${data.rawServices}
    
    Raw Vision: ${data.coreIdentity.vision}
    Raw Mission: ${data.coreIdentity.mission}
    Raw About/History: ${data.coreIdentity.aboutRaw}
    Raw Services List: ${data.rawServices}
    
    Instructions:
    1. Rewrite the Vision and Mission to be impactful and corporate.
    2. Write a professional "Who We Are" (About Us) section based on the input, inventing professional phrasing for established years and location if needed.
    3. Categorize and expand the raw services list into 6 to 9 distinct, professionally named service offerings with short descriptions.
    4. Ensure the tone is formal, authoritative, and suitable for a multi-million dollar contract proposal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No content generated");
    }

    const parsed = JSON.parse(jsonText);
    
    return {
      refinedVision: parsed.refinedVision,
      refinedMission: parsed.refinedMission,
      refinedAbout: parsed.refinedAbout,
      refinedServices: parsed.refinedServices,
      isGenerated: true
    };
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};