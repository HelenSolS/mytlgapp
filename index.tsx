import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
enum SigilStyle {
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

enum MagicElement {
  FIRE = 'Fire',
  WATER = 'Water',
  EARTH = 'Earth',
  AIR = 'Air',
  ETHER = 'Ether',
  VOID = 'Void'
}

enum TabType {
  BASE = 'Base',
  STYLE = 'Style',
  TUNING = 'Tuning'
}

interface SigilConfig {
  symbol: string;
  element: MagicElement;
  style: SigilStyle;
  color: string;
  aiTextAllowed: boolean;
  thickness: number;
  glow: number;
  position: number;
}

// --- CONSTANTS ---
const STYLE_PROMPTS: Record<SigilStyle, string> = {
  [SigilStyle.CYBERPUNK]: 'cyberpunk aesthetic, neon circuits, holographic projections, metallic textures',
  [SigilStyle.MEDIEVAL]: 'gothic medieval, hand-drawn on parchment, ink and quill',
  [SigilStyle.COSMIC]: 'nebula background, celestial geometry, glowing constellations',
  [SigilStyle.ETHEREAL]: 'soft light, dreamlike, translucent layers, angelic presence',
  [SigilStyle.DARK_ALCHEMY]: 'occult symbols, heavy shadows, obsidian, ritualistic atmosphere',
  [SigilStyle.COMIC]: 'retro marvel comic book style, halftone patterns, bold outlines',
  [SigilStyle.SOLARPUNK]: 'lush greenery, golden sunlight, white ceramic, sustainable tech',
  [SigilStyle.VOID]: 'infinite darkness, glitch effects, distorted reality, purple and black',
  [SigilStyle.NEON]: 'vibrant synthwave colors, glowing tubes, futuristic city lights',
  [SigilStyle.ANCIENT_SCROLL]: 'weathered papyrus, Egyptian hieroglyphic influences'
};

const ELEMENT_PROMPTS: Record<MagicElement, string> = {
  [MagicElement.FIRE]: 'burning embers, intense heat, orange and red flames',
  [MagicElement.WATER]: 'fluid motion, crystalline water, deep blue waves',
  [MagicElement.EARTH]: 'rocky textures, brown and green moss, sturdy minerals',
  [MagicElement.AIR]: 'swirling winds, clouds, translucent white trails',
  [MagicElement.ETHER]: 'purple mist, divine light, shimmering energy',
  [MagicElement.VOID]: 'black holes, dark matter, anti-light effects'
};

const DEFAULT_CONFIG: SigilConfig = {
  symbol: 'Phoenix',
  element: MagicElement.FIRE,
  style: SigilStyle.CYBERPUNK,
  color: '#38bdf8',
  aiTextAllowed: false,
  thickness: 50,
  glow: 70,
  position: 50
};

// --- SERVICES ---
const twa = (window as any).Telegram?.WebApp;

const triggerHaptic = (type: 'impact' | 'notification', style: string) => {
  if (twa?.HapticFeedback) {
    if (type === 'impact') twa.HapticFeedback.impactOccurred(style);
    else twa.HapticFeedback.notificationOccurred(style);
  }
};

const generateSigil = async (config: SigilConfig, refImage?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Centralized magical sigil. Subject: ${config.symbol}. 
    Element: ${ELEMENT_PROMPTS[config.element]}. 
    Style: ${STYLE_PROMPTS[config.style]}. 
    Color: ${config.color}. 
    Glow: ${config.glow}%. Thickness: ${config.thickness}%.
    ${config.aiTextAllowed ? "Include mystical readable glyphs." : "No readable text."}
    1:1 square, black background, mystical artifact.
  `;

  const contents: any = { parts: [{ text: prompt }] };
  if (refImage) {
    contents.parts.push({
      inlineData: {
        data: refImage.split(',')[1],
        mimeType: 'image/jpeg'
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part) throw new Error("Portal connection unstable.");
  return `data:image/png;base64,${part.inlineData.data}`;
};

// --- COMPONENTS ---
const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-[10px] font-black border-b-2 transition-all tracking-widest ${
      active 
        ? 'border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)]' 
        : 'border-transparent text-[var(--tg-theme-hint-color)] opacity-40'
    }`}
  >
    {label}
  </button>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<SigilConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.BASE);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (twa) {
      twa.expand();
      twa.ready();
      twa.MainButton.setText("SYNTHESIZE ARTIFACT");
      twa.MainButton.onClick(handleGenerate);
      twa.MainButton.show();
    }
  }, [config, refImage, loading]);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    triggerHaptic('impact', 'medium');
    if (twa) twa.MainButton.showProgress();

    try {
      const result = await generateSigil(config, refImage || undefined);
      setImage(result);
      triggerHaptic('notification', 'success');
    } catch (err: any) {
      setError(err.message);
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
      if (twa) twa.MainButton.hideProgress();
    }
  };

  const updateConfig = (key: keyof SigilConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-[12px] font-black tracking-tighter text-sky-400 uppercase">SigilCraft</h1>
          <p className="text-[8px] opacity-30 font-mono uppercase tracking-widest">Aether-Core v2.5</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
      </div>

      {/* Preview Area */}
      <div className="relative w-full aspect-square bg-[#020617] flex items-center justify-center overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <p className="mt-4 text-[9px] font-black tracking-[0.3em] text-sky-400 uppercase">Transmuting...</p>
          </div>
        )}

        {image ? (
          <img src={image} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
        ) : (
          <div className="opacity-10 scale-75">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="white">
              <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeDasharray="4 4" />
              <path d="M50 5 L95 80 L5 80 Z" strokeWidth="0.5" />
            </svg>
          </div>
        )}

        {error && (
          <div className="absolute inset-x-6 bottom-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] text-red-400 font-bold text-center uppercase">{error}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5">
        <TabButton active={activeTab === TabType.BASE} label="BASE" onClick={() => setActiveTab(TabType.BASE)} />
        <TabButton active={activeTab === TabType.STYLE} label="STYLE" onClick={() => setActiveTab(TabType.STYLE)} />
        <TabButton active={activeTab === TabType.TUNING} label="TUNING" onClick={() => setActiveTab(TabType.TUNING)} />
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        {activeTab === TabType.BASE && (
          <>
            <div>
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 block">Sigil Subject</label>
              <input 
                type="text" 
                value={config.symbol} 
                onChange={e => updateConfig('symbol', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 block">Element</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(MagicElement).map(el => (
                  <button 
                    key={el}
                    onClick={() => updateConfig('element', el)}
                    className={`py-3 text-[9px] font-black rounded-lg border transition-all ${config.element === el ? 'bg-sky-500 border-sky-500 text-black' : 'bg-white/5 border-transparent text-white/40'}`}
                  >
                    {el.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === TabType.STYLE && (
          <div className="grid grid-cols-2 gap-2">
            {Object.values(SigilStyle).map(s => (
              <button 
                key={s}
                onClick={() => updateConfig('style', s)}
                className={`p-3 text-[9px] font-black text-left rounded-lg border transition-all ${config.style === s ? 'bg-sky-500 border-sky-500 text-black' : 'bg-white/5 border-transparent text-white/40'}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {activeTab === TabType.TUNING && (
          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-[9px] font-black text-white/30 uppercase mb-4">
                <span>Density</span>
                <span className="text-sky-400">{config.thickness}%</span>
              </label>
              <input type="range" className="w-full accent-sky-500" value={config.thickness} onChange={e => updateConfig('thickness', +e.target.value)} />
            </div>
            <div>
              <label className="flex justify-between text-[9px] font-black text-white/30 uppercase mb-4">
                <span>Glow</span>
                <span className="text-purple-400">{config.glow}%</span>
              </label>
              <input type="range" className="w-full accent-purple-500" value={config.glow} onChange={e => updateConfig('glow', +e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Only show Browser button if NOT in Telegram */}
      {!(window as any).Telegram?.WebApp?.initData && (
        <div className="fixed bottom-6 inset-x-6">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-4 bg-white text-black text-[11px] font-black rounded-2xl uppercase tracking-[0.2em] active:scale-95 transition-transform"
          >
            {loading ? 'Synthesizing...' : 'Synthesize Artifact'}
          </button>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
