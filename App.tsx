
import React, { useState, useEffect } from 'react';
import { 
  CardConfig, 
  SymbolPosition, 
  GenerationResult, 
  SIGIL_DATABASE,
  StrokeStyle,
  RenderingStyle,
  MagicVibe,
  BackgroundPreset,
  AppMode
} from './types';
import ControlPanel from './components/ControlPanel';
import { generateCardImage } from './services/geminiService';

// Инициализация Telegram WebApp
const tg = (window as any).Telegram?.WebApp;

const FIRST_SYMBOL = SIGIL_DATABASE[0];

const INITIAL_CONFIG: CardConfig = {
  mode: AppMode.SIGIL,
  collectionName: 'Хроники Этериса',
  isMonochrome: false,
  strokeStyle: StrokeStyle.DYNAMIC,
  renderingStyle: RenderingStyle.CONVEX_3D,
  magicVibe: MagicVibe.GLOWING,
  backgroundPreset: BackgroundPreset.DARK_MINIMAL,
  showBorder: true,
  showInscription: false,
  allowAiText: false,
  selectedSymbolId: FIRST_SYMBOL.id,
  symbolNumber: '#001',
  symbolName: FIRST_SYMBOL.nameRu,
  element: FIRST_SYMBOL.element,
  visualTz: FIRST_SYMBOL.visualTz,
  auraColor: FIRST_SYMBOL.baseColor,
  lineThickness: 2.0,
  glowIntensity: 20,
  symbolSize: 55,
  position: SymbolPosition.CENTER,
  conceptWord: ''
};

