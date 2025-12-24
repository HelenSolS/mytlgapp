
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SigilConfig, 
  SigilStyle, 
  MagicElement, 
  TabType 
} from './types.ts';
import { DEFAULT_CONFIG } from './constants.ts';
import { 
  initTWA, 
  setMainButton, 
  showMainButtonLoading, 
  triggerHaptic, 
  saveConfigToCloud, 
  loadConfigFromCloud,
  shareImage
} from './services/twaService.ts';
import { generateSigil } from './services/geminiService.ts';

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-[10px] font-black border-b-2 transition-all tracking-widest ${
      active 
        ? 'border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)]' 
        : 'border-transparent text-[var(--tg-theme-hint-color)] opacity-50'
    }`}
  >
    {label}
  </button>
);

const ControlGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-6">
    <label className="block text-[var(--tg-theme-hint-color)] text-[9px] uppercase mb-2 font-black tracking-[0.2em]">{label}</label>
    <div className="space-y-2">{children}</div>
  </div>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<SigilConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.BASE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [error, setError] = useState<{message: string, code?: string} | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const twa = (window as any).Telegram?.WebApp;
    if (twa?.initData) {
      setIsTelegram(true);
      initTWA();
      loadConfigFromCloud((saved) => {
        if (saved) setConfig(saved);
      });
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    showMainButtonLoading(true);
    triggerHaptic('impact', 'medium');

    try {
      const result = await generateSigil(config, refImage || undefined);
      setGeneratedImage(result);
      triggerHaptic('notification', 'success');
      saveConfigToCloud(config);
    } catch (err: any) {
      setError({ 
        message: err.message || 'Transmission failed. The aether is unstable.',
        code: err.status?.toString() || 'VOID_ERR'
      });
      triggerHaptic('notification', 'error');
    } finally {
      setIsLoading(false);
      showMainButtonLoading(false);
    }
  }, [config, isLoading, refImage]);

  useEffect(() => {
    if (isTelegram) {
      setMainButton(isLoading ? 'Transmuting...' : 'Synthesize Sigil', handleGenerate, true);
    }
  }, [isLoading, handleGenerate, isTelegram]);

  const updateConfig = <K extends keyof SigilConfig>(key: K, value: SigilConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImage(reader.result as string);
        triggerHaptic('impact', 'light');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] select-none">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/5 shrink-0 z-20 bg-[var(--tg-theme-bg-color)]">
        <div>
          <h1 className="text-[11px] font-black uppercase tracking-tighter text-[var(--tg-theme-button-color)]">SigilCraft Engine</h1>
          <p className="text-[8px] opacity-40 font-mono">v2.5.0-flash // {config.style.toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
      </div>

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1e1e1e] w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="font-black text-xs mb-2 uppercase tracking-widest text-white">Critical Error</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{error.message}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="w-full py-4 bg-white/5 text-[10px] font-black tracking-widest border-t border-white/5 active:bg-white/10 transition-colors"
            >
              CLOSE PROTOCOL
            </button>
          </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className="relative w-full aspect-square bg-black overflow-hidden shrink-0 group">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90 backdrop-blur-xl">
             <div className="w-20 h-20 relative">
                <div className="absolute inset-0 border-2 border-sky-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-t-2 border-sky-400 rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-2 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-4 border-b-2 border-purple-400 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
             </div>
             <p className="mt-8 text-[9px] font-black uppercase tracking-[0.4em] text-sky-400 animate-pulse">Synthesizing Artifact...</p>
          </div>
        )}
        
        {generatedImage ? (
          <div className="relative h-full w-full">
            <img src={generatedImage} alt="Sigil" className="w-full h-full object-cover animate-in fade-in zoom-in-90 duration-700" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between p-4">
               <button 
                  onClick={() => { triggerHaptic('impact', 'medium'); shareImage(generatedImage); }}
                  className="bg-sky-500 hover:bg-sky-400 px-4 py-2 rounded-full text-[10px] font-black text-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Share Artifact
                </button>
                <div className="text-right">
                   <p className="text-[8px] font-bold text-white/40 uppercase">Authenticity</p>
                   <p className="text-[10px] font-mono text-sky-400">#99.9% VERIFIED</p>
                </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#020617]">
             <div className="relative w-48 h-48 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                   <path d="M50 5 L95 80 L5 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                   <circle cx="50" cy="50" r="10" fill="currentColor" />
                </svg>
             </div>
             <p className="absolute text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Awaiting Ritual</p>
          </div>
        )}
        
        {refImage && (
          <div className="absolute top-4 left-4 w-12 h-12 border border-white/20 rounded-xl overflow-hidden shadow-2xl">
            <img src={refImage} className="w-full h-full object-cover" alt="Ref" />
            <button 
              onClick={() => { setRefImage(null); triggerHaptic('impact', 'light'); }}
              className="absolute inset-0 bg-red-500/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <span className="text-[10px] font-bold text-white">X</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex bg-[#1e293b]/50 backdrop-blur-md border-b border-white/5 shrink-0">
        <TabButton active={activeTab === TabType.BASE} label="BASE" onClick={() => setActiveTab(TabType.BASE)} />
        <TabButton active={activeTab === TabType.STYLE} label="STYLE" onClick={() => setActiveTab(TabType.STYLE)} />
        <TabButton active={activeTab === TabType.TUNING} label="TUNING" onClick={() => setActiveTab(TabType.TUNING)} />
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
        {activeTab === TabType.BASE && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <ControlGroup label="Ritual Subject">
              <input 
                type="text" 
                value={config.symbol}
                onChange={(e) => updateConfig('symbol', e.target.value)}
                placeholder="Phoenix, Skull, Lotus..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-1 focus:ring-sky-400 outline-none text-white transition-all"
              />
            </ControlGroup>
            
            <ControlGroup label="Elemental Core">
              <div className="grid grid-cols-3 gap-3">
                {Object.values(MagicElement).map(el => (
                  <button
                    key={el}
                    onClick={() => { triggerHaptic('impact', 'light'); updateConfig('element', el); }}
                    className={`py-3 text-[9px] font-black rounded-xl border transition-all ${
                      config.element === el 
                        ? 'bg-sky-500 border-sky-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                        : 'bg-white/5 border-transparent text-white/40'
                    }`}
                  >
                    {el.toUpperCase()}
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Visual Anchor">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-white/10 rounded-2xl text-white/30 hover:bg-white/5 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3" /></svg>
                <span className="text-[9px] font-black tracking-widest uppercase">{refImage ? 'Update Scan' : 'Initiate Visual Scan'}</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </ControlGroup>
          </div>
        )}

        {activeTab === TabType.STYLE && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <ControlGroup label="Aesthetic Protocol">
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SigilStyle).map(s => (
                  <button
                    key={s}
                    onClick={() => { triggerHaptic('impact', 'light'); updateConfig('style', s); }}
                    className={`p-4 text-[9px] font-black rounded-xl border text-left leading-tight transition-all ${
                      config.style === s 
                        ? 'bg-sky-500 border-sky-500 text-black shadow-lg' 
                        : 'bg-white/5 border-transparent text-white/50'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Energy Color">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <input 
                  type="color" 
                  value={config.color}
                  onChange={(e) => updateConfig('color', e.target.value)}
                  className="h-10 w-14 bg-transparent border-none outline-none cursor-pointer rounded-lg overflow-hidden"
                />
                <input 
                  type="text" 
                  value={config.color.toUpperCase()}
                  onChange={(e) => updateConfig('color', e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 text-sm font-mono font-bold tracking-[0.2em] outline-none text-sky-400"
                />
              </div>
            </ControlGroup>

            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl mt-4 border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Legible Glyphs</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase">AI Text Deciphering</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.aiTextAllowed}
                  onChange={(e) => { triggerHaptic('impact', 'light'); updateConfig('aiTextAllowed', e.target.checked); }}
                  className="sr-only peer" 
                />
                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-400 peer-checked:after:bg-black shadow-inner"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === TabType.TUNING && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-10 py-4">
            <ControlGroup label={`Spectral Density: ${config.thickness}%`}>
              <input 
                type="range" min="1" max="100" 
                value={config.thickness} 
                onChange={(e) => updateConfig('thickness', parseInt(e.target.value))}
                className="accent-sky-400"
              />
            </ControlGroup>
            <ControlGroup label={`Aura Glow: ${config.glow}%`}>
              <input 
                type="range" min="1" max="100" 
                value={config.glow} 
                onChange={(e) => updateConfig('glow', parseInt(e.target.value))}
                className="accent-purple-500"
              />
            </ControlGroup>
            <ControlGroup label={`Vertical Pivot: ${config.position}%`}>
              <input 
                type="range" min="1" max="100" 
                value={config.position} 
                onChange={(e) => updateConfig('position', parseInt(e.target.value))}
                className="accent-white"
              />
            </ControlGroup>

            <div className="bg-[#0f172a] p-6 rounded-3xl border border-sky-500/10 shadow-inner">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/80">Transmission Protocol Active</span>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-mono opacity-40 uppercase">
                     <span>Model Chain</span>
                     <span className="text-white">Gemini_2.5_Flash_v1</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono opacity-40 uppercase">
                     <span>Target Ratio</span>
                     <span className="text-white">1:1 Square Collectible</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono opacity-40 uppercase">
                     <span>Sync Status</span>
                     <span className="text-green-500">Cloud_Ready</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Fallback button for Browser Preview */}
      {!isTelegram && (
        <div className="fixed bottom-6 left-6 right-6 z-[60] animate-in slide-in-from-bottom-10 duration-700 delay-300">
           <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${
                isLoading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-black active:scale-95 active:bg-sky-400'
              }`}
           >
              {isLoading ? 'Processing Ritual...' : 'Synthesize Artifact'}
           </button>
        </div>
      )}

      {/* Footer Decoration */}
      <div className="px-4 py-3 bg-[var(--tg-theme-bg-color)] text-center border-t border-white/5 opacity-20">
        <p className="text-[7px] font-black uppercase tracking-[0.6em]">Aesthetica Divina • Digital Forge</p>
      </div>
    </div>
  );
};

export default App;
