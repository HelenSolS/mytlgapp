
import { SigilStyle, MagicElement } from './types';

export const STYLE_PROMPTS: Record<SigilStyle, string> = {
  [SigilStyle.CYBERPUNK]: 'cyberpunk aesthetic, high tech, low life, neon circuits, holographic projections, metallic textures',
  [SigilStyle.MEDIEVAL]: 'gothic medieval, hand-drawn on parchment, ink and quill, illuminated manuscript details',
  [SigilStyle.COSMIC]: 'nebula background, stardust particles, galaxy clusters, celestial geometry, glowing constellations',
  [SigilStyle.ETHEREAL]: 'soft light, dreamlike, translucent layers, angelic presence, wispy smoke, crystalline textures',
  [SigilStyle.DARK_ALCHEMY]: 'occult symbols, heavy shadows, rusted iron, obsidian, ritualistic atmosphere, dark magical energy',
  [SigilStyle.COMIC]: 'retro marvel comic book style, halftone patterns, bold outlines, 60s pop art vibes, cinematic action frames',
  [SigilStyle.SOLARPUNK]: 'lush greenery, golden sunlight, white ceramic, sustainable tech integration, floral patterns, optimistic future',
  [SigilStyle.VOID]: 'infinite darkness, glitch effects, distorted reality, non-euclidean geometry, purple and black hues',
  [SigilStyle.NEON]: 'vibrant synthwave colors, glowing tubes, futuristic city lights, ultra-high contrast, 80s aesthetic',
  [SigilStyle.ANCIENT_SCROLL]: 'weathered papyrus, Egyptian hieroglyphic influences, dusty textures, ancient wisdom vibes'
};

export const ELEMENT_PROMPTS: Record<MagicElement, string> = {
  [MagicElement.FIRE]: 'burning embers, intense heat, orange and red flames, volcanic sparks',
  [MagicElement.WATER]: 'fluid motion, crystalline water, deep blue waves, aquatic ripples, bubbles',
  [MagicElement.EARTH]: 'rocky textures, brown and green moss, sturdy minerals, cracked ground, roots',
  [MagicElement.AIR]: 'swirling winds, clouds, translucent white trails, feather-light particles',
  [MagicElement.ETHER]: 'purple mist, divine light, magical essence, shimmering energy, spiritual aura',
  [MagicElement.VOID]: 'black holes, dark matter, nothingness, anti-light effects, absolute shadow'
};

export const DEFAULT_CONFIG = {
  symbol: 'Phoenix',
  element: MagicElement.FIRE,
  style: SigilStyle.CYBERPUNK,
  color: '#ff4400',
  aiTextAllowed: false,
  thickness: 50,
  glow: 70,
  position: 50
};