const App: React.FC = () => {
  const [config, setConfig] = useState<CardConfig>(() => {
    const saved = localStorage.getItem('sigil_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        delete parsed.referenceImage; // Не сохраняем тяжелые данные в localStorage
        return { ...INITIAL_CONFIG, ...parsed };
      } catch (e) {
        return INITIAL_CONFIG;
      }
    }
    return INITIAL_CONFIG;
  });
  
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация Telegram при запуске
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Установка цвета темы Telegram (опционально)
      if (tg.themeParams?.bg_color) {
        document.body.style.backgroundColor = tg.themeParams.bg_color;
      }
    }
  }, []);

  // Сохранение настроек
  useEffect(() => {
    const storageConfig = { ...config };
    delete (storageConfig as any).referenceImage;
    localStorage.setItem('sigil_config', JSON.stringify(storageConfig));
  }, [config]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateCardImage(config);
      setResult(res);
      setHistory(prev => [res, ...prev].slice(0, 5));
      
      // Виброотклик Telegram при успехе
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    } catch (err: any) {
      setError(err.message || "Ошибка протокола синтеза");
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    const fileName = config.mode === AppMode.SIGIL ? config.symbolName : (config.conceptWord?.slice(0, 10) || 'art');
    link.download = `sigil-${fileName.toLowerCase()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] overflow-hidden font-sans text-white">
      {/* Sidebar Control Panel (Scrollable on desktop, fixed height or scrollable on mobile) */}
      <aside className="w-full md:w-[400px] h-[50vh] md:h-full flex-shrink-0 z-20 shadow-2xl relative border-b md:border-b-0 md:border-r border-white/5 bg-[#0a0a0a] overflow-hidden">
        <ControlPanel 
          config={config} 
          onChange={setConfig} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
        />
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:80px_80px] pointer-events-none"></div>

        {/* Top Info Bar (Desktop only or compact on mobile) */}
        <div className="absolute top-4 md:top-10 left-6 md:left-12 right-6 md:right-12 flex justify-between items-center border-b border-white/[0.05] pb-4 md:pb-6 z-10">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] text-indigo-500 font-black tracking-widest uppercase mb-1">{config.mode}</span>
            <h2 className="text-lg md:text-2xl font-black text-white tracking-tighter uppercase italic truncate max-w-[200px] md:max-w-[400px]">
              {config.mode === AppMode.SIGIL ? config.symbolName : (config.conceptWord || 'Ожидание')}
            </h2>
          </div>
          <div className="flex gap-2">
            {result && (
              <button 
                onClick={downloadImage} 
                className="flex items-center gap-2 bg-white/5 hover:bg-white hover:text-black text-gray-400 px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase transition-all border border-white/10 shadow-xl"
              >
                <i className="fa-solid fa-download"></i> <span className="hidden sm:inline">Экспорт</span>
              </button>
            )}
          </div>
        </div>

        {/* Art Frame */}
        <div className="relative z-10 w-full max-w-[320px] sm:max-w-[500px] md:max-w-[700px] aspect-square rounded-[2rem] md:rounded-[3.5rem] overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,1)] border border-white/[0.08] group transition-all duration-700">
          {isGenerating && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-40 animate-scan"></div>
          )}
          
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30">
              <div className="relative w-24 h-24 md:w-40 md:h-40 mb-4 md:mb-8">
                <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500/10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-indigo-500" strokeDasharray="60 180" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className={`fa-solid ${config.mode === AppMode.SIGIL ? 'fa-atom' : 'fa-brain'} text-indigo-500 text-2xl md:text-4xl animate-pulse`}></i>
                </div>
              </div>
              <div className="text-[10px] md:text-[14px] text-indigo-400 font-black tracking-[0.4em] uppercase animate-pulse">Синтез...</div>
            </div>
          ) : result ? (
            <img src={result.imageUrl} alt="Artifact" className="w-full h-full object-cover p-0.5 animate-fadeIn" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 opacity-20">
              <i className="fa-solid fa-fingerprint text-gray-700 text-5xl md:text-7xl mb-4 md:mb-8"></i>
              <h3 className="text-lg md:text-2xl font-black text-white/50 mb-2 uppercase italic tracking-widest">Готов к работе</h3>
              <p className="text-[8px] md:text-xs text-gray-700 uppercase tracking-widest font-bold">Настройте параметры выше</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-xl flex items-center justify-center z-50 p-6 md:p-12">
              <div className="bg-black/90 border border-red-500/30 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center max-w-sm shadow-2xl">
                <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl md:text-3xl mb-4"></i>
                <p className="text-red-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mb-2">Ошибка</p>
                <p className="text-white text-xs md:text-sm font-medium mb-6">{error}</p>
                <button onClick={() => setError(null)} className="px-6 md:px-8 py-2 md:py-3 bg-white text-black text-[8px] md:text-[10px] font-black uppercase rounded-full tracking-widest">Сброс</button>
              </div>
            </div>
          )}
        </div>

        {/* History Chips (Horizontal on mobile) */}
        {history.length > 0 && !isGenerating && (
          <div className="absolute bottom-[80px] md:right-12 md:bottom-24 flex flex-row md:flex-col gap-2 md:gap-4 animate-fadeIn overflow-x-auto max-w-full px-4 md:px-0">
            {history.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => setResult(item)}
                className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border transition-all ${result === item ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}
              >
                <img src={item.imageUrl} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Bottom Status Bar (Hidden on small mobile) */}
        <div className="absolute bottom-4 md:bottom-10 left-6 md:left-12 right-6 md:right-12 hidden sm:flex justify-between items-center text-[8px] md:text-[10px] font-black text-gray-700 tracking-[0.2em] md:tracking-[0.4em] uppercase">
          <div className="flex gap-4 md:gap-8">
            <span className="italic">CORE: {config.collectionName}</span>
            <span className="opacity-50">TMA v1.0</span>
          </div>
          <span className="font-mono opacity-50">GEN_SYNC_OK</span>
        </div>
      </main>

      <style>{`
        @keyframes scan { 0% { top: 0; opacity: 0; } 5% { opacity: 1; } 95% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        
        /* Стилизация скроллбара для Mini App */
        ::-webkit-scrollbar { width: 2px; height: 2px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default App;
