# SigilCraft TMA - Telegram Mini App

A mystical sigil and association synthesis application built as a Telegram Mini App using React, TypeScript, and Vite.

## Features

### Dual Mode System
1. **СИГИЛЫ (Sigils Mode)**
   - Select from 8+ mystical symbols
   - Customize with element types (Воздух, Вода, Огонь, Земля, Эфир, Плетение)
   - Adjust visual parameters via sliders:
     - Symbol Size (20-90%)
     - Glow Intensity
     - Line Thickness
   - Choose artistic style (Comic, Ink, Convex 3D, Kawaii)

2. **АССОЦИАЦИИ (Associations Mode)**
   - Concept to image synthesis
   - Image-to-image transformation
   - AI text drawing integration

### Collectible Cards
- 1:1 format display
- Ornate border frame
- Engraved inscription system
- Share & save functionality

### Telegram Integration
- Native Mini App deployment
- MainButton for synthesis trigger
- Share card inline
- Full TMA WebApp API support

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Telegram Bot Token (for bot functionality)
- Gemini API Key (for image generation)

### Installation

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_GEMINI_API_KEY=your_api_key
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

### Build

```bash
npm run build
```

Output is generated in the `dist/` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── ModeSelector.tsx
│   ├── SigilEditor.tsx
│   ├── AssociationEditor.tsx
│   └── CardPreview.tsx
├── services/           # Business logic
│   ├── telegramService.ts
│   └── geminiService.ts
├── data/              # Static data
│   └── sigils.ts      # Sigil definitions & elements
├── styles/           # CSS
│   └── index.css
├── App.tsx           # Main component
└── main.tsx          # Entry point
```

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Telegram Bot API** - Mini App integration
- **Google Generative AI (Gemini)** - Image generation

## Deployment

The app auto-deploys to GitHub Pages on push to `main` via GitHub Actions workflow.

### GitHub Pages Setup

1. Go to repo Settings → Pages
2. Set source to "GitHub Actions"
3. Workflow will auto-deploy to `https://username.github.io/mytlgapp/`

### Telegram Bot Setup

1. Create bot via @BotFather
2. Set mini app webhook:
   ```
   /setmenubutton
   /setdefaultadministrator_rights
   ```
3. Deploy mini app URL to bot menu

## Development Notes

### Adding New Sigils

Edit `src/data/sigils.ts`:
```typescript
export const SIGILS: Sigil[] = [
  { 
    id: 'new-sigil-id',
    name: 'Имя сигила',
    nameEn: 'English Name',
    description: 'Description',
    elements: ['Воздух', 'Эфир'],
    symbol: '✨'
  }
]
```

### Customizing Styles

Modify `src/styles/index.css` to change color scheme and appearance.

## API Integration

### Gemini Service
Generates detailed artistic prompts based on user selections, then sends to Gemini API for image generation.

### Telegram WebApp API
Handles:
- User identification
- MainButton callbacks
- Share functionality
- App expansion & initialization

## License

MIT

## Support

For issues and feature requests, use GitHub Issues.
