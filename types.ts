
export enum SigilStyle {
  CYBERPUNK = 'Cyberpunk',
  MEDIEVAL = 'Medieval',
  COSMIC = 'Cosmic',
  ETHEREAL = 'Ethereal',
  DARK_ALCHEMY = 'Dark Alchemy',
  COMIC = 'Comic (Retro/Marvel)',
  SOLARPUNK = 'Solarpunk',
  VOID = 'Void',
  NEON = 'Neon',
  ANCIENT_SCROLL = 'Ancient Scroll'
}

export enum MagicElement {
  FIRE = 'Fire',
  WATER = 'Water',
  EARTH = 'Earth',
  AIR = 'Air',
  ETHER = 'Ether',
  VOID = 'Void'
}

export enum TabType {
  BASE = 'Base',
  STYLE = 'Style',
  TUNING = 'Tuning'
}

export interface SigilConfig {
  symbol: string;
  element: MagicElement;
  style: SigilStyle;
  color: string;
  aiTextAllowed: boolean;
  thickness: number;
  glow: number;
  position: number;
}

declare global {
  interface Window {
    Telegram: any;
  }
}
