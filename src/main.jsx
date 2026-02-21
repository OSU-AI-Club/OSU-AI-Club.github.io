import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes, Route, HashRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import HackAI from './HackAI.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<App />} />
        <Route path="/hackai" element={<HackAI />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
