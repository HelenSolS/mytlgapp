
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
import ControlPanelExperimental from './components/ControlPanelExperimental';
import { generateCardImage } from './services/geminiService';

const tg = (window as any).Telegram?.WebApp;
const FIRST_SYMBOL = SIGIL_DATABASE[0];

const INITIAL_CONFIG: CardConfig = {
  mode: AppMode.SIGIL,
  collectionName: 'EXPERIMENTAL LAB',
  isMonochrome: false,
  strokeStyle: StrokeStyle.DYNAMIC,
  renderingStyle: RenderingStyle.CONVEX_3D,
  magicVibe: MagicVibe.GLOWING,
  backgroundPreset: BackgroundPreset.DARK_MINIMAL,
  showBorder: true,
  showInscription: false,
  allowAiText: false,
  selectedSymbolId: FIRST_SYMBOL.id,
  symbolNumber: '#EXP',
  symbolName: 'ЭКСПЕРИМЕНТ',
  element: FIRST_SYMBOL.element,
  visualTz: FIRST_SYMBOL.visualTz,
  auraColor: '#ff00ff', // Розовый акцент для лаборатории
  lineThickness: 2.0,
  glowIntensity: 50,
  symbolSize: 60,
  position: SymbolPosition.CENTER,
  conceptWord: ''
};

const AppExperimental: React.FC = () => {
  const [config, setConfig] = useState<CardConfig>(() => {
    // Используем другой ключ для localStorage, чтобы не мешать стабильной версии
    const saved = localStorage.getItem('sigil_config_experimental');
    if (saved) {
      try {
        return { ...INITIAL_CONFIG, ...JSON.parse(saved) };
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

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.headerColor = '#1a1a1a';
    }
  }, []);

  useEffect(() => {
    const storageConfig = { ...config };
    delete (storageConfig as any).referenceImage;
    localStorage.setItem('sigil_config_experimental', JSON.stringify(storageConfig));
  }, [config]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateCardImage(config);
      setResult(res);
      setHistory(prev => [res, ...prev].slice(0, 5));
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (err: any) {
      setError(err.message || "Ошибка экспериментального синтеза");
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#080508] overflow-hidden font-sans text-white border-4 border-fuchsia-500/20">
      {/* Метка лаборатории */}
      <div className="absolute top-0 right-0 z-50 bg-fuchsia-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl shadow-lg uppercase tracking-widest animate-pulse">
        Lab Mode (Experimental)
      </div>

      <aside className="w-full md:w-[400px] h-[50vh] md:h-full flex-shrink-0 z-20 shadow-2xl relative border-r border-fuchsia-500/10 bg-[#0d0a0d]">
        <ControlPanelExperimental 
          config={config} 
          onChange={setConfig} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
        />
      </aside>

      <main className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.05)_0%,transparent_70%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-[500px] md:max-w-[700px] aspect-square rounded-[3rem] overflow-hidden bg-black shadow-[0_0_100px_rgba(217,70,239,0.1)] border border-fuchsia-500/20 transition-all duration-700">
           {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
              <div className="w-32 h-32 border-t-2 border-fuchsia-500 rounded-full animate-spin mb-8"></div>
              <div className="text-fuchsia-400 font-black tracking-widest uppercase animate-pulse">Тестирование гипотез...</div>
            </div>
          ) : result ? (
            <img src={result.imageUrl} alt="Lab Result" className="w-full h-full object-cover p-1 animate-fadeIn" />
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
               <i className="fa-solid fa-flask-vial text-fuchsia-500 text-6xl mb-4"></i>
               <span className="uppercase tracking-[0.5em] font-black text-fuchsia-200">Sandbox Ready</span>
             </div>
          )}
          
          {error && <div className="absolute inset-0 bg-red-900/40 backdrop-blur-md flex items-center justify-center p-12 text-center font-bold text-white">{error}</div>}
        </div>
        
        {/* Кнопка быстрого возврата в стабильную версию (только для дева) */}
        <button 
          onClick={() => window.location.href = window.location.pathname}
          className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
        >
          Вернуться в стабильную версию
        </button>
      </main>
    </div>
  );
};

export default AppExperimental;
