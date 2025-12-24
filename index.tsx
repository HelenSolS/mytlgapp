import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Краткая версия канона для стабильности при первом запуске
const ELEMENTS = ['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'] as const;
type ElementType = typeof ELEMENTS[number];

const twa = (window as any).Telegram?.WebApp;
const as = (window as any).aistudio;

const App = () => {
  const [status, setStatus] = useState<'loading' | 'auth' | 'main'>('loading');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [element, setElement] = useState<ElementType>('Воздух');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(`[SigilCraft] ${msg}`);
    setLogs(prev => [...prev.slice(-5), msg]);
  };

  useEffect(() => {
    const init = async () => {
      try {
        addLog("Запуск инициализации...");
        if (twa) {
          twa.expand();
          twa.ready();
          twa.backgroundColor = '#030712';
          twa.headerColor = '#030712';
        }

        if (!as) {
          addLog("ВНИМАНИЕ: Среда aistudio не найдена.");
        }

        const hasKey = as ? await as.hasSelectedApiKey() : false;
        addLog(hasKey ? "Ключ обнаружен" : "Ключ не выбран");
        setStatus(hasKey ? 'main' : 'auth');
      } catch (err: any) {
        addLog("Ошибка инициализации: " + err.message);
        setError("Ошибка запуска: " + err.message);
        setStatus('auth'); // Позволим попробовать нажать кнопку
      }
    };
    init();
  }, []);

  const handleAuth = async () => {
    addLog("Открытие окна выбора ключа...");
    try {
      if (as) {
        await as.openSelectKey();
        addLog("Ключ выбран, переход в главный экран.");
        setStatus('main');
      } else {
        throw new Error("Среда aistudio недоступна в этом контексте.");
      }
    } catch (e: any) {
      addLog("Ошибка выбора ключа: " + e.message);
      setError("Не удалось выбрать ключ: " + e.message);
    }
  };

  const generateSigil = async () => {
    setLoading(true);
    setError(null);
    addLog(`Запрос на генерацию: ${element}`);
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        addLog("API Ключ отсутствует в окружении.");
        throw new Error("API Ключ не найден. Переавторизуйтесь.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Mystical ancient sigil of ${element}, glowing arcane geometry, dark void background, high quality artifact.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      
      if (imagePart) {
        addLog("Изображение получено.");
        setImage(`data:image/png;base64,${imagePart.inlineData.data}`);
      } else {
        addLog("API вернул пустой ответ.");
        throw new Error("Модель не вернула изображение. Проверьте биллинг в консоли Google.");
      }
    } catch (err: any) {
      addLog("ОШИБКА: " + err.message);
      setError(err.message || "Ошибка генерации");
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#030712] text-sky-500">
        <div className="text-3xl mb-4 animate-pulse">✨</div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em]">Входим в Эфир...</div>
        <div className="mt-8 text-[8px] text-slate-600 font-mono">{logs.join(' | ')}</div>
      </div>
    );
  }

  if (status === 'auth') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-10 bg-[#030712] text-center">
        <div className="text-5xl mb-10">🛡️</div>
        <h1 className="text-xl font-black uppercase mb-4 italic tracking-tight">Нужен Ключ Доступа</h1>
        <p className="text-slate-500 text-[10px] uppercase mb-10 leading-relaxed tracking-widest">
          Gemini 3 Pro требует ключ с включенным биллингом.<br/>Без него создание артефактов невозможно.
        </p>
        <button 
          onClick={handleAuth}
          className="w-full py-5 bg-sky-500 text-black font-black rounded-2xl uppercase text-[11px] tracking-widest active:scale-95 transition-all shadow-xl shadow-sky-500/10"
        >
          ВЫБРАТЬ API КЛЮЧ
        </button>
        {error && <p className="mt-4 text-red-500 text-[9px] uppercase font-bold">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#030712] p-6 pt-12 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic leading-none tracking-tighter">SigilCraft</h1>
          <p className="text-[9px] font-bold text-sky-500 uppercase tracking-[0.3em] mt-1">Master Console</p>
        </div>
        <button onClick={() => setStatus('auth')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">🔑</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full aspect-square max-w-[340px] bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl">
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Sigil" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <span className="text-8xl">✧</span>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="w-10 h-10 border-2 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-4"></div>
              <p className="text-[9px] font-black uppercase text-sky-500 tracking-[0.4em] animate-pulse">Ритуал...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl w-full max-w-[340px]">
            <p className="text-red-500 text-[9px] font-bold uppercase text-center">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-auto pb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-4">
          {ELEMENTS.map(el => (
            <button 
              key={el}
              onClick={() => setElement(el)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                element === el ? 'bg-sky-500 border-sky-500 text-black' : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              {el}
            </button>
          ))}
        </div>

        <button 
          onClick={generateSigil}
          disabled={loading}
          className="w-full py-6 bg-white text-black font-black rounded-3xl uppercase text-[11px] tracking-widest active:scale-95 transition-all disabled:opacity-30"
        >
          {loading ? 'Взывание к Эфиру...' : 'Призвать Артефакт'}
        </button>
      </div>
    </div>
  );
};

// Безопасный рендеринг
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  }
} catch (e) {
  console.error("Mount error:", e);
}
