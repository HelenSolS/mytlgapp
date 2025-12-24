import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { SIGILS_CANON, ElementType } from './sigils-canon';

const twa = (window as any).Telegram?.WebApp;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [element, setElement] = useState<ElementType>('Воздух');
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${msg}`].slice(-10));
    console.log(`[SIGIL-LOG] ${msg}`);
  };

  useEffect(() => {
    if (twa) {
      twa.expand();
      twa.ready();
      twa.backgroundColor = '#020617';
      twa.headerColor = '#020617';
      addLog("Telegram TMA: Ready");
    }
    addLog(`API Key: ${process.env.API_KEY ? 'Detected' : 'MISSING'}`);
    addLog("System initialized.");
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const generateSigil = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    addLog(`Summoning ${element} sigil...`);
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY_NOT_FOUND: Ключ не передан платформой.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const elementSigils = SIGILS_CANON.filter(s => s.element === element);
      const targetSigil = elementSigils[Math.floor(Math.random() * elementSigils.length)] || SIGILS_CANON[0];

      addLog(`Selected: ${targetSigil.name}`);

      const prompt = `Ancient magical sigil of ${targetSigil.name}. 
        Visual: ${targetSigil.tz}. 
        Style: Glowing ethereal geometry on dark obsidian, ${targetSigil.aura} energy, high fantasy, artifact.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let base64Data = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Data) {
        setImage(`data:image/png;base64,${base64Data}`);
        addLog("Artifact materialized successfully.");
      } else {
        throw new Error("EMPTY_RESPONSE: Модель не вернула данные изображения.");
      }

    } catch (err: any) {
      const errMsg = err.message || "Unknown Ritual Error";
      addLog(`ERROR: ${errMsg}`);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white p-5 pt-10 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">SigilCraft</h1>
          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em] mt-1">Version 1.2.0-Elite</p>
        </div>
        <div className="flex gap-2">
          <div className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        </div>
      </div>

      {/* Artifact Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="w-full aspect-square max-w-[320px] bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative arcane-glow">
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Artifact" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-sky-400">
              <span className="text-6xl mb-2">✧</span>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">Empty Void</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="w-10 h-10 border-2 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase text-sky-500 tracking-[0.4em] animate-pulse">Ritual in progress</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl max-w-[320px]">
            <p className="text-red-400 text-[9px] font-mono text-center break-all">{error}</p>
          </div>
        )}
      </div>

      {/* Terminal Logs (The Debug Solution) */}
      <div className="h-24 mt-4 mb-4 bg-black/40 rounded-xl border border-white/5 p-3 font-mono text-[9px] overflow-y-auto no-scrollbar shadow-inner">
        <div className="text-sky-800 mb-1 uppercase font-bold tracking-widest border-b border-white/5 pb-1">Master Console</div>
        {logs.map((log, i) => (
          <div key={i} className={`${log.includes('ERROR') ? 'text-red-400' : 'text-slate-500'} mb-0.5`}>
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Controls */}
      <div className="pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
          {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'].map(el => (
            <button 
              key={el}
              onClick={() => setElement(el as any)}
              className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase transition-all border shrink-0 ${
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
          className="w-full py-5 bg-white text-black font-black rounded-3xl uppercase text-[11px] tracking-widest active:scale-95 transition-all disabled:opacity-30 shadow-xl"
        >
          {loading ? 'Communing...' : 'Summon Artifact'}
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

export default App;
