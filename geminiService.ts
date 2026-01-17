
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectGenre, ArtStyle } from "./types";

const API_KEY = process.env.API_KEY || '';

export const generateStoryOutline = async (theme: string, genre: string, pageCount: number) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a ${genre} story with ${pageCount} distinct scenes based on: "${theme}". For each scene, provide a descriptive visual prompt for an image generator and a short caption (max 50 words).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                imagePrompt: { type: Type.STRING },
                caption: { type: Type.STRING }
              },
              required: ["imagePrompt", "caption"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, style: ArtStyle): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const enhancedPrompt = `Art style: ${style}. ${prompt}. High quality, detailed, vibrant colors.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: enhancedPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};
