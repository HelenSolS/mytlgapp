import React, { useState, useEffect } from 'react';

const SIGIL_SYMBOLS = '✧✦✝☆★✲✴⊙◈◇◆●○◯◌◎⬢⬡▲▼◀▶⟡⟢⟣⟤⟥⟦⟧⟨⟩⟪⟫⧀⧁⟰⟱↑↓←→↖↗↘↙⤴⤵⤶⤷↔↕↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱┌┐└┘├┤┬┴┼';
const STYLE_OPTIONS = ['elegant', 'mystical', 'geometric', 'organic', 'cosmic'];

type Mode = 'generator' | 'editor';

interface SigilData {
  symbols: string;
  style: string;
  complexity: number;
  energy: number;
}

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generator');
  const [sigilData, setSigilData] = useState<SigilData>({
    symbols: '',
    style: STYLE_OPTIONS[0],
    complexity: 50,
    energy: 50,
  });
  const [savedSigils, setSavedSigils] = useState<SigilData[]>([]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const generateSigil = () => {
    const length = Math.floor((sigilData.complexity / 100) * 15) + 5;
    let newSigil = '';
    for (let i = 0; i < length; i++) {
      newSigil += SIGIL_SYMBOLS.charAt(Math.floor(Math.random() * SIGIL_SYMBOLS.length));
    }
    setSigilData({ ...sigilData, symbols: newSigil });
  };

  const saveSigil = () => {
    if (sigilData.symbols) {
      setSavedSigils([...savedSigils, { ...sigilData }]);
    }
  };

  const deleteSigil = (index: number) => {
    setSavedSigils(savedSigils.filter((_, i) => i !== index));
  };

  const updateEditorSigil = (value: string) => {
    setSigilData({ ...sigilData, symbols: value });
  };

  return (
    <div className="app-container" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>✨ SigilCraft ✨</h1>
        <p style={styles.subtitle}>Telegram Mini App</p>
      </header>

      <div style={styles.modeSelector}>
        <button
          onClick={() => setMode('generator')}
          style={{
            ...styles.modeButton,
            ...(mode === 'generator' ? styles.modeButtonActive : {}),
          }}
        >
          🎲 Generator
        </button>
        <button
          onClick={() => setMode('editor')}
          style={{
            ...styles.modeButton,
            ...(mode === 'editor' ? styles.modeButtonActive : {}),
          }}
        >
          ✏️ Editor
        </button>
      </div>

      <div style={styles.content}>
        {mode === 'generator' ? (
          <div style={styles.modeSection}>
            <h2>Sigil Generator</h2>
            <div style={styles.sigilDisplay}>{sigilData.symbols}</div>

            <div style={styles.controlGroup}>
              <label>Complexity: {sigilData.complexity}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sigilData.complexity}
                onChange={(e) =>
                  setSigilData({ ...sigilData, complexity: Number(e.target.value) })
                }
                style={styles.slider}
              />
            </div>

            <div style={styles.controlGroup}>
              <label>Energy: {sigilData.energy}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sigilData.energy}
                onChange={(e) =>
                  setSigilData({ ...sigilData, energy: Number(e.target.value) })
                }
                style={styles.slider}
              />
            </div>

            <div style={styles.controlGroup}>
              <label>Style:</label>
              <select
                value={sigilData.style}
                onChange={(e) => setSigilData({ ...sigilData, style: e.target.value })}
                style={styles.select}
              >
                {STYLE_OPTIONS.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={generateSigil} style={styles.primaryButton}>
                Generate Sigil
              </button>
              <button onClick={saveSigil} style={styles.secondaryButton}>
                Save Sigil
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.modeSection}>
            <h2>Sigil Editor</h2>
            <textarea
              value={sigilData.symbols}
              onChange={(e) => updateEditorSigil(e.target.value)}
              placeholder="Enter or edit sigil symbols here..."
              style={styles.textarea}
            />
            <button onClick={saveSigil} style={styles.primaryButton}>
              Save Sigil
            </button>
          </div>
        )}

        <div style={styles.savedSection}>
          <h2>Saved Sigils ({savedSigils.length})</h2>
          <div style={styles.sigilsList}>
            {savedSigils.length === 0 ? (
              <p>No saved sigils yet</p>
            ) : (
              savedSigils.map((sigil, index) => (
                <div key={index} style={styles.sigilItem}>
                  <div style={styles.sigilContent}>{sigil.symbols}</div>
                  <small>Style: {sigil.style}</small>
                  <button
                    onClick={() => deleteSigil(index)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5em',
    margin: '0',
    textShadow: '0 0 20px rgba(100, 200, 255, 0.8)',
  },
  subtitle: {
    fontSize: '1em',
    color: '#64c8ff',
    margin: '5px 0 0 0',
  },
  modeSelector: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  modeButton: {
    padding: '10px 20px',
    border: '2px solid #64c8ff',
    background: 'transparent',
    color: '#64c8ff',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'all 0.3s ease',
  },
  modeButtonActive: {
    background: '#64c8ff',
    color: '#1a1a2e',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  modeSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px',
    border: '1px solid rgba(100, 200, 255, 0.2)',
  },
  sigilDisplay: {
    fontSize: '3em',
    textAlign: 'center',
    padding: '30px',
    background: 'rgba(100, 200, 255, 0.1)',
    borderRadius: '10px',
    marginBottom: '20px',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    wordBreak: 'break-all',
  },
  controlGroup: {
    marginBottom: '15px',
  },
  slider: {
    width: '100%',
    marginTop: '5px',
  },
  select: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    borderRadius: '5px',
    border: '1px solid #64c8ff',
    background: '#16213e',
    color: '#fff',
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #64c8ff',
    background: '#16213e',
    color: '#fff',
    fontFamily: 'monospace',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  primaryButton: {
    flex: 1,
    padding: '12px',
    background: '#64c8ff',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    color: '#64c8ff',
    border: '2px solid #64c8ff',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  deleteButton: {
    padding: '5px 10px',
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8em',
  },
  savedSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid rgba(100, 200, 255, 0.2)',
  },
  sigilsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  sigilItem: {
    background: 'rgba(100, 200, 255, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(100, 200, 255, 0.3)',
    textAlign: 'center',
  },
  sigilContent: {
    fontSize: '1.8em',
    marginBottom: '10px',
    wordBreak: 'break-all',
  },
};

export default App;
