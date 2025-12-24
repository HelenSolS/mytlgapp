
export enum AppMode {
  SIGIL = 'Сигилы',
  ASSOCIATION = 'Ассоциации'
}

export enum ElementType {
  AIR = 'Воздух',
  WATER = 'Вода',
  FIRE = 'Огонь',
  EARTH = 'Земля',
  AETHER = 'Эфир',
  WEAVING = 'Плетение'
}

export enum BackgroundPreset {
  DARK_MINIMAL = 'Темный минимализм',
  LIGHT_MINIMAL = 'Светлый минимализм',
  COSMIC_NEBULA = 'Космическая туманность',
  HOLOGRAPHIC_GRADIENT = 'Голографический градиент',
  ETHEREAL_MIST = 'Эфирный туман',
  OBSIDIAN_CHAMBER = 'Обсидиановая камера'
}

export enum SymbolPosition {
  CENTER = 'Центр',
  TOP = 'Верх',
  BOTTOM = 'Низ'
}

export enum StrokeStyle {
  SHARP = 'Острые углы',
  ROUNDED = 'Округлые изгибы',
  DYNAMIC = 'Динамичный микс'
}

export enum RenderingStyle {
  CARTOON = 'Карикатурный/Мультяшный',
  COMIC = 'Комикс (Retro/Marvel)',
  PENCIL = 'Карандашный рисунок',
  INK = 'Черно-белая тушь',
  SKETCH = 'Живой эскиз',
  KAWAII = 'Милый (Kawaii)',
  HYPERREALISM = 'Гиперреализм',
  SCHEMATIC = 'Схематичный/Чертеж',
  CONVEX_3D = 'Выпуклый 3D рельеф',
  REALISM = 'Фотореализм'
}

export enum MagicVibe {
  GLOWING = 'Магическое сияние',
  MYSTERIOUS = 'Загадочный шепот',
  ETHEREAL = 'Эфирная пыль'
}

export interface SymbolTemplate {
  id: number;
  name: string;
  nameRu: string;
  element: ElementType;
  visualTz: string;
  baseColor: string;
}

export interface CardConfig {
  mode: AppMode;
  collectionName: string;
  
  // Color controls
  isMonochrome: boolean;

  // Sigil Mode Params
  selectedSymbolId: number;
  strokeStyle: StrokeStyle;
  renderingStyle: RenderingStyle;
  magicVibe: MagicVibe;
  backgroundPreset: BackgroundPreset;
  showBorder: boolean;
  showInscription: boolean;
  allowAiText: boolean; // New: allow AI to draw text in image
  symbolNumber: string;
  symbolName: string;
  element: ElementType;
  visualTz: string;
  auraColor: string;
  lineThickness: number;
  glowIntensity: number;
  symbolSize: number;
  position: SymbolPosition;
  referenceImage?: string;

  // Association Mode Params
  conceptWord: string;
}

export interface GenerationResult {
  imageUrl: string;
  description: string;
}

export const SIGIL_DATABASE: SymbolTemplate[] = [
  { id: 1, name: "The Whisper", nameRu: "Шёпот", element: ElementType.AIR, visualTz: "Thin curved line, gently splitting into two branches", baseColor: "#87CEEB" },
  { id: 2, name: "Gate of Winds", nameRu: "Врата Ветров", element: ElementType.AIR, visualTz: "Two parallel vertical lines, between them a vortex shift", baseColor: "#87CEEB" },
  { id: 12, name: "The Ripple", nameRu: "Рябь", element: ElementType.WATER, visualTz: "Concentric circles, radiating from a point", baseColor: "#00CED1" },
  { id: 23, name: "The Spark", nameRu: "Искра", element: ElementType.FIRE, visualTz: "Small flash: short line + splitting", baseColor: "#FF8C00" },
  { id: 34, name: "Rootmark", nameRu: "Корень", element: ElementType.EARTH, visualTz: "Y-shaped or root-like line", baseColor: "#808000" },
  { id: 45, name: "Thread of Fate", nameRu: "Нить Судьбы", element: ElementType.AETHER, visualTz: "One vertical line - straight, inevitable", baseColor: "#FFD700" },
  { id: 66, name: "Catalyst", nameRu: "Катализатор", element: ElementType.WEAVING, visualTz: "Central point + diverging short rays", baseColor: "#FFD700" }
];
