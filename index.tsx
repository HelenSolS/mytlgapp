
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppExperimental from './AppExperimental';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Простая логика переключения: если в URL есть ?dev=1 или ?exp=1, включаем лабораторию
const isExperimental = window.location.search.includes('dev=1') || window.location.search.includes('exp=1');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isExperimental ? <AppExperimental /> : <App />}
  </React.StrictMode>
);
