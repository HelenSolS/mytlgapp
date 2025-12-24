import React, { useState, useEffect } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { SigilEditor } from './components/SigilEditor';
import { AssociationEditor } from './components/AssociationEditor';
import { CardPreview } from './components/CardPreview';

declare global {
  interface Window {
    Telegram?: any;
  }
}

export const App: React.FC = () => {
  const [mode, setMode] = useState<'sigils' | 'associations'>('sigils');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const twa = window.Telegram?.WebApp;
    if (twa) {
      twa.expand();
      twa.ready();
      twa.setBackgroundColor('#020617');
      twa.setHeaderColor('#020617');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">SigilCraft</h1>
          <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">Elite TMA v1.2.0</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Mode Selector */}
        <ModeSelector mode={mode} setMode={setMode} />

        {/* Editor Panel */}
        <div className="grid md:grid-cols-2 gap-6 my-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            {mode === 'sigils' ? (
              <SigilEditor setImage={setImage} setError={setError} setLoading={setLoading} />
            ) : (
              <AssociationEditor setImage={setImage} setError={setError} setLoading={setLoading} />
            )}
          </div>

          {/* Right: Card Preview */}
          <CardPreview image={image} loading={loading} error={error} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-6 left-6 right-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm font-mono">
            {error}
          </div>
        )}
      </main>
    </div>
  );
};
