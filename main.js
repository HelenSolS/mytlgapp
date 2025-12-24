// SigilCraft Mini App - Main JavaScript
// Simple app initialization without complex dependencies

const SIGIL_SYMBOLS = '✧✦✝☆★✲✴⊙◈◇◆●○◯◌◎⬢⬡▲▼◀▶⟡⟢⟣⟤⟥⟦⟧⟨⟩⟪⟫⧀⧁⟰⟱↑↓←→↖↗↘↙⤴⤵⤶⤷↔↕↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱┌┐└┘├┤┬┴┼';
const STYLES = ['elegant', 'mystical', 'geometric', 'organic', 'cosmic'];

let appState = {
  mode: 'generator',
  symbols: '',
  style: STYLES[0],
  complexity: 50,
  energy: 50,
  savedSigils: []
};

function generateSigil() {
  const length = Math.floor((appState.complexity / 100) * 15) + 5;
  let sigil = '';
  for (let i = 0; i < length; i++) {
    sigil += SIGIL_SYMBOLS[Math.floor(Math.random() * SIGIL_SYMBOLS.length)];
  }
  appState.symbols = sigil;
  updateDisplay();
}

function saveSigil() {
  if (appState.symbols) {
    appState.savedSigils.push({...appState});
    updateDisplay();
  }
}

function updateDisplay() {
  document.getElementById('root').innerHTML = `
    <div class="app-container">
      <header class="header">
        <h1>✨ SigilCraft ✨</h1>
        <p class="subtitle">Telegram Mini App</p>
      </header>
      
      <div class="mode-selector">
        <button onclick="setMode('generator')" class="mode-btn ${appState.mode === 'generator' ? 'active' : ''}">🎲 Generator</button>
        <button onclick="setMode('editor')" class="mode-btn ${appState.mode === 'editor' ? 'active' : ''}">✏️ Editor</button>
      </div>
      
      <div class="content">
        ${appState.mode === 'generator' ? `
          <div class="section">
            <h2>Sigil Generator</h2>
            <div class="sigil-display">${appState.symbols || 'Click Generate'}</div>
            
            <div class="controls">
              <label>Complexity: ${appState.complexity}</label>
              <input type="range" min="0" max="100" value="${appState.complexity}" 
                     onchange="appState.complexity = this.value; updateDisplay()" class="slider">
            </div>
            
            <div class="controls">
              <label>Energy: ${appState.energy}</label>
              <input type="range" min="0" max="100" value="${appState.energy}" 
                     onchange="appState.energy = this.value; updateDisplay()" class="slider">
            </div>
            
            <div class="controls">
              <label>Style:</label>
              <select onchange="appState.style = this.value; updateDisplay()" class="select">
                ${STYLES.map(s => `<option value="${s}" ${s === appState.style ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
            
            <div class="button-group">
              <button onclick="generateSigil()" class="btn-primary">Generate Sigil</button>
              <button onclick="saveSigil()" class="btn-secondary">Save Sigil</button>
            </div>
          </div>
        ` : `
          <div class="section">
            <h2>Sigil Editor</h2>
            <textarea class="editor" onchange="appState.symbols = this.value">${appState.symbols}</textarea>
            <button onclick="saveSigil()" class="btn-primary">Save Sigil</button>
          </div>
        `}
        
        <div class="section">
          <h2>Saved Sigils (${appState.savedSigils.length})</h2>
          <div class="sigils-list">
            ${appState.savedSigils.length === 0 ? '<p>No saved sigils yet</p>' : 
              appState.savedSigils.map((s, i) => `
                <div class="sigil-item">
                  <div class="sigil-content">${s.symbols}</div>
                  <small>Style: ${s.style}</small>
                  <button onclick="appState.savedSigils.splice(${i}, 1); updateDisplay()" class="btn-delete">Delete</button>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function setMode(newMode) {
  appState.mode = newMode;
  updateDisplay();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  // Telegram Web App initialization
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
  }
  updateDisplay();
});

// Or init immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
  });
} else {
  updateDisplay();
}
