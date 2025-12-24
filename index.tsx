import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import * as Api from './api-core';
import { SIGILS_CANON, SigilDef, ElementType } from './sigils-canon';

const twa = (window as any).Telegram?.WebApp;

const STYLES = [
  { id: 'convex', name: 'Барельеф', prompt: '3D physical black obsidian stone relief, metallic glowing engraving, hyper-detailed' },
  { id: 'comic', name: 'Комикс', prompt: 'Modern graphic novel style, deep ink lines, vibrant magical accents, cel-shaded' },
  { id: 'newspaper', name: 'Газета', prompt: 'Vintage monochrome newspaper illustration, rough ink, stippling, 1920s print aesthetic' },
  { id: 'kawaii', name: 'Kawaii', prompt: 'Cute magical aesthetic, soft rounded shapes, glowing pastel colors, friendly spirit' },
  { id: 'photo', name: 'Фото', prompt: 'Macro photography of an ancient physical artifact, real materials, dramatic cinematic lighting' }
];

const App = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'card' | 'sketch'>('card');
  const [activeTab, setActiveTab] = useState('main');
  
  // Settings
  const [selectedElement, setSelectedElement] = useState<ElementType>('Воздух');
  const [selectedSigil, setSelectedSigil] = useState(SIGILS_CANON[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const [config, setConfig] = useState({ glow: 80, size: 60, inscription: true });
  
  const [conceptInput, setConceptInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Api.checkAuth().then(setHasKey);
    if (twa) { 
      twa.expand(); 
      twa.ready();
    }
  }, []);

  const handleAuth = async () => {
    const success = await Api.openKeyDialog();
    if (success) {
      setHasKey(true);
    }
  };

  const filteredSigils = useMemo(() => 
    SIGILS_CANON.filter(s => s.element === selectedElement), 
    [selectedElement]
  );

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const ai = Api.getGeminiClient();
      let prompt = "";
      let aspectRatio: "1:1" | "9:16" = "1:1";

      if (mode === 'card') {
        aspectRatio = "1:1";
        prompt = `SIGIL CARD: "${selectedSigil.name}". 
          CANON SHAPE: ${selectedSigil.tz}. 
          ELEMENT: ${selectedSigil.element}.
          VISUAL STYLE: ${style.prompt}. 
          COLORS: ${isBlackAndWhite ? 'Pure black and white' : `Magical ${selectedSigil.aura} energy glow`}.
          COMPOSITION: Symmetrical central sigil, size ${config.size}%, glowing intensity ${config.glow}%.
          BACKGROUND: Dark mystical void.
          ${config.inscription ? `TEXT: Engrave "${selectedSigil.id}. ${selectedSigil.name}" on the bottom edge.` : ''}
          High-end collectible card design.`;
      } else {
        aspectRatio = "9:16";
        prompt = `MYSTICAL SKETCH: ${conceptInput || 'Ancient revelation'}. 
          STYLE: ${style.prompt}. 
          PALETTE: ${isBlackAndWhite ? 'Monochrome ink on paper' : 'Vibrant ethereal colors'}.
          ATMOSPHERE: Mysterious, sacred, artistic masterpiece.`;
      }

      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio, imageSize: "1K" } }
      });

      const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!part) throw new Error("Модель не вернула изображение. Попробуйте другой промпт.");
      
      setImage(`data:image/png;base64,${part.inlineData.data}`);
    } catch (err: any) {
      if (Api.isAuthError(err)) {
        setHasKey(false);
        setError("Ошибка авторизации. Обновите ключ.");
      } else {
        setError(err.message || "Ошибка при создании артефакта.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-10 bg-[#030712] text-center">
        <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mb-8 border border-sky-500/20 shadow-2xl">
          <span className="text-4xl">🔐</span>
        </div>
        <h1 className="text-2xl font-black uppercase text-white mb-4 tracking-tighter">SigilCraft Elite</h1>
        <p className="text-slate-500 text-xs mb-10 leading-relaxed">Для работы с Gemini 3 Pro необходимо выбрать API ключ с активированным биллингом.</p>
        <button onClick={handleAuth} className="w-full py-5 bg-sky-500 text-black font-black rounded-2xl uppercase tracking-widest text-xs btn-active shadow-xl shadow-sky-500/20">Авторизоваться</button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="mt-6 text-[10px] text-slate-600 underline">Документация по биллингу</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#030712] text-white">
      {/* HEADER */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center glass border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Engine v2.1</span>
          <h1 className="text-lg font-black uppercase">SigilCraft</h1>
        </div>
        <div className="flex p-1 bg-black/50 rounded-xl border border-white/10">
          <button onClick={() => setMode('card')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'card' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-500'}`}>Карты</button>
          <button onClick={() => setMode('sketch')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'sketch' ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'text-slate-500'}`}>Скетчи</button>
        </div>
      </header>

      {/* VIEWPORT */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className={`relative w-full max-w-[320px] ${mode === 'card' ? 'aspect-square' : 'aspect-[9/16]'} rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-700 ${loading ? 'scale-90 blur-xl opacity-50' : 'scale-100 opacity-100'}`}>
          {image ? (
            <img src={image} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center border border-white/5">
              <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <span className="text-xl opacity-20">✧</span>
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Ожидание синтеза</p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
        {error && <p className="mt-4 text-[10px] font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">{error}</p>}
      </main>

      {/* CONTROLS */}
      <section className="bg-[#111827] rounded-t-[3rem] p-8 shadow-2xl border-t border-white/5 pb-10">
        <div className="flex gap-8 mb-8 overflow-x-auto no-scrollbar border-b border-white/5">
          {['main', 'style', 'tuning'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`text-xs font-black uppercase tracking-widest pb-4 transition-all whitespace-nowrap ${activeTab === t ? 'text-sky-400 border-b-2 border-sky-500' : 'text-slate-600'}`}>
              {t === 'main' ? 'База' : t === 'style' ? 'Стиль' : 'Тюнинг'}
            </button>
          ))}
        </div>

        <div className="min-h-[140px] max-h-[220px] overflow-y-auto no-scrollbar">
          {activeTab === 'main' && (
            <div className="space-y-6">
              {mode === 'card' ? (
                <>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'].map(el => (
                      <button key={el} onClick={() => setSelectedElement(el as ElementType)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedElement === el ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}>{el}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredSigils.map(s => (
                      <button key={s.id} onClick={() => setSelectedSigil(s)} className={`p-4 rounded-2xl border text-left transition-all ${selectedSigil.id === s.id ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-black/20 border-white/5 text-slate-500'}`}>
                        <p className="text-[10px] font-black uppercase">{s.id}. {s.name}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <textarea 
                  value={conceptInput} 
                  onChange={e => setConceptInput(e.target.value)} 
                  className="w-full h-28 bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-700" 
                  placeholder="Опишите ваше видение (например: Сердце древнего леса или Кровь дракона)..." 
                />
              )}
            </div>
          )}

          {activeTab === 'style' && (
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s)} className={`p-5 rounded-2xl border text-left transition-all ${style.id === s.id ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-black/20 border-white/5 text-slate-600'}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider">{s.name}</p>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'tuning' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Сияние</span>
                  <span className="text-[10px] font-black text-sky-500">{config.glow}%</span>
                </div>
                <input type="range" min="0" max="100" value={config.glow} onChange={e => setConfig(p => ({...p, glow: +e.target.value}))} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Масштаб символа</span>
                  <span className="text-[10px] font-black text-sky-500">{config.size}%</span>
                </div>
                <input type="range" min="20" max="100" value={config.size} onChange={e => setConfig(p => ({...p, size: +e.target.value}))} />
              </div>
              <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-xs font-black uppercase">Черно-белый стиль</span>
                <button onClick={() => setIsBlackAndWhite(!isBlackAndWhite)} className={`w-12 h-6 rounded-full relative transition-all ${isBlackAndWhite ? 'bg-sky-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isBlackAndWhite ? 'left-7 shadow-lg shadow-black/20' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={generate} 
          disabled={loading} 
          className="w-full mt-8 py-5 bg-sky-500 text-black font-black rounded-2xl uppercase text-[11px] btn-active disabled:opacity-50 tracking-[0.2em] shadow-2xl shadow-sky-500/20"
        >
          {loading ? 'Процесс синтеза...' : 'Начать Материализацию'}
        </button>
      </section>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
