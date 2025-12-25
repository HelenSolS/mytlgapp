// ========================================
// REACT ÐŸÐ Ð˜Ð›ÐžÐ–Ð•ÐÐ˜Ð•
// ========================================
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const { AppMode, RenderingStyle, MagicVibe, BackgroundPreset, SIGIL_DATABASE } = window;

// ========================================
// Ð¤Ð£ÐÐšÐ¦Ð˜Ð¯ Ð“Ð•ÐÐ•Ð ÐÐ¦Ð˜Ð˜ Ð˜Ð—ÐžÐ‘Ð ÐÐ–Ð•ÐÐ˜Ð¯
// ========================================
const generateCardImage = async (config, apiKey) => {
  let prompt = "";

  if (config.mode === AppMode.SIGIL) {
    const thick = config.lineThickness < 2 ? "thin" : config.lineThickness < 3.5 ? "medium" : "bold";
    const glow = config.glowIntensity < 30 ? "subtle" : config.glowIntensity < 60 ? "moderate" : "intense";
    const vibeDetails = {
      [MagicVibe.GLOWING]: "Crystalline light.",
      [MagicVibe.MYSTERIOUS]: "Dark smoke.",
      [MagicVibe.ETHEREAL]: "Cosmic particles."
    };
    const vibeDetail = vibeDetails[config.magicVibe] || "";
    const frameStyle = config.showBorder ? "Ornate frame." : "No frame.";
    const inscriptionInstruction = config.showInscription ? `Text: "${config.symbolName.toUpperCase()}"` : "No text.";
    const colorMode = config.colorMode === 'bw' ? "MONOCHROME" : config.colorMode === 'energy' ? `Energy glow ${config.auraColor}` : "VIBRANT COLOR";

    prompt = `Card 1:1. Symbol: ${config.visualTz}. Lines: ${thick}. Energy: ${glow}. ${vibeDetail} Aura: ${config.auraColor}. Background: ${config.backgroundPreset}. ${frameStyle} ${inscriptionInstruction} Color: ${colorMode}. 8k.`;
  } else {
    prompt = `Art: "${config.conceptWord}". 1:1. Minimalist. ${config.colorMode === 'bw' ? "Monochrome" : "Color"}.`;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, topK: 40, topP: 0.95 }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'ÐžÑˆÐ¸Ð±ÐºÐ°');
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

  if (imagePart?.inlineData) {
    return { imageUrl: `data:image/png;base64,${imagePart.inlineData.data}` };
  }

  throw new Error("ÐÐµÑ‚ Ð¸Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ñ");
};

// ========================================
// ÐšÐžÐœÐŸÐžÐÐ•ÐÐ¢: ÐœÐžÐ”ÐÐ›Ð¬ÐÐžÐ• ÐžÐšÐÐž API ÐšÐ›Ð®Ð§Ð
// ========================================
const ApiKeyModal = ({ onSubmit }) => {
  const [key, setKey] = useState('');

  return React.createElement('div', { className: "modal" },
    React.createElement('div', { className: "modal-content" },
      React.createElement('h2', null, 'ðŸ”‘ API Key'),
      React.createElement('p', null, 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ñ‹Ð¹ ÐºÐ»ÑŽÑ‡:'),
      React.createElement('a', { 
        href: 'https://aistudio.google.com/apikey', 
        target: '_blank' 
      }, 'aistudio.google.com/apikey'),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Ð’ÑÑ‚Ð°Ð²ÑŒ ÐºÐ»ÑŽÑ‡...',
        value: key,
        onChange: e => setKey(e.target.value)
      }),
      React.createElement('button', {
        onClick: () => {
          if (key.trim()) {
            window.setApiKey(key.trim());
            onSubmit();
          }
        }
      }, 'Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ')
    )
  );
};

