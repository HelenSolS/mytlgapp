import { GoogleGenAI } from "@google/genai";
import { SigilConfig } from "../types.ts";
import { STYLE_PROMPTS, ELEMENT_PROMPTS } from "../constants.ts";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateSigil = async (
  config: SigilConfig, 
  referenceImageBase64?: string,
  retries = 3,
  backoff = 1000
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const textPrompt = `
    A centralized, magical sigil centered in the frame. 
    Main Subject: ${config.symbol}.
    Elemental Influence: ${ELEMENT_PROMPTS[config.element]}.
    Artistic Style: ${STYLE_PROMPTS[config.style]}.
    Primary Color: ${config.color}.
    Parameters: Line thickness level ${config.thickness}/100, magic glow intensity ${config.glow}/100.
    Positioning: Vertical alignment offset ${config.position - 50} units from center.
    ${config.aiTextAllowed ? "AI TEXT ALLOWED: The sigil can incorporate readable mystical glyphs or words." : "Strictly abstract symbols, no readable human text."}
    The image must be perfectly square 1:1, symmetrical, collectible art style, high resolution, professional lighting.
  `;

  const contents: any[] = [{ text: textPrompt }];
  if (referenceImageBase64) {
    contents.push({
      inlineData: {
        data: referenceImageBase64.split(',')[1] || referenceImageBase64,
        mimeType: 'image/jpeg'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contents },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("No image generated.");
    return imageUrl;
  } catch (error: any) {
    if (retries > 0 && (error.status === 500 || error.status === 429)) {
      await sleep(backoff);
      return generateSigil(config, referenceImageBase64, retries - 1, backoff * 2);
    }
    throw error;
  }
};
