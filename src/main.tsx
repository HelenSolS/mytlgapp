import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './index.tsx'
import './api-core.ts'

const root = ReactDOM.createRoot(document.getElementById('root')!)

if (window.Telegram) {
  window.Telegram.WebApp?.ready()
  window.Telegram.WebApp?.expand()
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
