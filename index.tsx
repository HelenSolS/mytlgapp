import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import * as Api from './api-core';
import { SIGILS_CANON, ElementType } from './sigils-canon';

const twa = (window as any).Telegram?.WebApp;

const App = () => {
  const [status, setStatus] = useState<'loading' | 'auth' | 'main'>('loading');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [element, setElement] = useState<ElementType>('Воздух');

  useEffect(() => {
    const init = async () => {
      if (twa) {
        twa.expand();
        twa.ready();
      }
      const hasKey = await Api.checkAuth();
      setStatus(hasKey ? 'main' : 'auth');
    };
    init();
  }, []);

  const handleAuth = async () => {
    const success = await Api.openKeyDialog();
    if (success) setStatus('main');
  };

  const generateSigil = async () => {
    setLoading(true);
    setError(null);
    try {
      // Инициализируем AI прямо здесь, чтобы использовать актуальный ключ
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const currentSigil = SIGILS_CANON.find(s => s.element === element) || SIGILS_CANON[0];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `Mystical magical sigil: ${currentSigil.name}. Visual: ${currentSigil.tz}. Element: ${element}. Dark background, glowing lines, high quality artifact.` }]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart) {
        setImage(`data:image/png;base64,${imagePart.inlineData.data}`);
      } else {
        throw new Error("Изображение не получено. Проверьте статус биллинга.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("entity was not found") || err.message?.includes("403")) {
        setError("Ошибка доступа (403/404). Убедитесь, что в проекте Google Cloud включен Billing и привязана карта.");
      } else {
        setError(err.message || "Неизвестная ошибка генерации");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#030712] text-sky-500 font-black uppercase text-[10px] tracking-[0.3em]">
        Загрузка Системы
      </div>
    );
  }

  if (status === 'auth') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 bg-[#030712] text-center">
        <div className="text-5xl mb-6">🔐</div>
        <h1 className="text-xl font-black uppercase mb-3 italic tracking-tight">Доступ Закрыт</h1>
        <p className="text-slate-500 text-[10px] uppercase mb-8 leading-relaxed">
          Для работы Gemini 3 Pro необходим API ключ из платного проекта Google Cloud (с включенным Billing).
        </p>
        <button 
          onClick={handleAuth}
          className="w-full py-4 bg-sky-500 text-black font-black rounded-xl uppercase text-xs active:scale-95 transition-all shadow-lg shadow-sky-500/20"
        >
          Авторизоваться
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank"
          className="mt-6 text-[9px] text-slate-700 uppercase font-bold underline"
        >
          Как включить биллинг?
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#030712] p-6 pt-10 overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none italic">SigilCraft</h1>
          <p className="text-[9px] font-bold text-sky-500 uppercase tracking-widest mt-1">Artifact Factory</p>
        </div>
        <button onClick={() => setStatus('auth')} className="text-[9px] text-slate-600 font-bold uppercase border-b border-slate-800">Key</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full aspect-square max-w-[340px] bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative group">
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Sigil" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <div className="text-8xl">✧</div>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-4"></div>
              <p className="text-[9px] font-black uppercase text-sky-500 tracking-[0.4em] animate-pulse">Материализация...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="absolute -bottom-4 left-0 right-0 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-500 text-[9px] font-bold uppercase text-center leading-tight">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир'].map(el => (
            <button 
              key={el}
              onClick={() => setElement(el as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                element === el ? 'bg-sky-500 text-black' : 'bg-white/5 text-slate-500 border border-white/5'
              }`}
            >
              {el}
            </button>
          ))}
        </div>

        <button 
          onClick={generateSigil}
          disabled={loading}
          className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Создание...' : 'Выковать Артефакт'}
        </button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