// ========================================
// ÐšÐžÐœÐŸÐžÐÐ•ÐÐ¢: Ð­ÐšÐ ÐÐ ÐÐÐ¡Ð¢Ð ÐžÐ•Ðš
// ========================================
const SettingsScreen = ({ config, onChange, onGenerate }) => {
  const handleChange = (key, value) => onChange({ ...config, [key]: value });

  const onSymbolSelect = (e) => {
    const id = parseInt(e.target.value);
    const template = SIGIL_DATABASE.find(s => s.id === id);
    if (template) {
      onChange({
        ...config,
        selectedSymbolId: id,
        symbolName: template.nameRu,
        element: template.element,
        visualTz: template.visualTz,
        auraColor: template.baseColor
      });
    }
  };

  const labelClass = "text-[9px] font-bold text-gray-500 uppercase mb-2";
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white";

  return React.createElement('div', {
    className: "screen",
    style: { background: '#0a0a0a', display: 'flex', flexDirection: 'column', height: '100%' }
  },
    // Ð—Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº
    React.createElement('div', { className: "p-4 border-b border-white/5" },
      React.createElement('div', { className: "flex items-center justify-between mb-4" },
        React.createElement('h1', { className: "text-xl font-black text-white uppercase italic" }, "Sigil Craft"),
        React.createElement('i', { className: "fa-solid fa-wand-magic-sparkles text-indigo-500 text-xl" })
      ),
      // ÐŸÐµÑ€ÐµÐºÐ»ÑŽÑ‡Ð°Ñ‚ÐµÐ»ÑŒ Ñ€ÐµÐ¶Ð¸Ð¼Ð¾Ð²
      React.createElement('div', { className: "flex gap-2 p-1 bg-white/5 rounded-xl" },
        React.createElement('button', {
          onClick: () => handleChange('mode', AppMode.SIGIL),
          className: `flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg ${config.mode === AppMode.SIGIL ? 'bg-indigo-600 text-white' : 'text-gray-500'}`
        }, "Ð¡Ð¸Ð³Ð¸Ð»Ñ‹"),
        React.createElement('button', {
          onClick: () => handleChange('mode', AppMode.ASSOCIATION),
          className: `flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg ${config.mode === AppMode.ASSOCIATION ? 'bg-indigo-600 text-white' : 'text-gray-500'}`
        }, "ÐÑÑÐ¾Ñ†Ð¸Ð°Ñ†Ð¸Ð¸")
      )
    ),

    // ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸ (ÑÐºÑ€Ð¾Ð»Ð»Ð¸Ñ€ÑƒÐµÐ¼Ð°Ñ Ð¾Ð±Ð»Ð°ÑÑ‚ÑŒ)
    React.createElement('div', { className: "flex-1 overflow-y-auto p-4 space-y-4" },
      // ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÐºÐ¾Ð»Ð»ÐµÐºÑ†Ð¸Ð¸
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÐºÐ¾Ð»Ð»ÐµÐºÑ†Ð¸Ð¸ (Ð¾Ð¿Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ð¾)"),
        React.createElement('input', {
          type: 'text',
          value: config.collectionName,
          onChange: e => handleChange('collectionName', e.target.value),
          placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: Ð¥Ñ€Ð¾Ð½Ð¸ÐºÐ¸ Ð­Ñ‚ÐµÑ€Ð¸ÑÐ°",
          className: inputClass
        })
      ),

      // Ð§ÐµÐºÐ±Ð¾ÐºÑ Ð¿Ð¾ÐºÐ°Ð·Ð° Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ñ
      React.createElement('div', { className: "flex items-center gap-2 bg-white/5 p-3 rounded-lg" },
        React.createElement('input', {
          type: "checkbox",
          id: "showLabel",
          checked: config.showCardLabel,
          onChange: e => handleChange('showCardLabel', e.target.checked),
          className: "w-5 h-5 accent-indigo-500"
        }),
        React.createElement('label', {
          htmlFor: "showLabel",
          className: "text-[12px] text-gray-300"
        }, "ÐŸÐ¾ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ")
      ),

      // ÐžÐ¿Ñ†Ð¸Ð¸ Ð´Ð»Ñ Ñ€ÐµÐ¶Ð¸Ð¼Ð° Ð¡Ð¸Ð³Ð¸Ð»Ñ‹
      config.mode === AppMode.SIGIL ? React.createElement('div', { className: "space-y-4" },
        // Ð’Ñ‹Ð±Ð¾Ñ€ ÑÐ¸Ð¼Ð²Ð¾Ð»Ð°
        React.createElement('div', null,
          React.createElement('div', { className: labelClass }, "Ð¡Ð¸Ð¼Ð²Ð¾Ð»"),
          React.createElement('select', {
            value: config.selectedSymbolId,
            onChange: onSymbolSelect,
            className: inputClass
          }, SIGIL_DATABASE.map(s => 
            React.createElement('option', { key: s.id, value: s.id }, 
              `#${s.id.toString().padStart(3, '0')} â€” ${s.nameRu}`
            )
          ))
        ),

        // Ð¢Ð¾Ð»Ñ‰Ð¸Ð½Ð° Ð»Ð¸Ð½Ð¸Ð¹
        React.createElement('div', null,
          React.createElement('div', { className: labelClass },
            React.createElement('span', null, "Ð¢Ð¾Ð»Ñ‰Ð¸Ð½Ð°"),
            React.createElement('span', { className: "text-indigo-400 text-[9px] float-right" }, 
              config.lineThickness.toFixed(1) + "px"
            )
          ),
          React.createElement('input', {
            type: "range",
            min: "1",
            max: "5",
            step: "0.1",
            value: config.lineThickness,
            onChange: e => handleChange('lineThickness', parseFloat(e.target.value)),
            className: "w-full accent-indigo-500 h-2"
          })
        ),

        // Ð­Ð½ÐµÑ€Ð³Ð¸Ñ
        React.createElement('div', null,
          React.createElement('div', { className: labelClass },
            React.createElement('span', null, "Ð­Ð½ÐµÑ€Ð³Ð¸Ñ"),
            React.createElement('span', { className: "text-indigo-400 text-[9px] float-right" }, 
              config.glowIntensity + "%"
            )
          ),
          React.createElement('input', {
            type: "range",
            min: "0",
            max: "100",
            value: config.glowIntensity,
            onChange: e => handleChange('glowIntensity', parseInt(e.target.value)),
            className: "w-full accent-indigo-500 h-2"
          })
        ),

        // ÐœÐ°ÑÑˆÑ‚Ð°Ð±
        React.createElement('div', null,
          React.createElement('div', { className: labelClass },
            React.createElement('span', null, "ÐœÐ°ÑÑˆÑ‚Ð°Ð±"),
            React.createElement('span', { className: "text-indigo-400 text-[9px] float-right" }, 
              config.symbolSize + "%"
            )
          ),
          React.createElement('input', {
            type: "range",
            min: "20",
            max: "90",
            value: config.symbolSize,
            onChange: e => handleChange('symbolSize', parseInt(e.target.value)),
            className: "w-full accent-indigo-500 h-2"
          })
        )
      ) : 
      // ÐžÐ¿Ñ†Ð¸Ð¸ Ð´Ð»Ñ Ñ€ÐµÐ¶Ð¸Ð¼Ð° ÐÑÑÐ¾Ñ†Ð¸Ð°Ñ†Ð¸Ð¸
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "ÐšÐ¾Ð½Ñ†ÐµÐ¿Ñ‚"),
        React.createElement('textarea', {
          value: config.conceptWord,
          onChange: e => handleChange('conceptWord', e.target.value),
          placeholder: "ÐžÐ¿Ð¸ÑˆÐ¸ Ð¸Ð´ÐµÑŽ...",
          className: `${inputClass} min-h-[100px] resize-none`
        })
      ),

      // ÐžÐ±Ñ‰Ð¸Ðµ Ð¾Ð¿Ñ†Ð¸Ð¸
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "Ð¡Ñ‚Ð¸Ð»ÑŒ"),
        React.createElement('select', {
          value: config.renderingStyle,
          onChange: e => handleChange('renderingStyle', e.target.value),
          className: inputClass
        }, Object.values(RenderingStyle).map(v => 
          React.createElement('option', { key: v, value: v }, v)
        ))
      ),

      // Ð ÐµÐ¶Ð¸Ð¼ Ñ†Ð²ÐµÑ‚Ð°
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "Ð ÐµÐ¶Ð¸Ð¼ Ñ†Ð²ÐµÑ‚Ð°"),
        React.createElement('div', { className: "flex gap-2" },
          React.createElement('button', {
            onClick: () => handleChange('colorMode', 'full'),
            className: `flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg ${config.colorMode === 'full' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`
          }, "FULL"),
          React.createElement('button', {
            onClick: () => handleChange('colorMode', 'bw'),
            className: `flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg ${config.colorMode === 'bw' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`
          }, "B&W"),
          React.createElement('button', {
            onClick: () => handleChange('colorMode', 'energy'),
            className: `flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg ${config.colorMode === 'energy' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`
          }, "Ð­Ð½ÐµÑ€Ð³Ð¸Ñ")
        )
      ),

      // Ð’Ð¸Ð±Ñ€Ð°Ñ†Ð¸Ñ
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "Ð’Ð¸Ð±Ñ€Ð°Ñ†Ð¸Ñ"),
        React.createElement('select', {
          value: config.magicVibe,
          onChange: e => handleChange('magicVibe', e.target.value),
          className: inputClass
        }, Object.values(MagicVibe).map(v => 
          React.createElement('option', { key: v, value: v }, v)
        ))
      ),

      // Ð¤Ð¾Ð½
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "Ð¤Ð¾Ð½"),
        React.createElement('select', {
          value: config.backgroundPreset,
          onChange: e => handleChange('backgroundPreset', e.target.value),
          className: inputClass
        }, Object.values(BackgroundPreset).map(v => 
          React.createElement('option', { key: v, value: v }, v)
        ))
      ),

      // Ð¦Ð²ÐµÑ‚ Ð°ÑƒÑ€Ñ‹
      React.createElement('div', null,
        React.createElement('div', { className: labelClass }, "Ð¦Ð²ÐµÑ‚ Ð°ÑƒÑ€Ñ‹"),
        React.createElement('input', {
          type: "color",
          value: config.auraColor,
          onChange: e => handleChange('auraColor', e.target.value),
          className: "w-full h-12 rounded-lg cursor-pointer"
        })
      ),

      // Ð§ÐµÐºÐ±Ð¾ÐºÑÑ‹
      React.createElement('div', { className: "flex items-center gap-2" },
        React.createElement('input', {
          type: "checkbox",
          id: "b1",
          checked: config.showBorder,
          onChange: e => handleChange('showBorder', e.target.checked),
          className: "w-5 h-5 accent-indigo-500"
        }),
        React.createElement('label', { htmlFor: "b1", className: "text-[12px]" }, "Ð Ð°Ð¼ÐºÐ°")
      ),

      React.createElement('div', { className: "flex items-center gap-2" },
        React.createElement('input', {
          type: "checkbox",
          id: "b2",
          checked: config.showInscription,
          onChange: e => handleChange('showInscription', e.target.checked),
          className: "w-5 h-5 accent-indigo-500"
        }),
        React.createElement('label', { htmlFor: "b2", className: "text-[12px]" }, "Ð“Ñ€Ð°Ð²Ð¸Ñ€Ð¾Ð²ÐºÐ°")
      )
    ),

    // ÐšÐ½Ð¾Ð¿ÐºÐ° ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ
    React.createElement('div', { className: "p-4 border-t border-white/5" },
      React.createElement('button', {
        onClick: onGenerate,
        className: "btn-primary"
      },
        React.createElement('i', { className: "fa-solid fa-bolt mr-2" }),
        "Ð¡ÐžÐ—Ð”ÐÐ¢Ð¬"
      )
    )
  );
};

