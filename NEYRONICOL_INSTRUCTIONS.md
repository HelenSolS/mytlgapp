# SigilCraft Elite - Telegram Mini App
## Инструкции для neyronikol

Здравствуйте! Это подробное руководство для создания полного Telegram Mini App приложения SigilCraft Elite.

### БЫСТРЫЙ СТАРТ (через GitHub веб-интерфейс)

Создайте эти файлы в указанном порядке:

### 1. vite.config.ts
Название файла: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/mytlgapp/',
  server: { port: 5173 },
  build: { target: 'esnext' }
});
```

### 2. tsconfig.json
Название файла: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. index.html
Название файла: `index.html`

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SigilCraft Elite - Telegram Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 4. src/main.tsx
Пут: `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 5. src/types.ts
Путь: `src/types.ts`

```typescript
export type ElementType = 'Воздух' | 'Вода' | 'Огонь' | 'Земля' | 'Эфир' | 'Плетение';
export type StyleType = 'Comic' | 'Ink' | '3D' | 'Kawaii';
export type ModeType = 'sigils' | 'associations';

export interface Sigil {
  id: string;
  name: string;
  element: ElementType;
  geometry: string;
  aura: string;
}

export interface EditorState {
  mode: ModeType;
  element: ElementType;
  style: StyleType;
  symbolSize: number;
  glow: number;
  lineThickness: number;
  image?: string;
  concept?: string;
}
```

### ДАЛЕЕ:
1. Создайте папку `src/`
2. Создайте остальные файлы (App.tsx, компоненты, сервисы)
3. Выполните: `npm install && npm run build`
4. GitHub Pages автоматически задеплоит из папки `dist/`

### ВАЖНЫЕ МОМЕНТЫ:
- API_KEY передаётся через `process.env` (GitHub Secrets)
- Используется Gemini API для генерации изображений
- TWA (Telegram Web App) интегрируется через window.Telegram
- Все компоненты используют Tailwind CSS для стилизации
- Карточки имеют формат 1:1 (квадратные)

Полный код остальных файлов находится в репозитории или запросите у разработчика!
