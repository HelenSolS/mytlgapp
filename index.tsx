import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Константы и Типы ---
enum SigilStyle {
  MYSTIC = 'Древний Магический',
  CYBER = 'Киберпанк-контур',
  VOID = 'Энергия Бездны',
  AETHER = 'Небесный Свет',
  COMIC = 'Графический Арт'
}

enum Element {
  FIRE = 'Огонь',
  WATER = 'Вода',
  AIR = 'Воздух',
  EARTH = 'Земля',
  VOID = 'Пустота'
}

const STYLE_PROMPTS: Record<string, string> = {
  [SigilStyle.MYSTIC]: 'ancient occult engravings, mystical gold ink, sacred geometry, weathered stone, arcane symbols',
  [SigilStyle.CYBER]: 'high-tech neon circuitry, glowing cyan lines, futuristic digital construct, matrix aesthetics',
  [SigilStyle.VOID]: 'dark purple cosmic energy, obsidian shards, glitch effects, deep space void singularity',
  [SigilStyle.AETHER]: 'angelic silver light, celestial flow, crystalline structures, divine aura, heavenly radiance',
  [SigilStyle.COMIC]: 'bold pop-art outlines, halftone shadows, vibrant comic book energy, stylized graphic design'
};

const twa = (window as any).Telegram?.WebApp;

const App = () => {
  const [config, setConfig] = useState({
    symbol: 'Дракон', 
    element: Element.FIRE, 
    style: SigilStyle.MYSTIC,
    power: 80, 
    runes: false
  });
  const [tab, setTab] = useState('main'); // main, style, tuning
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (twa) {
      twa.expand();
      twa.ready();
      twa.setHeaderColor('#0f172a');
      twa.setBackgroundColor('#0f172a');
      
      // Настройка главной кнопки Telegram
      twa.MainButton.setText("СОЗДАТЬ АРТЕФАКТ");
      twa.MainButton.setParams({ 
        color: '#38bdf8', 
        text_color: '#000000',
        is_visible: true 
      });
      
      const onMainButtonClick = () => handleGenerate();
      twa.MainButton.onClick(onMainButtonClick);
      
      return () => twa.MainButton.offClick(onMainButtonClick);
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
      const prompt = `Professional mystical sigil icon for a mobile app. 
        Main Subject: ${config.symbol}. 
        Elemental Essence: ${config.element}. 
        Art Style: ${STYLE_PROMPTS[config.style]}.
        Details: Perfectly centered on solid black background, symmetrical, high-quality magical artifact, 
        glowing effects with ${config.power}% intensity. ${config.runes ? 'Surrounded by ancient mystical runes.' : 'Minimalist clean design.'}
        Sharp edges, 8k resolution, cinematic lighting.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const imagePart = result.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      
      if (!imagePart) {
        throw new Error("Не удалось получить изображение от ИИ.");
      }
      
      setImage(`data:image/png;base64,${imagePart.inlineData.data}`);
      if (twa) twa.HapticFeedback.notificationOccurred('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message?.includes('API_KEY') ? "Ошибка ключа доступа" : "Сбой связи с эфиром ИИ");
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
    <div className="flex flex-col min-h-screen pb-24">
      {/* Шапка */}
      <header className="sticky top-0 z-50 glass-card px-5 py-4 flex items-center justify-between border-b border-white/5">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            <span className="text-sky-400">✧</span> СигилКрафт
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Кузня магических артефактов</p>
        </div>
        <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${loading ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {loading ? 'СОЗДАНИЕ...' : 'ГОТОВ'}
        </div>
      </header>

      {/* Просмотр */}
      <section className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-950 min-h-[350px]">
        <div className={`relative w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden border-2 border-white/5 shadow-2xl transition-all duration-700 ${loading ? 'scale-90 opacity-40 blur-sm' : 'scale-100 shadow-sky-500/10'}`}>
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Artifact" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
              <div className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl opacity-40 text-sky-400">✦</span>
              </div>
              <p className="text-xs font-medium text-slate-500 text-center px-8">Выберите параметры ниже и нажмите кнопку создания</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
              <p className="mt-4 text-xs font-bold text-sky-400 uppercase tracking-widest">Трансмутация...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs font-bold text-red-400 flex items-center gap-2">
              <span>⚠</span> {error}
            </p>
          </div>
        )}
      </section>

      {/* Панель управления */}
      <section className="flex-1 px-5 pt-4 space-y-6">
        {/* Табы */}
        <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-white/5">
          {[
            { id: 'main', label: 'Сущность' },
            { id: 'style', label: 'Стиль' },
            { id: 'tuning', label: 'Опции' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); twa?.HapticFeedback.impactOccurred('light'); }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент табов */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tab === 'main' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Что изобразить?</label>
                <input 
                  type="text" 
                  value={config.symbol} 
                  onChange={e => setConfig(p => ({ ...p, symbol: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  placeholder="Напр: Волк, Глаз, Звезда..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Стихия сущности</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(Element).map(e => (
                    <button 
                      key={e} 
                      onClick={() => update('element', e)}
                      className={`py-3 rounded-xl border font-bold text-[10px] transition-all ${config.element === e ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-slate-800 border-transparent text-slate-500'}`}
                    >
                      {e.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'style' && (
            <div className="grid grid-cols-1 gap-3">
              {Object.values(SigilStyle).map(s => (
                <button 
                  key={s} 
                  onClick={() => update('style', s)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.style === s ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' : 'bg-slate-800 border-transparent text-slate-500'}`}
                >
                  <span className="text-sm font-bold">{s}</span>
                  {config.style === s && <span className="text-lg">✓</span>}
                </button>
              ))}
            </div>
          )}

          {tab === 'tuning' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300">Сила свечения</label>
                  <span className="text-sky-400 font-bold font-mono bg-sky-500/10 px-2 py-0.5 rounded text-sm">{config.power}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="100"
                  value={config.power} 
                  onChange={e => update('power', +e.target.value)} 
                />
              </div>
              <button 
                onClick={() => update('runes', !config.runes)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${config.runes ? 'bg-sky-500/10 border-sky-500/40' : 'bg-slate-800 border-transparent'}`}
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Магические руны</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Добавить древние письмена вокруг</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${config.runes ? 'bg-sky-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.runes ? 'left-7' : 'left-1'}`} />
                </div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Кнопка-заглушка для веба (в ТГ будет MainButton) */}
      {!twa?.initData && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-900 border-t border-white/5 safe-area-bottom">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-4 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95"
          >
            {loading ? 'Создание...' : 'Создать артефакт'}
          </button>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
