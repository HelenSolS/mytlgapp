import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types & Constants ---
enum SigilStyle {
  MYSTIC = 'Ancient Mystic',
  CYBER = 'Neo-Circuit',
  VOID = 'Void Singularity',
  AETHER = 'Ethereal Flow',
  COMIC = 'Graphic Artifact'
}

enum Element {
  FIRE = 'Pyrogen',
  WATER = 'Hydro',
  AIR = 'Aero',
  EARTH = 'Geo',
  VOID = 'Void'
}

const STYLE_PROMPTS: Record<string, string> = {
  [SigilStyle.MYSTIC]: 'ancient occult engravings, mystical gold ink, sacred geometry',
  [SigilStyle.CYBER]: 'high-tech neon circuitry, holographic lines, futuristic digital construct',
  [SigilStyle.VOID]: 'dark purple energy, anti-matter particles, obsidian shards',
  [SigilStyle.AETHER]: 'angelic silver light, celestial flow, crystalline structures',
  [SigilStyle.COMIC]: 'bold pop-art outlines, halftone shadows, vibrant comic book energy'
};

const twa = (window as any).Telegram?.WebApp;

const App = () => {
  const [config, setConfig] = useState({
    symbol: 'Dragon', element: Element.FIRE, style: SigilStyle.MYSTIC,
    glow: 70, useText: false
  });
  const [tab, setTab] = useState('essence');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (twa) {
      twa.expand();
      twa.ready();
      twa.setHeaderColor('#05070a');
      twa.MainButton.setText("SYNTHESIZE ARTIFACT");
      twa.MainButton.setParams({ color: '#0ea5e9', text_color: '#ffffff' });
      twa.MainButton.onClick(handleGenerate);
      twa.MainButton.show();
    }
  }, [config, loading]);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    if (twa) {
      twa.MainButton.showProgress();
      twa.HapticFeedback.impactOccurred('heavy');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        A professional magical sigil for a digital collectible.
        Subject: ${config.symbol}. Element: ${config.element}. Style: ${STYLE_PROMPTS[config.style]}.
        Vibe: 1:1, symmetrical, isolated on black background. 
        Glow: ${config.glow}%. ${config.useText ? 'Include mystical runes.' : 'No text.'}
        Ultra-sharp 4k, cinematic lighting.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!part) throw new Error("Aether connection lost.");
      
      setImage(`data:image/png;base64,${part.inlineData.data}`);
      if (twa) twa.HapticFeedback.notificationOccurred('success');
    } catch (err: any) {
      setError("TRANSMISSION ERROR");
      if (twa) twa.HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
      if (twa) twa.MainButton.hideProgress();
    }
  };

  const update = (key: string, val: any) => {
    if (twa) twa.HapticFeedback.impactOccurred('light');
    setConfig(p => ({ ...p, [key]: val }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Premium Header */}
      <header className="px-6 py-5 shrink-0 flex items-center justify-between glass z-50">
        <div>
          <h1 className="text-[10px] font-black tracking-[0.4em] uppercase text-sky-400 font-magic">SigilCraft Elite</h1>
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Aether-Core v3.2 // Online</p>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
        </div>
      </header>

      {/* Altar Area */}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className={`relative w-full max-w-[280px] aspect-square rounded-[2.5rem] overflow-hidden glass sigil-portal transition-all duration-700 ${loading ? 'scale-95 opacity-50' : 'scale-100 opacity-100 shadow-2xl shadow-sky-500/10'}`}>
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
                <p className="mt-4 text-[8px] font-black tracking-[0.4em] text-sky-400 uppercase">Binding...</p>
              </div>
            )}
            
            {image ? (
              <img src={image} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Sigil" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.5">
                  <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
                  <path d="M50 20 L80 75 L20 75 Z" />
                </svg>
                <p className="mt-4 text-[9px] uppercase font-magic tracking-widest">Awaiting Ritual</p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="absolute bottom-4 glass px-4 py-2 rounded-full border-red-500/20">
              <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="glass rounded-t-[3rem] p-6 pb-12 space-y-6 shadow-2xl">
          <nav className="flex gap-2 p-1.5 bg-white/5 rounded-2xl">
            {['essence', 'style', 'ritual'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-sky-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="min-h-[140px] animate-in slide-in-from-bottom-2 duration-300">
            {tab === 'essence' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">Manifestation Object</label>
                  <input 
                    type="text" 
                    value={config.symbol} 
                    onChange={e => update('symbol', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-sky-500/40 transition-all"
                    placeholder="Enter entity..."
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.values(Element).map(e => (
                    <button 
                      key={e} 
                      onClick={() => update('element', e)}
                      className={`h-10 flex items-center justify-center rounded-xl border text-[7px] font-black transition-all ${config.element === e ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-white/5 border-transparent text-slate-500'}`}
                    >
                      {e.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'style' && (
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SigilStyle).map(s => (
                  <button 
                    key={s} 
                    onClick={() => update('style', s)}
                    className={`p-4 rounded-2xl border text-left transition-all ${config.style === s ? 'bg-sky-500/10 border-sky-500/40' : 'bg-white/5 border-transparent opacity-40'}`}
                  >
                    <p className={`text-[9px] font-black uppercase tracking-tight ${config.style === s ? 'text-sky-400' : 'text-white'}`}>{s}</p>
                    <p className="text-[7px] text-slate-500 mt-1 uppercase">Protocol</p>
                  </button>
                ))}
              </div>
            )}

            {tab === 'ritual' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between px-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Aura Potency</label>
                    <span className="text-[10px] font-mono text-sky-400">{config.glow}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-sky-500"
                    value={config.glow} 
                    onChange={e => update('glow', +e.target.value)} 
                  />
                </div>
                <div 
                  onClick={() => update('useText', !config.useText)}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer border border-transparent active:border-sky-500/30 transition-all"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">Inscribe Glyphs</span>
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${config.useText ? 'bg-sky-500' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.useText ? 'left-4.5' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Browser Fallback */}
      {!twa?.initData && (
        <div className="p-6 bg-[#05070a] border-t border-white/5">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-4 bg-sky-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
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
