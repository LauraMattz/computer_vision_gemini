import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DetectedObject, ModelType } from "../types";

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

// Define the schema for the structured JSON response
const objectDetectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    objects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: {
            type: Type.STRING,
            description: "O nome específico do objeto identificado em Português do Brasil (ex: 'Caneca Vermelha', não apenas 'Caneca').",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0 and 1.",
          },
          box_2d: {
            type: Type.ARRAY,
            description: "Tight bounding box coordinates [ymin, xmin, ymax, xmax] on a scale of 0 to 1000.",
            items: {
              type: Type.INTEGER,
            },
          },
        },
        required: ["label", "box_2d", "confidence"],
      },
    },
  },
  required: ["objects"],
};

export const analyzeImage = async (base64Image: string): Promise<DetectedObject[]> => {
  try {
    const ai = getClient();
    
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: ModelType.FLASH,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Detecte objetos. Retorne caixas delimitadoras 2D extremamente precisas e justas. Seja específico com os rótulos. Retorne TUDO em Português do Brasil.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: objectDetectionSchema,
        systemInstruction: "Você é um sistema de visão computacional de alta precisão. Suas caixas delimitadoras devem ser justas às bordas do objeto. Ignore itens de fundo obscuros. Saia apenas detecções de alta confiança. Retorne os rótulos (labels) estritamente em Português do Brasil.",
        temperature: 0, // Zero temperature for maximum precision and determinism
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    const objects = data.objects || [];
    
    // Filter low confidence objects - slightly higher threshold for "precision" feel
    return objects.filter((obj: DetectedObject) => (obj.confidence || 0) > 0.55);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
};