// ========================================
// ÐšÐžÐœÐŸÐžÐÐ•ÐÐ¢: Ð­ÐšÐ ÐÐ ÐžÐ–Ð˜Ð”ÐÐÐ˜Ð¯
// ========================================
const LoadingScreen = () => {
  return React.createElement('div', {
    className: "screen",
    style: { background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
    React.createElement('div', { style: { textAlign: 'center' } },
      React.createElement('div', { style: { width: '120px', height: '120px', margin: '0 auto 24px' } },
        React.createElement('svg', {
          className: "w-full h-full animate-spin",
          viewBox: "0 0 100 100"
        },
          React.createElement('circle', {
            cx: "50",
            cy: "50",
            r: "45",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "3",
            className: "text-indigo-500",
            strokeDasharray: "60 180",
            strokeLinecap: "round"
          })
        )
      ),
      React.createElement('div', {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#667eea',
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          animation: 'pulse 2s infinite'
        }
      }, "Ð¡Ð¸Ð½Ñ‚ÐµÐ·...")
    )
  );
};

// ========================================
// ÐšÐžÐœÐŸÐžÐÐ•ÐÐ¢: Ð­ÐšÐ ÐÐ Ð Ð•Ð—Ð£Ð›Ð¬Ð¢ÐÐ¢Ð
// ========================================
const ResultScreen = ({ result, config, onBack, cardCount }) => {
  const handleExport = () => {
    const link = document.createElement('a');
    link.href = result.imageUrl;
    const filename = config.collectionName 
      ? `${config.collectionName.replace(/\s+/g, '-')}-${config.symbolName}-${Date.now()}.png`
      : `${config.symbolName}-${Date.now()}.png`;
    link.download = filename;
    link.click();
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  };

  return React.createElement('div', {
    className: "screen",
    style: { background: '#050505', display: 'flex', flexDirection: 'column', height: '100%' }
  },
    // ÐŸÑ€ÐµÐ²ÑŒÑŽ ÐºÐ°Ñ€Ñ‚Ñ‹
    React.createElement('div', { className: "flex-1 flex items-center justify-center p-4" },
      React.createElement('div', {
        className: "relative w-full max-w-[90vw] aspect-square rounded-2xl overflow-hidden bg-black border border-white/10"
      },
        React.createElement('img', {
          src: result.imageUrl,
          className: "w-full h-full object-cover"
        }),

        // ÐŸÐ¾Ð´Ð¿Ð¸ÑÑŒ Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ (ÐµÑÐ»Ð¸ Ð²ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¾)
        config.showCardLabel && React.createElement('div', { className: "card-label" },
          React.createElement('div', { className: "card-label-text" },
            config.collectionName && React.createElement('div', {
              style: { fontWeight: 'bold', marginBottom: '2px' }
            }, config.collectionName.toUpperCase()),
            React.createElement('div', null, `${config.element} â€¢ ${config.symbolName}`),
            React.createElement('div', {
              style: { fontSize: '8px', marginTop: '2px', opacity: 0.7 }
            }, `${cardCount}/66 â€¢ 1:1`)
          )
        )
      )
    ),

    // ÐšÐ½Ð¾Ð¿ÐºÐ¸
    React.createElement('div', { className: "p-4 space-y-3" },
      React.createElement('button', {
        onClick: handleExport,
        className: "btn-primary"
      },
        React.createElement('i', { className: "fa-solid fa-download mr-2" }),
        "Ð¡ÐšÐÐ§ÐÐ¢Ð¬"
      ),
      React.createElement('button', {
        onClick: onBack,
        className: "btn-secondary"
      },
        React.createElement('i', { className: "fa-solid fa-arrow-left mr-2" }),
        "Ðš ÐÐÐ¡Ð¢Ð ÐžÐ™ÐšÐÐœ"
      )
    )
  );
};

// ========================================
// Ð“Ð›ÐÐ’ÐÐ«Ð™ ÐšÐžÐœÐŸÐžÐÐ•ÐÐ¢ ÐŸÐ Ð˜Ð›ÐžÐ–Ð•ÐÐ˜Ð¯
// ========================================
const FIRST_SYMBOL = SIGIL_DATABASE[0];

const App = () => {
  const [config, setConfig] = useState({
    mode: AppMode.SIGIL,
    collectionName: '',
    showCardLabel: false,
    colorMode: 'full',
    renderingStyle: RenderingStyle.CONVEX_3D,
    magicVibe: MagicVibe.GLOWING,
    backgroundPreset: BackgroundPreset.DARK_MINIMAL,
    showBorder: true,
    showInscription: false,
    selectedSymbolId: FIRST_SYMBOL.id,
    symbolName: FIRST_SYMBOL.nameRu,
    element: FIRST_SYMBOL.element,
    visualTz: FIRST_SYMBOL.visualTz,
    auraColor: FIRST_SYMBOL.baseColor,
    lineThickness: 2,
    glowIntensity: 20,
    symbolSize: 55,
    conceptWord: ''
  });

  const [screen, setScreen] = useState('settings');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(!window.getApiKey());
  const [cardCount, setCardCount] = useState(1);

  const handleGenerate = async () => {
    const apiKey = window.getApiKey();
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setScreen('loading');
    setError(null);

    try {
      const res = await generateCardImage(config, apiKey);
      setResult(res);
      setCardCount(prev => prev + 1);
      setScreen('result');
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (err) {
      setError(err.message);
      setScreen('settings');
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
  };

  const handleBack = () => {
    setScreen('settings');
    setResult(null);
  };

  return React.createElement('div', {
    style: { position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }
  },
    // ÐœÐ¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ðµ Ð¾ÐºÐ½Ð¾ API ÐºÐ»ÑŽÑ‡Ð°
    showApiKeyModal && React.createElement(ApiKeyModal, {
      onSubmit: () => setShowApiKeyModal(false)
    }),

    // Ð­ÐºÑ€Ð°Ð½Ñ‹
    screen === 'settings' && React.createElement(SettingsScreen, {
      config: config,
      onChange: setConfig,
      onGenerate: handleGenerate
    }),

    screen === 'loading' && React.createElement(LoadingScreen),

    screen === 'result' && result && React.createElement(ResultScreen, {
      result: result,
      config: config,
      onBack: handleBack,
      cardCount: cardCount
    }),

    // Ð¡Ð¾Ð¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ Ð¾Ð± Ð¾ÑˆÐ¸Ð±ÐºÐµ
    error && React.createElement('div', {
      style: {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        background: 'rgba(220, 38, 38, 0.9)',
        padding: '16px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '13px',
        textAlign: 'center',
        zIndex: 10000
      }
    }, error)
  );
};

// ========================================
// Ð—ÐÐŸÐ£Ð¡Ðš ÐŸÐ Ð˜Ð›ÐžÐ–Ð•ÐÐ˜Ð¯
// ========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

console.log('âœ… SigilCraft Mobile UX Ð·Ð°Ð¿ÑƒÑ‰ÐµÐ½!');
