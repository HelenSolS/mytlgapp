import { GoogleGenAI } from "@google/genai";
import { CardConfig, GenerationResult, AppMode, MagicVibe, RenderingStyle } from "../types";

export const generateCardImage = async (config: CardConfig): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";

  const getStyleDescription = (style: RenderingStyle) => {
    switch(style) {
      case RenderingStyle.CARTOON: return "Bold, stylized illustration with expressive shapes and dynamic line work.";
      case RenderingStyle.COMIC: return "Classic American comic book style, vibrant halftones (Ben-Day dots), thick ink outlines, and dynamic action-oriented shading.";
      case RenderingStyle.PENCIL: return "Detailed graphite pencil drawing with realistic cross-hatching and paper grain.";
      case RenderingStyle.INK: return "Sharp black ink wash, calligraphic precision, heavy contrast, master pen work.";
      case RenderingStyle.SKETCH: return "Loose charcoal or lead sketch with artistic construction lines and raw texture.";
      case RenderingStyle.KAWAII: return "Cute, simplified aesthetic with rounded proportions and clean outlines.";
      case RenderingStyle.HYPERREALISM: return "Extreme micro-detail, professional studio depth, cinematic lighting textures.";
      case RenderingStyle.SCHEMATIC: return "Technical drafting style, precise mathematical lines, architectural blueprint aesthetic.";
      case RenderingStyle.CONVEX_3D: return "3D embossed material relief with physical shadows and tactile volume.";
      case RenderingStyle.REALISM: return "Professional photographic aesthetic with accurate surface materials.";
      default: return "";
    }
  };

  const colorInstruction = config.isMonochrome 
    ? "STRICT MONOCHROME: High-contrast black and white. Newspaper ink aesthetic. Use sharp ink blacks and pure paper whites. NO colors, NO sepia, NO gray tints. If applicable, use newspaper-style halftone patterns." 
    : "VIBRANT COLOR: Rich, saturated hues and professional color grading.";

  const styleBase = getStyleDescription(config.renderingStyle);

  const textDrawingInstruction = config.allowAiText 
    ? "AI TEXT ALLOWED: The model is allowed to include artistic text elements, speech bubbles, sound effects (like 'POW', 'BOOM'), or labels naturally within the artwork."
    : "STRICTLY NO TEXT: Do not include any written words, letters, symbols, speech bubbles, or typography within the main visual art area. Pure graphics only.";

  if (config.mode === AppMode.SIGIL) {
    const thicknessDesc = config.lineThickness < 1.5 
      ? "ultra-fine needle-thin strokes"
      : config.lineThickness < 3.0
      ? "refined lines with elegant weight"
      : `heavy, powerful and bold lines`;

    const glowDescription = config.glowIntensity < 15 
      ? "a ghostly subtle whisper of energy" 
      : config.glowIntensity < 50 
      ? "a radiant magical atmosphere" 
      : `an intense pulsating energy aura`;

    let vibeDetail = "";
    switch(config.magicVibe) {
      case MagicVibe.GLOWING: vibeDetail = "Surrounded by crystalline light shards."; break;
      case MagicVibe.MYSTERIOUS: vibeDetail = "Wrapped in swirling dark smoke and enigmatic shadows."; break;
      case MagicVibe.ETHEREAL: vibeDetail = "Dusted with shimmering cosmic particles."; break;
    }

    const frameStyle = config.showBorder 
      ? `A high-quality physical collector's card frame with intricate borders.`
      : "No frame, cinematic edge-to-edge composition.";

    const inscriptionInstruction = config.showInscription
      ? `At the bottom of the card, the word "${config.symbolName.toUpperCase()}" is cleanly engraved into the frame.`
      : "Do not add any specific label text for the symbol name.";

    const auraColorStr = config.isMonochrome ? "grayscale contrast levels" : config.auraColor;
    const positionDesc = `The symbol is at the ${config.position.toLowerCase()} with scale ${config.symbolSize}%.`;

    prompt = `
      COLLECTIBLE ART SYNTHESIS.
      OBJECT: Mystical artifact card.
      CENTRAL SYMBOL: "${config.visualTz}".
      COMPOSITION: ${positionDesc}.
      COLOR MODE: ${colorInstruction}.
      STYLE: ${styleBase}.
      TEXT RULES: ${textDrawingInstruction}
      LINE TREATMENT: ${thicknessDesc}.
      ENERGY: ${config.magicVibe}. ${vibeDetail}
      LIGHTING: ${glowDescription} (Aura expressed as ${auraColorStr}).
      BACKGROUND: ${config.backgroundPreset}.
      FRAME: ${frameStyle}
      UI INSCRIPTION: ${inscriptionInstruction}
      TECHNICAL: 8k resolution, crisp textures, dramatic lighting.
    `;
  } else {
    // Association Mode
    prompt = `
      CONCEPTUAL PHILOSOPHICAL ART.
      SUBJECT: "${config.conceptWord}".
      COLOR MODE: ${colorInstruction}.
      STYLE: ${styleBase}. 
      TEXT RULES: ${textDrawingInstruction}
      ATMOSPHERE: Poetic, evocative, masterfully minimalist.
      COMPOSITION: Powerful use of negative space and stark visual metaphor.
      VISUAL METAPHOR: If the subject involves people or crowds, use silhouettes or detailed pen-and-ink figures consistent with the chosen style.
    `;
  }

  const contents: any = {
    parts: [{ text: prompt }]
  };

  if (config.mode === AppMode.SIGIL && config.referenceImage) {
    const base64Data = config.referenceImage.split(',')[1] || config.referenceImage;
    contents.parts.unshift({
      inlineData: {
        mimeType: 'image/png',
        data: base64Data,
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    let imageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    if (!imageUrl) throw new Error("Синтез завершен без данных изображения.");
    return { imageUrl, description: "" };
  } catch (error: any) {
    // Прикрепляем статус к ошибке, если он есть в API ответе
    const enhancedError = new Error(error.message || "Ошибка соединения с Gemini") as any;
    enhancedError.status = error.status || error.code || "API_PROTOCOL_ERROR";
    console.error("Gemini Protocol Error:", enhancedError);
    throw enhancedError;
  }
};
